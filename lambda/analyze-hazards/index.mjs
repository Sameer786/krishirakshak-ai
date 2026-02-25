import {
  RekognitionClient,
  DetectLabelsCommand,
} from '@aws-sdk/client-rekognition'

const REGION = process.env.AWS_REKOGNITION_REGION || 'ap-south-1'
const MAX_LABELS = parseInt(process.env.MAX_LABELS || '20', 10)
const MIN_CONFIDENCE = parseFloat(process.env.MIN_CONFIDENCE || '60')
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

const client = new RekognitionClient({ region: REGION })

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// ---------------------------------------------------------------------------
// Hazard pattern dictionary — 20+ agricultural hazard patterns
// Each pattern: { labels (required), absentLabels (optional), type, severity,
//   description, recommendation, hindiDescription, hindiRecommendation }
// Patterns are checked in order — first match per label set wins highest severity
// ---------------------------------------------------------------------------
const HAZARD_PATTERNS = [
  // ---- CRITICAL ----
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
    id: 'electrical_hazard',
    match: (labels) => has(labels, 'Wire', 'Cable', 'Electrical') && has(labels, 'Exposed', 'Damage', 'Broken', 'Bare'),
    severity: 'CRITICAL',
    type: 'electrical_hazard',
    description: 'Exposed wiring detected — risk of electrocution',
    recommendation: 'Do NOT touch. Turn off power at the source. Call a licensed electrician immediately.',
    hindiDescription: 'खुली तारें — बिजली के झटके का गंभीर खतरा',
    hindiRecommendation: 'छुएं नहीं। बिजली बंद करें। तुरंत इलेक्ट्रीशियन को बुलाएं।',
  },
  {
    id: 'electrical_equipment_water',
    match: (labels) => has(labels, 'Electrical', 'Wire', 'Cable', 'Pump') && has(labels, 'Water', 'Flood', 'Wet'),
    severity: 'CRITICAL',
    type: 'electrical_water_hazard',
    description: 'Electrical equipment near water — extreme electrocution risk',
    recommendation: 'Cut power immediately. Do not enter wet area. Keep everyone away.',
    hindiDescription: 'पानी के पास बिजली उपकरण — बिजली के झटके का अत्यंत खतरा',
    hindiRecommendation: 'तुरंत बिजली काटें। गीले क्षेत्र में न जाएं। सभी को दूर रखें।',
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

  // ---- HIGH ----
  {
    id: 'chemical_spill',
    match: (labels) => has(labels, 'Chemical', 'Bottle', 'Container', 'Liquid') && has(labels, 'Spill', 'Open', 'Leak', 'Pour'),
    severity: 'HIGH',
    type: 'chemical_exposure',
    description: 'Chemical exposure risk — improper storage or spill detected',
    recommendation: 'Wear PPE (gloves, mask, goggles). Contain the spill. Ventilate the area. Consult SDS/label.',
    hindiDescription: 'रासायनिक खतरा — अनुचित भंडारण या रिसाव',
    hindiRecommendation: 'PPE पहनें (दस्ताने, मास्क, चश्मा)। रिसाव रोकें। हवा आने दें। लेबल पढ़ें।',
  },
  {
    id: 'unlabeled_chemical',
    match: (labels) => has(labels, 'Container', 'Bottle', 'Drum', 'Jar') && !has(labels, 'Label', 'Text', 'Sign'),
    severity: 'HIGH',
    type: 'unlabeled_chemical',
    description: 'Unlabeled container — unknown chemical identification required',
    recommendation: 'Do not open or use. Label all containers. Follow Insecticides Act 1968 labeling requirements.',
    hindiDescription: 'बिना लेबल का कंटेनर — अज्ञात रसायन, पहचान जरूरी',
    hindiRecommendation: 'न खोलें और न उपयोग करें। सभी कंटेनरों पर लेबल लगाएं।',
  },
  {
    id: 'vehicle_damage',
    match: (labels) => has(labels, 'Tractor', 'Vehicle', 'Truck', 'Machine') && has(labels, 'Damage', 'Leak', 'Broken', 'Flat Tire'),
    severity: 'HIGH',
    type: 'vehicle_maintenance',
    description: 'Vehicle/machinery damage detected — maintenance required before use',
    recommendation: 'Do not operate until repaired. Check hydraulics, brakes, and tires. Get professional inspection.',
    hindiDescription: 'वाहन/मशीनरी में खराबी — उपयोग से पहले मरम्मत जरूरी',
    hindiRecommendation: 'मरम्मत तक न चलाएं। हाइड्रोलिक्स, ब्रेक और टायर जांचें।',
  },
  {
    id: 'unstable_structure',
    match: (labels) => has(labels, 'Building', 'Wall', 'Structure', 'Roof') && has(labels, 'Crack', 'Damage', 'Collapse', 'Broken'),
    severity: 'HIGH',
    type: 'structural_hazard',
    description: 'Structural damage detected — risk of collapse',
    recommendation: 'Keep clear of the structure. Mark the area as restricted. Get structural assessment.',
    hindiDescription: 'संरचनात्मक क्षति — गिरने का खतरा',
    hindiRecommendation: 'संरचना से दूर रहें। क्षेत्र को प्रतिबंधित चिह्नित करें।',
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
  {
    id: 'grain_storage_pest',
    match: (labels) => has(labels, 'Grain', 'Rice', 'Wheat', 'Seed', 'Sack') && has(labels, 'Insect', 'Pest', 'Rat', 'Rodent', 'Mold'),
    severity: 'HIGH',
    type: 'grain_contamination',
    description: 'Grain storage contamination — pest or mold detected',
    recommendation: 'Isolate affected grain. Check moisture levels. Use approved fumigation. Clean storage area.',
    hindiDescription: 'अनाज भंडारण में कीट या फफूंद — दूषण का खतरा',
    hindiRecommendation: 'प्रभावित अनाज अलग करें। नमी जांचें। अनुमोदित धूमन करें।',
  },

  // ---- MEDIUM ----
  {
    id: 'missing_ppe_general',
    match: (labels) => has(labels, 'Person', 'Human', 'Man', 'Woman', 'Farmer') && !has(labels, 'Helmet', 'Hard Hat', 'Gloves', 'Mask', 'Goggles', 'Safety Vest'),
    severity: 'MEDIUM',
    type: 'missing_ppe',
    description: 'Person without visible PPE — safety equipment may be needed',
    recommendation: 'Assess the task and wear appropriate PPE: helmet, gloves, mask, goggles, or safety vest as needed.',
    hindiDescription: 'व्यक्ति बिना PPE — सुरक्षा उपकरण की आवश्यकता हो सकती है',
    hindiRecommendation: 'कार्य के अनुसार उचित PPE पहनें: हेलमेट, दस्ताने, मास्क, चश्मा, या सेफ्टी वेस्ट।',
  },
  {
    id: 'pesticide_handling',
    match: (labels) => has(labels, 'Pesticide', 'Spray', 'Sprayer', 'Chemical', 'Herbicide', 'Insecticide', 'Fungicide'),
    severity: 'MEDIUM',
    type: 'chemical_handling',
    description: 'Pesticide/chemical handling activity — verify PPE and safety procedures',
    recommendation: 'Wear full PPE (mask, gloves, goggles, long sleeves). Spray downwind. Wash hands after. Follow Insecticides Act 1968.',
    hindiDescription: 'कीटनाशक/रसायन छिड़काव — PPE और सुरक्षा प्रक्रिया जांचें',
    hindiRecommendation: 'पूर्ण PPE पहनें (मास्क, दस्ताने, चश्मा, लंबी बाजू)। हवा की दिशा में छिड़काव करें। बाद में हाथ धोएं।',
  },
  {
    id: 'height_work',
    match: (labels) => has(labels, 'Ladder', 'Scaffolding', 'Roof', 'Height', 'Climbing', 'Tree'),
    severity: 'MEDIUM',
    type: 'fall_hazard',
    description: 'Working at height detected — fall risk',
    recommendation: 'Use a stable ladder or platform. Have a spotter. Wear non-slip footwear. Avoid working at height alone.',
    hindiDescription: 'ऊंचाई पर काम — गिरने का खतरा',
    hindiRecommendation: 'मजबूत सीढ़ी या प्लेटफार्म का उपयोग करें। किसी को साथ रखें। फिसलन रोधी जूते पहनें।',
  },
  {
    id: 'heavy_lifting',
    match: (labels) => has(labels, 'Person', 'Human') && has(labels, 'Sack', 'Bag', 'Heavy', 'Carrying', 'Lifting'),
    severity: 'MEDIUM',
    type: 'ergonomic_hazard',
    description: 'Heavy lifting detected — risk of back injury',
    recommendation: 'Lift with legs, not back. Use a trolley or cart for loads over 25kg. Take breaks.',
    hindiDescription: 'भारी सामान उठाना — कमर चोट का खतरा',
    hindiRecommendation: 'पैरों से उठाएं, कमर से नहीं। 25kg से अधिक के लिए ट्रॉली का उपयोग करें। बीच-बीच में आराम करें।',
  },
  {
    id: 'water_body_hazard',
    match: (labels) => has(labels, 'Water', 'Pond', 'Canal', 'River', 'Well', 'Irrigation') && has(labels, 'Person', 'Child', 'Human'),
    severity: 'MEDIUM',
    type: 'drowning_hazard',
    description: 'Person near open water body — drowning risk',
    recommendation: 'Ensure barriers around wells and canals. Supervise children. Keep rescue equipment nearby.',
    hindiDescription: 'खुले जल स्रोत के पास व्यक्ति — डूबने का खतरा',
    hindiRecommendation: 'कुओं और नहरों के चारों ओर बाड़ लगाएं। बच्चों की निगरानी करें। बचाव उपकरण पास रखें।',
  },
  {
    id: 'sun_exposure',
    match: (labels) => has(labels, 'Sun', 'Sunlight', 'Field', 'Farm', 'Outdoor') && has(labels, 'Person', 'Human', 'Farmer'),
    severity: 'MEDIUM',
    type: 'heat_stress',
    description: 'Outdoor work in sun — heat stress risk',
    recommendation: 'Take breaks every 30 minutes in shade. Drink water regularly. Wear a hat and light clothing. Avoid 12-3 PM work in summer.',
    hindiDescription: 'धूप में बाहरी काम — लू/हीट स्ट्रोक का खतरा',
    hindiRecommendation: 'हर 30 मिनट में छाया में आराम करें। पानी पीते रहें। टोपी और हल्के कपड़े पहनें। गर्मी में 12-3 बजे काम से बचें।',
  },

  // ---- LOW ----
  {
    id: 'animal_handling',
    match: (labels) => has(labels, 'Animal', 'Livestock', 'Cattle', 'Cow', 'Bull', 'Buffalo', 'Goat', 'Horse', 'Dog'),
    severity: 'LOW',
    type: 'animal_handling',
    description: 'Livestock/animal detected — maintain safe handling distance',
    recommendation: 'Approach calmly from the side. Avoid sudden movements. Watch for signs of agitation. Keep children away.',
    hindiDescription: 'पशुधन/जानवर — सुरक्षित दूरी बनाए रखें',
    hindiRecommendation: 'शांति से बगल से पहुंचें। अचानक हरकत न करें। उत्तेजना के संकेत देखें। बच्चों को दूर रखें।',
  },
  {
    id: 'general_tractor',
    match: (labels) => has(labels, 'Tractor', 'Vehicle', 'Machine', 'Harvester', 'Combine'),
    severity: 'LOW',
    type: 'machinery_general',
    description: 'Agricultural machinery detected — verify maintenance schedule',
    recommendation: 'Check oil, brakes, and lights before use. Keep bystanders clear. Never bypass safety guards.',
    hindiDescription: 'कृषि मशीनरी — रखरखाव कार्यक्रम जांचें',
    hindiRecommendation: 'उपयोग से पहले तेल, ब्रेक और लाइट जांचें। दर्शकों को दूर रखें। सुरक्षा गार्ड न हटाएं।',
  },
  {
    id: 'general_tools',
    match: (labels) => has(labels, 'Tool', 'Equipment', 'Shovel', 'Rake', 'Hoe', 'Spade', 'Plough'),
    severity: 'LOW',
    type: 'equipment_general',
    description: 'Standard agricultural equipment — check maintenance schedule',
    recommendation: 'Inspect before use. Store properly after use. Keep tools sharp and clean. Replace worn handles.',
    hindiDescription: 'सामान्य कृषि उपकरण — रखरखाव जांचें',
    hindiRecommendation: 'उपयोग से पहले जांचें। उपयोग के बाद ठीक से रखें। औजार तेज और साफ रखें।',
  },
  {
    id: 'grain_storage_general',
    match: (labels) => has(labels, 'Grain', 'Rice', 'Wheat', 'Seed', 'Sack', 'Storage', 'Warehouse', 'Silo'),
    severity: 'LOW',
    type: 'storage_general',
    description: 'Grain/seed storage — check storage conditions',
    recommendation: 'Monitor moisture (< 14%). Check for pests monthly. Ensure ventilation. Keep off the ground on pallets.',
    hindiDescription: 'अनाज/बीज भंडारण — भंडारण स्थिति जांचें',
    hindiRecommendation: 'नमी 14% से कम रखें। हर महीने कीट जांच करें। हवा का प्रबंध करें। पैलेट पर रखें।',
  },
  {
    id: 'irrigation_equipment',
    match: (labels) => has(labels, 'Pipe', 'Hose', 'Irrigation', 'Pump', 'Sprinkler', 'Drip'),
    severity: 'LOW',
    type: 'irrigation_general',
    description: 'Irrigation equipment detected — verify proper installation',
    recommendation: 'Check for leaks. Ensure electrical connections are grounded. Keep pump area dry. Inspect filters.',
    hindiDescription: 'सिंचाई उपकरण — उचित स्थापना जांचें',
    hindiRecommendation: 'रिसाव जांचें। विद्युत कनेक्शन अर्थ हो। पंप क्षेत्र सूखा रखें। फिल्टर जांचें।',
  },
  {
    id: 'open_field',
    match: (labels) => has(labels, 'Field', 'Farm', 'Crop', 'Agriculture', 'Plantation', 'Garden'),
    severity: 'LOW',
    type: 'field_general',
    description: 'Agricultural field — general safety awareness',
    recommendation: 'Watch for uneven ground. Wear sturdy footwear. Stay hydrated. Be aware of wildlife.',
    hindiDescription: 'कृषि क्षेत्र — सामान्य सुरक्षा जागरूकता',
    hindiRecommendation: 'असमान जमीन से सावधान रहें। मजबूत जूते पहनें। पानी पीते रहें। जंगली जानवरों से सतर्क रहें।',
  },
]

// ---------------------------------------------------------------------------
// Helper: check if any of the given target names exist in detected labels
// ---------------------------------------------------------------------------
function has(labelSet, ...targets) {
  const names = labelSet.map((l) => l.toLowerCase())
  return targets.some((t) => {
    const lower = t.toLowerCase()
    return names.some((n) => n.includes(lower) || lower.includes(n))
  })
}

// ---------------------------------------------------------------------------
// Determine overall risk from a list of hazards
// ---------------------------------------------------------------------------
const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function overallRisk(hazards) {
  if (hazards.length === 0) return 'NONE'
  for (const sev of SEVERITY_ORDER) {
    if (hazards.some((h) => h.severity === sev)) return sev
  }
  return 'LOW'
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function response(statusCode, body) {
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
    return response(200, { message: 'OK' })
  }

  // Parse request
  const body = parseBody(event)
  if (!body) {
    return response(400, {
      error: 'Invalid request body',
      message: 'Request body must be valid JSON with an "image" field containing base64 data.',
    })
  }

  const { image } = body

  // Validate image
  if (!image || typeof image !== 'string') {
    return response(400, {
      error: 'Missing image',
      message: 'The "image" field is required and must be a base64-encoded string.',
    })
  }

  // Strip data-URI prefix if present (e.g. "data:image/jpeg;base64,...")
  const base64Data = image.includes(',') ? image.split(',')[1] : image

  // Validate base64
  let imageBytes
  try {
    imageBytes = Buffer.from(base64Data, 'base64')
  } catch {
    return response(400, {
      error: 'Invalid image',
      message: 'Unable to decode base64 image data.',
    })
  }

  // Check size
  if (imageBytes.length > MAX_IMAGE_BYTES) {
    return response(413, {
      error: 'Image too large',
      message: `Image must be under 5 MB. Received ${(imageBytes.length / (1024 * 1024)).toFixed(1)} MB.`,
    })
  }

  if (imageBytes.length < 100) {
    return response(400, {
      error: 'Invalid image',
      message: 'Image data is too small to be a valid image.',
    })
  }

  // Call Rekognition
  try {
    const result = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: imageBytes },
        MaxLabels: MAX_LABELS,
        MinConfidence: MIN_CONFIDENCE,
      })
    )

    const detectedLabels = result.Labels || []
    const labelNames = detectedLabels.map((l) => l.Name)

    // Match hazard patterns
    const hazards = []
    const matchedIds = new Set()

    for (const pattern of HAZARD_PATTERNS) {
      if (matchedIds.has(pattern.id)) continue

      if (pattern.match(labelNames)) {
        // Find the best confidence from the labels that triggered this match
        const relevantConfidences = detectedLabels
          .filter((l) => l.Confidence >= MIN_CONFIDENCE)
          .map((l) => l.Confidence)
        const bestConfidence = relevantConfidences.length > 0
          ? Math.max(...relevantConfidences) / 100
          : 0.7

        hazards.push({
          type: pattern.type,
          severity: pattern.severity,
          confidence: Math.round(bestConfidence * 100) / 100,
          description: pattern.description,
          recommendation: pattern.recommendation,
          hindiDescription: pattern.hindiDescription,
          hindiRecommendation: pattern.hindiRecommendation,
        })
        matchedIds.add(pattern.id)
      }
    }

    // Sort by severity
    hazards.sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    )

    return response(200, {
      hazards,
      overallRisk: overallRisk(hazards),
      hazardCount: hazards.length,
      detectedLabels: detectedLabels.map((l) => ({
        name: l.Name,
        confidence: Math.round(l.Confidence * 100) / 100,
        categories: l.Categories?.map((c) => c.Name) || [],
        parents: l.Parents?.map((p) => p.Name) || [],
      })),
      analyzedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Rekognition error:', JSON.stringify({
      name: err.name,
      message: err.message,
      code: err.$metadata?.httpStatusCode,
      requestId: err.$metadata?.requestId,
    }))

    // Throttling
    if (
      err.name === 'ThrottlingException' ||
      err.name === 'ProvisionedThroughputExceededException' ||
      err.$metadata?.httpStatusCode === 429
    ) {
      return {
        statusCode: 429,
        headers: { ...CORS_HEADERS, 'Retry-After': '3' },
        body: JSON.stringify({
          error: 'Too many requests',
          message: 'Image analysis rate limit reached. Please try again in a few seconds.',
        }),
      }
    }

    // Invalid image format
    if (err.name === 'InvalidImageFormatException') {
      return response(400, {
        error: 'Invalid image format',
        message: 'The image format is not supported. Use JPEG or PNG.',
      })
    }

    // Image too large for Rekognition
    if (err.name === 'ImageTooLargeException') {
      return response(413, {
        error: 'Image too large',
        message: 'Image exceeds Rekognition size limits. Please use a smaller image.',
      })
    }

    // Access denied
    if (
      err.name === 'AccessDeniedException' ||
      err.$metadata?.httpStatusCode === 403
    ) {
      console.error('Rekognition access denied — check IAM permissions')
      return response(500, {
        error: 'Service configuration error',
        message: 'Image analysis service is not properly configured. Please try again later.',
      })
    }

    // Generic error
    return response(500, {
      error: 'Analysis failed',
      message: 'Unable to analyze the image. Please try again later.',
    })
  }
}
