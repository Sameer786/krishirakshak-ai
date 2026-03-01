import {
  RekognitionClient,
  DetectLabelsCommand,
} from '@aws-sdk/client-rekognition'

import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const REGION = process.env.AWS_REKOGNITION_REGION || 'ap-south-1'
const MAX_LABELS = parseInt(process.env.MAX_LABELS || '20', 10)
const MIN_CONFIDENCE = parseFloat(process.env.MIN_CONFIDENCE || '50')
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'apac.amazon.nova-lite-v1:0'
const BEDROCK_TIMEOUT_MS = 25000

const rekognitionClient = new RekognitionClient({ region: REGION })
const bedrockClient = new BedrockRuntimeClient({ region: REGION })

console.log('[HazardAnalysis] Region:', REGION, '| Bedrock model:', BEDROCK_MODEL_ID)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// ---------------------------------------------------------------------------
// Bedrock system prompt for hazard analysis
// ---------------------------------------------------------------------------
const BEDROCK_SYSTEM_PROMPT = `You are an agricultural safety hazard analyzer. You receive a list of objects/labels detected in a farm or agricultural photo by image recognition AI.

Your job:
1. Analyze the detected labels and determine what safety hazards exist
2. For EACH hazard, provide:
   - severity: CRITICAL, HIGH, MEDIUM, or LOW
   - confidence: a number 0-100 representing how confident you are
   - hazard name in English (short, under 10 words)
   - description in English (1 sentence, practical safety advice)
   - hazard name in Hindi
   - description in Hindi
3. Consider real-world context — for example:
   - Plastic containers/bottles/drums/jerry cans near a farm = chemical storage hazard (HIGH/CRITICAL)
   - Person without helmet/gloves/mask/goggles = missing PPE (MEDIUM/HIGH)
   - Heavy machinery/tractor/combine harvester = equipment safety risk (MEDIUM)
   - Sun/outdoor/bright light = heat stress risk (MEDIUM)
   - Water bodies/puddles = drowning/slip risk (MEDIUM)
   - Animals/livestock = animal handling safety (LOW/MEDIUM)
   - Fire/smoke/flames = fire hazard (CRITICAL)
   - Wires/cables/electrical equipment = electrical hazard (HIGH)
   - Ladder/scaffolding/height = fall risk (HIGH)
   - Dust/debris/particles = respiratory hazard (MEDIUM)
   - Snake/scorpion/insects = venomous creature hazard (HIGH)
   - Stored chemicals without labels = chemical hazard (CRITICAL)
   - Rusted/damaged tools = equipment injury risk (MEDIUM)
4. Be smart about combinations — containers + outdoor + no PPE = higher overall risk
5. Return 1-5 hazards maximum, most critical first
6. NEVER return zero hazards — always find at least 1 safety observation

RESPOND ONLY IN THIS EXACT JSON FORMAT, no other text, no markdown, no backticks:
{
  "overallRisk": "CRITICAL",
  "hazards": [
    {
      "severity": "HIGH",
      "confidence": 95,
      "en": { "name": "Chemical storage hazard", "description": "Unprotected chemical containers detected. Ensure proper labeling, ventilation, and PPE when handling." },
      "hi": { "name": "रासायनिक भंडारण खतरा", "description": "असुरक्षित रासायनिक कंटेनर पाए गए। उचित लेबलिंग, हवादार जगह और PPE सुनिश्चित करें।" }
    }
  ]
}`

// ---------------------------------------------------------------------------
// Fallback: hardcoded hazard pattern matching (kept as safety net)
// ---------------------------------------------------------------------------
const HAZARD_PATTERNS = [
  // CRITICAL
  {
    id: 'corroded_equipment',
    match: (labels) => has(labels, 'Tool', 'Equipment', 'Metal') && has(labels, 'Rust', 'Corrosion', 'Corroded'),
    severity: 'CRITICAL',
    type: 'corroded_equipment',
    description: 'Corroded metal detected — risk of tetanus and structural failure',
    recommendation: 'Replace immediately. Do not use corroded tools. Ensure tetanus vaccination is up to date.',
    hindiDescription: 'जंग लगा उपकरण — टेटनस और टूटने का खतरा',
    hindiRecommendation: 'तुरंत बदलें। जंग लगे उपकरण का उपयोग न करें। टेटनस का टीका लगवाएं।',
  },
  {
    id: 'fire_hazard',
    match: (labels) => has(labels, 'Fire', 'Flame', 'Smoke', 'Burning'),
    severity: 'CRITICAL',
    type: 'fire_hazard',
    description: 'Fire or smoke detected — immediate danger',
    recommendation: 'Evacuate the area. Call fire services (101). Do not attempt to fight large fires alone.',
    hindiDescription: 'आग या धुआं — तत्काल खतरा',
    hindiRecommendation: 'क्षेत्र खाली करें। फायर सर्विस (101) को कॉल करें। अकेले बड़ी आग न बुझाएं।',
  },
  // HIGH
  {
    id: 'chemical_spill',
    match: (labels) => has(labels, 'Chemical', 'Bottle', 'Container', 'Liquid') && has(labels, 'Spill', 'Open', 'Leak', 'Pour'),
    severity: 'HIGH',
    type: 'chemical_exposure',
    description: 'Chemical exposure risk — improper storage or spill detected',
    recommendation: 'Wear PPE (gloves, mask, goggles). Contain the spill. Ventilate the area.',
    hindiDescription: 'रासायनिक खतरा — अनुचित भंडारण या रिसाव',
    hindiRecommendation: 'PPE पहनें (दस्ताने, मास्क, चश्मा)। रिसाव रोकें। हवा आने दें।',
  },
  {
    id: 'unlabeled_chemical',
    match: (labels) => has(labels, 'Container', 'Bottle', 'Drum', 'Jar') && !has(labels, 'Label', 'Text', 'Sign'),
    severity: 'HIGH',
    type: 'unlabeled_chemical',
    description: 'Unlabeled container — unknown chemical identification required',
    recommendation: 'Do not open or use. Label all containers. Follow Insecticides Act 1968.',
    hindiDescription: 'बिना लेबल का कंटेनर — अज्ञात रसायन, पहचान जरूरी',
    hindiRecommendation: 'न खोलें और न उपयोग करें। सभी कंटेनरों पर लेबल लगाएं।',
  },
  {
    id: 'sharp_blade_exposed',
    match: (labels) => has(labels, 'Blade', 'Knife', 'Sickle', 'Axe', 'Sharp') && !has(labels, 'Sheath', 'Cover', 'Case'),
    severity: 'HIGH',
    type: 'sharp_tool_exposed',
    description: 'Exposed sharp tool — laceration risk',
    recommendation: 'Store with blade guard or sheath. Keep away from children. Handle with gloves.',
    hindiDescription: 'खुला तेज धार वाला औजार — कटने का खतरा',
    hindiRecommendation: 'ब्लेड गार्ड या खोल में रखें। बच्चों से दूर रखें। दस्ताने पहनकर इस्तेमाल करें।',
  },
  // MEDIUM
  {
    id: 'missing_ppe_general',
    match: (labels) => has(labels, 'Person', 'Human', 'Man', 'Woman', 'Farmer') && !has(labels, 'Helmet', 'Hard Hat', 'Gloves', 'Mask', 'Goggles', 'Safety Vest'),
    severity: 'MEDIUM',
    type: 'missing_ppe',
    description: 'Person without visible PPE — safety equipment may be needed',
    recommendation: 'Assess the task and wear appropriate PPE: helmet, gloves, mask, goggles, or safety vest.',
    hindiDescription: 'व्यक्ति बिना PPE — सुरक्षा उपकरण की आवश्यकता हो सकती है',
    hindiRecommendation: 'कार्य के अनुसार उचित PPE पहनें: हेलमेट, दस्ताने, मास्क, चश्मा, या सेफ्टी वेस्ट।',
  },
  {
    id: 'pesticide_handling',
    match: (labels) => has(labels, 'Pesticide', 'Spray', 'Sprayer', 'Chemical', 'Herbicide', 'Insecticide'),
    severity: 'MEDIUM',
    type: 'chemical_handling',
    description: 'Pesticide/chemical handling activity — verify PPE and safety procedures',
    recommendation: 'Wear full PPE. Spray downwind. Wash hands after. Follow Insecticides Act 1968.',
    hindiDescription: 'कीटनाशक/रसायन छिड़काव — PPE और सुरक्षा प्रक्रिया जांचें',
    hindiRecommendation: 'पूर्ण PPE पहनें। हवा की दिशा में छिड़काव करें। बाद में हाथ धोएं।',
  },
  {
    id: 'height_work',
    match: (labels) => has(labels, 'Ladder', 'Scaffolding', 'Roof', 'Height', 'Climbing', 'Tree'),
    severity: 'MEDIUM',
    type: 'fall_hazard',
    description: 'Working at height detected — fall risk',
    recommendation: 'Use a stable ladder. Have a spotter. Wear non-slip footwear.',
    hindiDescription: 'ऊंचाई पर काम — गिरने का खतरा',
    hindiRecommendation: 'मजबूत सीढ़ी का उपयोग करें। किसी को साथ रखें। फिसलन रोधी जूते पहनें।',
  },
  {
    id: 'sun_exposure',
    match: (labels) => has(labels, 'Sun', 'Sunlight', 'Field', 'Farm', 'Outdoor') && has(labels, 'Person', 'Human', 'Farmer'),
    severity: 'MEDIUM',
    type: 'heat_stress',
    description: 'Outdoor work in sun — heat stress risk',
    recommendation: 'Take breaks every 30 minutes in shade. Drink water regularly. Wear hat and light clothing.',
    hindiDescription: 'धूप में बाहरी काम — लू/हीट स्ट्रोक का खतरा',
    hindiRecommendation: 'हर 30 मिनट में छाया में आराम करें। पानी पीते रहें। टोपी और हल्के कपड़े पहनें।',
  },
  // LOW
  {
    id: 'animal_handling',
    match: (labels) => has(labels, 'Animal', 'Livestock', 'Cattle', 'Cow', 'Bull', 'Buffalo', 'Goat', 'Horse', 'Dog'),
    severity: 'LOW',
    type: 'animal_handling',
    description: 'Livestock/animal detected — maintain safe handling distance',
    recommendation: 'Approach calmly from the side. Avoid sudden movements. Keep children away.',
    hindiDescription: 'पशुधन/जानवर — सुरक्षित दूरी बनाए रखें',
    hindiRecommendation: 'शांति से बगल से पहुंचें। अचानक हरकत न करें। बच्चों को दूर रखें।',
  },
  {
    id: 'general_tractor',
    match: (labels) => has(labels, 'Tractor', 'Vehicle', 'Machine', 'Harvester', 'Combine'),
    severity: 'LOW',
    type: 'machinery_general',
    description: 'Agricultural machinery detected — verify maintenance schedule',
    recommendation: 'Check oil, brakes, and lights before use. Keep bystanders clear.',
    hindiDescription: 'कृषि मशीनरी — रखरखाव कार्यक्रम जांचें',
    hindiRecommendation: 'उपयोग से पहले तेल, ब्रेक और लाइट जांचें। दर्शकों को दूर रखें।',
  },
  {
    id: 'open_field',
    match: (labels) => has(labels, 'Field', 'Farm', 'Crop', 'Agriculture', 'Plantation', 'Garden'),
    severity: 'LOW',
    type: 'field_general',
    description: 'Agricultural field — general safety awareness',
    recommendation: 'Watch for uneven ground. Wear sturdy footwear. Stay hydrated.',
    hindiDescription: 'कृषि क्षेत्र — सामान्य सुरक्षा जागरूकता',
    hindiRecommendation: 'असमान जमीन से सावधान रहें। मजबूत जूते पहनें। पानी पीते रहें।',
  },
]

// ---------------------------------------------------------------------------
// Helper: check if any target names exist in detected labels
// ---------------------------------------------------------------------------
function has(labelSet, ...targets) {
  const names = labelSet.map((l) => l.toLowerCase())
  return targets.some((t) => {
    const lower = t.toLowerCase()
    return names.some((n) => n.includes(lower) || lower.includes(n))
  })
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function overallRisk(hazards) {
  if (hazards.length === 0) return 'NONE'
  for (const sev of SEVERITY_ORDER) {
    if (hazards.some((h) => h.severity === sev)) return sev
  }
  return 'LOW'
}

// ---------------------------------------------------------------------------
// Fallback: use hardcoded pattern matching
// ---------------------------------------------------------------------------
function fallbackAnalysis(detectedLabels) {
  const labelNames = detectedLabels.map((l) => l.Name)
  const hazards = []
  const matchedIds = new Set()

  for (const pattern of HAZARD_PATTERNS) {
    if (matchedIds.has(pattern.id)) continue
    if (pattern.match(labelNames)) {
      const relevantConfidences = detectedLabels
        .filter((l) => l.Confidence >= MIN_CONFIDENCE)
        .map((l) => l.Confidence)
      const bestConfidence = relevantConfidences.length > 0
        ? Math.max(...relevantConfidences) / 100
        : 0.7

      hazards.push({
        severity: pattern.severity,
        confidence: Math.round(bestConfidence * 100) / 100,
        description: pattern.description,
        recommendation: pattern.recommendation,
        hindiDescription: pattern.hindiDescription,
        hindiRecommendation: pattern.hindiRecommendation,
        name: pattern.description.split('—')[0]?.trim() || pattern.description,
        name_hi: pattern.hindiDescription.split('—')[0]?.trim() || pattern.hindiDescription,
      })
      matchedIds.add(pattern.id)
    }
  }

  hazards.sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )

  return hazards
}

// ---------------------------------------------------------------------------
// Step 2: Send labels to Bedrock for intelligent hazard analysis
// ---------------------------------------------------------------------------
async function analyzeWithBedrock(rekognitionLabels) {
  const labelList = rekognitionLabels
    .map((l) => `${l.Name} (${Math.round(l.Confidence)}%)`)
    .join(', ')

  const userMessage = `Detected objects in farm/agricultural photo with confidence scores: ${labelList}.\nAnalyze these for agricultural safety hazards and respond in JSON only.`

  console.log('[Bedrock] Prompt:', userMessage)

  const bedrockResponse = await bedrockClient.send(
    new ConverseCommand({
      modelId: BEDROCK_MODEL_ID,
      system: [{ text: BEDROCK_SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.2,
      },
    })
  )

  const rawText = bedrockResponse.output?.message?.content?.[0]?.text || ''
  console.log('[Bedrock] Raw response:', rawText)

  // Strip any markdown backticks if present
  let jsonText = rawText.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  }

  const parsed = JSON.parse(jsonText)

  // Validate the parsed structure
  if (!parsed.hazards || !Array.isArray(parsed.hazards) || parsed.hazards.length === 0) {
    throw new Error('Bedrock returned empty or invalid hazards array')
  }

  // Map to frontend-compatible format
  const hazards = parsed.hazards.map((h) => ({
    severity: h.severity,
    confidence: Math.round(h.confidence) / 100, // normalize 0-100 → 0-1
    description: h.en?.name || 'Safety hazard detected',
    recommendation: h.en?.description || 'Follow standard safety procedures.',
    hindiDescription: h.hi?.name || 'सुरक्षा खतरा पाया गया',
    hindiRecommendation: h.hi?.description || 'मानक सुरक्षा प्रक्रियाओं का पालन करें।',
    name: h.en?.name || 'Safety hazard',
    name_hi: h.hi?.name || 'सुरक्षा खतरा',
    description_hi: h.hi?.description || '',
  }))

  console.log('[Bedrock] Parsed hazards:', hazards.length, 'overallRisk:', parsed.overallRisk)

  return {
    overallRisk: parsed.overallRisk || overallRisk(hazards),
    hazards,
  }
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  }
}

function parseBody(event) {
  if (!event.body) return null
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Lambda handler
// ---------------------------------------------------------------------------
export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return jsonResponse(200, { message: 'OK' })
  }

  // Parse request
  const body = parseBody(event)
  if (!body) {
    return jsonResponse(400, {
      error: 'Invalid request body',
      message: 'Request body must be valid JSON with an "image" field containing base64 data.',
    })
  }

  const { image } = body

  // Validate image
  if (!image || typeof image !== 'string') {
    return jsonResponse(400, {
      error: 'Missing image',
      message: 'The "image" field is required and must be a base64-encoded string.',
    })
  }

  // Strip data-URI prefix if present
  const base64Data = image.includes(',') ? image.split(',')[1] : image

  // Decode base64
  let imageBytes
  try {
    imageBytes = Buffer.from(base64Data, 'base64')
  } catch {
    return jsonResponse(400, {
      error: 'Invalid image',
      message: 'Unable to decode base64 image data.',
    })
  }

  // Check size
  if (imageBytes.length > MAX_IMAGE_BYTES) {
    return jsonResponse(413, {
      error: 'Image too large',
      message: `Image must be under 5 MB. Received ${(imageBytes.length / (1024 * 1024)).toFixed(1)} MB.`,
    })
  }

  if (imageBytes.length < 100) {
    return jsonResponse(400, {
      error: 'Invalid image',
      message: 'Image data is too small to be a valid image.',
    })
  }

  // =========================================================================
  // STEP 1: Rekognition — detect labels in the image
  // =========================================================================
  let detectedLabels = []
  try {
    console.log('[Step 1] Calling Rekognition DetectLabels...')

    const result = await rekognitionClient.send(
      new DetectLabelsCommand({
        Image: { Bytes: imageBytes },
        MaxLabels: MAX_LABELS,
        MinConfidence: MIN_CONFIDENCE,
      })
    )

    detectedLabels = result.Labels || []
    console.log('[Step 1] Rekognition labels:', detectedLabels.map((l) => `${l.Name} (${Math.round(l.Confidence)}%)`).join(', '))

  } catch (err) {
    console.error('[Step 1] Rekognition error:', JSON.stringify({
      name: err.name,
      message: err.message,
      code: err.$metadata?.httpStatusCode,
    }))

    // Handle specific Rekognition errors
    if (err.name === 'ThrottlingException' || err.$metadata?.httpStatusCode === 429) {
      return {
        statusCode: 429,
        headers: { ...CORS_HEADERS, 'Retry-After': '3' },
        body: JSON.stringify({
          error: 'Too many requests',
          message: 'Image analysis rate limit reached. Please try again in a few seconds.',
        }),
      }
    }

    if (err.name === 'InvalidImageFormatException') {
      return jsonResponse(400, {
        error: 'Invalid image format',
        message: 'The image format is not supported. Use JPEG or PNG.',
      })
    }

    if (err.name === 'ImageTooLargeException') {
      return jsonResponse(413, {
        error: 'Image too large',
        message: 'Image exceeds Rekognition size limits. Please use a smaller image.',
      })
    }

    if (err.name === 'AccessDeniedException' || err.$metadata?.httpStatusCode === 403) {
      console.error('[Step 1] Rekognition access denied — check IAM permissions')
      return jsonResponse(500, {
        error: 'Service configuration error',
        message: 'Image analysis service is not properly configured. Please try again later.',
      })
    }

    return jsonResponse(500, {
      error: 'Analysis failed',
      message: 'Unable to analyze the image. Please try again later.',
    })
  }

  // Format labels for response
  const rekognitionLabels = detectedLabels.map((l) => ({
    name: l.Name,
    confidence: Math.round(l.Confidence * 100) / 100,
    categories: l.Categories?.map((c) => c.Name) || [],
    parents: l.Parents?.map((p) => p.Name) || [],
  }))

  // =========================================================================
  // STEP 2 + 3: Send labels to Bedrock for intelligent analysis
  // =========================================================================
  try {
    console.log('[Step 2] Calling Bedrock for hazard analysis...')

    // Race Bedrock against a timeout
    const bedrockResult = await Promise.race([
      analyzeWithBedrock(detectedLabels),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bedrock timeout')), BEDROCK_TIMEOUT_MS)
      ),
    ])

    console.log('[Step 3] Bedrock analysis complete:', {
      overallRisk: bedrockResult.overallRisk,
      hazardCount: bedrockResult.hazards.length,
    })

    return jsonResponse(200, {
      success: true,
      hazards: bedrockResult.hazards,
      overallRisk: bedrockResult.overallRisk,
      hazardCount: bedrockResult.hazards.length,
      detectedLabels: rekognitionLabels,
      labels: rekognitionLabels,
      source: 'rekognition-nova-hybrid',
      analyzedAt: new Date().toISOString(),
    })

  } catch (bedrockErr) {
    // =========================================================================
    // STEP 4: Fallback to hardcoded pattern matching
    // =========================================================================
    console.error('[Step 4] Bedrock failed, using fallback:', {
      name: bedrockErr.name,
      message: bedrockErr.message,
    })

    const fallbackHazards = fallbackAnalysis(detectedLabels)

    return jsonResponse(200, {
      success: true,
      hazards: fallbackHazards,
      overallRisk: overallRisk(fallbackHazards),
      hazardCount: fallbackHazards.length,
      detectedLabels: rekognitionLabels,
      labels: rekognitionLabels,
      source: 'rekognition-fallback',
      analyzedAt: new Date().toISOString(),
    })
  }
}
