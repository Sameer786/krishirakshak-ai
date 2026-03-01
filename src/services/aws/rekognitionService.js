import axios from 'axios'
import { API_GATEWAY_URL, DEMO_MODE } from './config'

const REKOGNITION_TIMEOUT_MS = 20000
const MAX_RETRIES = 2

// ---------------------------------------------------------------------------
// Mock hazard scenario sets
// ---------------------------------------------------------------------------
const SCENARIO_SETS = [
  // SET A — Tractor / Machinery
  {
    id: 'machinery',
    hazards: [
      {
        type: 'pto_guard_missing',
        severity: 'CRITICAL',
        description: 'Missing safety guard on PTO shaft — entanglement risk',
        recommendation: 'Stop the tractor immediately. Install PTO shield before operating. Never approach a spinning PTO.',
        hindiDescription: 'PTO शाफ्ट पर सुरक्षा गार्ड गायब — उलझने का खतरा',
        hindiRecommendation: 'ट्रैक्टर तुरंत बंद करें। चलाने से पहले PTO शील्ड लगाएं। घूमते PTO के पास न जाएं।',
      },
      {
        type: 'worn_brakes',
        severity: 'HIGH',
        description: 'Worn brake pads detected — reduced stopping power',
        recommendation: 'Do not operate on slopes. Get brakes serviced before next use. Check brake fluid level.',
        hindiDescription: 'ब्रेक पैड घिसे हुए — रुकने की क्षमता कम',
        hindiRecommendation: 'ढलान पर न चलाएं। अगले उपयोग से पहले ब्रेक सर्विस कराएं। ब्रेक ऑयल जांचें।',
      },
      {
        type: 'low_tire_pressure',
        severity: 'MEDIUM',
        description: 'Tire pressure appears low — stability risk on uneven ground',
        recommendation: 'Check and inflate tires to recommended PSI. Inspect for punctures or slow leaks.',
        hindiDescription: 'टायर का दबाव कम लग रहा है — असमान जमीन पर स्थिरता का खतरा',
        hindiRecommendation: 'टायर का दबाव जांचें और सही PSI तक हवा भरें। पंचर या धीमे रिसाव की जांच करें।',
      },
      {
        type: 'minor_rust',
        severity: 'LOW',
        description: 'Minor rust on body panel — cosmetic but monitor for spread',
        recommendation: 'Sand and repaint affected area. Apply rust-preventive coating. Check again in 30 days.',
        hindiDescription: 'बॉडी पैनल पर हल्की जंग — निगरानी करें कि फैले नहीं',
        hindiRecommendation: 'प्रभावित क्षेत्र को घिसकर पेंट करें। जंग-रोधी कोटिंग लगाएं। 30 दिन बाद फिर जांचें।',
      },
    ],
  },

  // SET B — Pesticide / Chemical
  {
    id: 'chemical',
    hazards: [
      {
        type: 'expired_pesticide',
        severity: 'CRITICAL',
        description: 'Expired pesticide container — toxic decomposition risk',
        recommendation: 'Do NOT use. Dispose through authorized hazardous waste facility. Wear full PPE while handling.',
        hindiDescription: 'एक्सपायर्ड कीटनाशक — विषाक्त विघटन का खतरा',
        hindiRecommendation: 'उपयोग न करें। अधिकृत खतरनाक अपशिष्ट सुविधा से निपटान करें। पूर्ण PPE पहनें।',
      },
      {
        type: 'improper_chemical_storage',
        severity: 'HIGH',
        description: 'Improper chemical storage — no ventilation detected',
        recommendation: 'Move chemicals to a well-ventilated, locked storage area. Keep away from food and water sources.',
        hindiDescription: 'रसायनों का अनुचित भंडारण — हवा का प्रबंध नहीं',
        hindiRecommendation: 'रसायनों को हवादार, बंद भंडारण क्षेत्र में रखें। खाने और पानी से दूर रखें।',
      },
      {
        type: 'missing_ppe_chemical',
        severity: 'MEDIUM',
        description: 'Missing PPE for chemical handling — exposure risk',
        recommendation: 'Wear chemical-resistant gloves, mask (N95 or better), goggles, and long-sleeved clothing before handling.',
        hindiDescription: 'रसायन हैंडलिंग के लिए PPE गायब — संपर्क का खतरा',
        hindiRecommendation: 'रसायन-प्रतिरोधी दस्ताने, मास्क (N95 या बेहतर), चश्मा और लंबी बाजू के कपड़े पहनें।',
      },
      {
        type: 'worn_label',
        severity: 'LOW',
        description: 'Container label partially worn — identification difficulty',
        recommendation: 'Re-label the container immediately with product name, hazard class, and date. Follow Insecticides Act 1968.',
        hindiDescription: 'कंटेनर का लेबल आंशिक रूप से घिसा — पहचान में कठिनाई',
        hindiRecommendation: 'कंटेनर पर तुरंत नया लेबल लगाएं — उत्पाद नाम, खतरा वर्ग और तारीख लिखें।',
      },
    ],
  },

  // SET C — General Farm
  {
    id: 'general_farm',
    hazards: [
      {
        type: 'exposed_wiring',
        severity: 'HIGH',
        description: 'Exposed electrical wiring — electrocution risk',
        recommendation: 'Do NOT touch. Turn off power at the mains. Get a licensed electrician to repair immediately.',
        hindiDescription: 'खुली बिजली की तारें — बिजली के झटके का खतरा',
        hindiRecommendation: 'छुएं नहीं। मेन से बिजली बंद करें। तुरंत लाइसेंस प्राप्त इलेक्ट्रीशियन से मरम्मत कराएं।',
      },
      {
        type: 'slippery_surface',
        severity: 'MEDIUM',
        description: 'Slippery surface near irrigation area — fall risk',
        recommendation: 'Install non-slip mats or gravel. Wear rubber boots with grip soles. Add warning signs.',
        hindiDescription: 'सिंचाई क्षेत्र के पास फिसलन भरी सतह — गिरने का खतरा',
        hindiRecommendation: 'एंटी-स्लिप मैट या बजरी बिछाएं। ग्रिप वाले रबर बूट पहनें। चेतावनी के संकेत लगाएं।',
      },
      {
        type: 'no_first_aid',
        severity: 'MEDIUM',
        description: 'No first aid kit visible in work area',
        recommendation: 'Place a stocked first aid kit within 2 minutes walk. Include bandages, antiseptic, snake bite kit, and ORS packets.',
        hindiDescription: 'कार्य क्षेत्र में प्राथमिक चिकित्सा किट दिखाई नहीं दे रही',
        hindiRecommendation: '2 मिनट की पैदल दूरी पर भरी हुई फर्स्ट एड किट रखें। पट्टी, एंटीसेप्टिक, सर्पदंश किट और ORS शामिल करें।',
      },
      {
        type: 'debris_path',
        severity: 'LOW',
        description: 'Debris in walking path — trip hazard',
        recommendation: 'Clear the path of loose tools, stones, and crop waste. Maintain daily housekeeping routine.',
        hindiDescription: 'रास्ते में कचरा/मलबा — ठोकर लगने का खतरा',
        hindiRecommendation: 'रास्ते से ढीले औजार, पत्थर और फसल अवशेष हटाएं। रोज सफाई की आदत बनाएं।',
      },
    ],
  },

  // SET D — Storage / Warehouse
  {
    id: 'storage',
    hazards: [
      {
        type: 'unstable_stacking',
        severity: 'HIGH',
        description: 'Unstable stacking of grain sacks — collapse risk',
        recommendation: 'Re-stack in pyramid pattern. Max 10 sacks high. Keep aisles clear for escape routes.',
        hindiDescription: 'अनाज की बोरियों का अस्थिर ढेर — गिरने का खतरा',
        hindiRecommendation: 'पिरामिड पैटर्न में दोबारा लगाएं। अधिकतम 10 बोरी ऊंची। भागने के रास्ते खाली रखें।',
      },
      {
        type: 'poor_ventilation',
        severity: 'MEDIUM',
        description: 'Poor ventilation in storage area — fumigant gas risk',
        recommendation: 'Open windows and doors. Install exhaust fans. Never enter recently fumigated storage without gas mask.',
        hindiDescription: 'भंडारण क्षेत्र में खराब हवा — धूमन गैस का खतरा',
        hindiRecommendation: 'खिड़कियां और दरवाजे खोलें। एग्जॉस्ट फैन लगाएं। हाल ही में धूमन किए गए भंडार में गैस मास्क के बिना न जाएं।',
      },
      {
        type: 'rodent_signs',
        severity: 'MEDIUM',
        description: 'Signs of rodent activity — crop contamination risk',
        recommendation: 'Set traps. Seal entry holes with cement or metal mesh. Store grain on raised pallets.',
        hindiDescription: 'चूहों की गतिविधि के संकेत — फसल दूषण का खतरा',
        hindiRecommendation: 'जाल लगाएं। सीमेंट या धातु जाली से छेद बंद करें। अनाज ऊंचे पैलेट पर रखें।',
      },
      {
        type: 'missing_fire_extinguisher',
        severity: 'LOW',
        description: 'No fire extinguisher near storage — fire response gap',
        recommendation: 'Install ABC-type fire extinguisher within 15 meters. Check expiry every 6 months.',
        hindiDescription: 'भंडारण के पास अग्निशामक नहीं — आग से बचाव में कमी',
        hindiRecommendation: '15 मीटर के भीतर ABC-प्रकार का अग्निशामक लगाएं। हर 6 महीने में एक्सपायरी जांचें।',
      },
    ],
  },

  // SET E — Livestock / Animal
  {
    id: 'livestock',
    hazards: [
      {
        type: 'aggressive_animal',
        severity: 'HIGH',
        description: 'Large livestock without restraint — trampling/goring risk',
        recommendation: 'Use nose ropes or halters. Approach from the side, not behind. Keep children and untrained persons away.',
        hindiDescription: 'बड़े पशु बिना बंधन — कुचलने/सींग मारने का खतरा',
        hindiRecommendation: 'नकेल या रस्सी का उपयोग करें। बगल से पहुंचें, पीछे से नहीं। बच्चों और अप्रशिक्षित लोगों को दूर रखें।',
      },
      {
        type: 'animal_waste',
        severity: 'MEDIUM',
        description: 'Animal waste accumulation — disease and slip hazard',
        recommendation: 'Clean daily. Compost waste properly. Wear rubber boots. Wash hands thoroughly after contact.',
        hindiDescription: 'पशु अपशिष्ट का जमाव — बीमारी और फिसलने का खतरा',
        hindiRecommendation: 'रोज सफाई करें। अपशिष्ट को ठीक से खाद बनाएं। रबर बूट पहनें। संपर्क के बाद हाथ अच्छी तरह धोएं।',
      },
      {
        type: 'broken_fence',
        severity: 'MEDIUM',
        description: 'Broken fencing around livestock area — escape risk',
        recommendation: 'Repair immediately with sturdy posts and wire. Check perimeter daily. Plan for emergency containment.',
        hindiDescription: 'पशु क्षेत्र के चारों ओर टूटी बाड़ — भागने का खतरा',
        hindiRecommendation: 'मजबूत खंभों और तार से तुरंत मरम्मत करें। रोज परिधि जांचें।',
      },
      {
        type: 'feed_storage_open',
        severity: 'LOW',
        description: 'Animal feed stored in open — contamination and pest risk',
        recommendation: 'Store feed in sealed containers or covered bins. Keep dry. Check for mold before feeding.',
        hindiDescription: 'खुले में रखा पशु चारा — दूषण और कीट का खतरा',
        hindiRecommendation: 'चारे को बंद कंटेनर या ढके हुए डिब्बों में रखें। सूखा रखें। खिलाने से पहले फफूंद जांचें।',
      },
    ],
  },
]

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomBetween(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function overallRisk(hazards) {
  for (const sev of SEVERITY_ORDER) {
    if (hazards.some((h) => h.severity === sev)) return sev
  }
  return 'NONE'
}

// ---------------------------------------------------------------------------
// Demo mode: generate realistic mock results
// ---------------------------------------------------------------------------
function generateMockResults() {
  const scenario = pickRandom(SCENARIO_SETS)

  // Pick 2-4 hazards from the set
  const count = 2 + Math.floor(Math.random() * 3) // 2, 3, or 4
  const shuffled = [...scenario.hazards].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  const hazards = selected.map((h) => ({
    ...h,
    confidence: randomBetween(0.7, 0.98),
  }))

  // Sort by severity
  hazards.sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )

  return {
    hazards,
    overallRisk: overallRisk(hazards),
    hazardCount: hazards.length,
    detectedLabels: [],
    analyzedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// API call with retry
// ---------------------------------------------------------------------------
async function callApiWithRetry(imageBase64, attempt = 1) {
  const url = `${API_GATEWAY_URL}/analyze-hazards`

  try {
    console.log('[Rekognition] Calling real API:', url, { imageSize: imageBase64.length, attempt })

    const response = await axios.post(
      url,
      { image: imageBase64 },
      {
        timeout: REKOGNITION_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      }
    )

    console.log('[Rekognition] Response:', {
      status: response.status,
      hazardCount: response.data?.hazards?.length || 0,
      overallRisk: response.data?.overallRisk,
    })

    return response.data
  } catch (error) {
    console.error('[Rekognition] API error:', { attempt, code: error.code, message: error.message })

    if (attempt < MAX_RETRIES && error.code !== 'ERR_CANCELED') {
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 4000)
      await delay(backoff)
      return callApiWithRetry(imageBase64, attempt + 1)
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze an image for agricultural hazards.
 * In demo mode, returns mock hazard scenarios with simulated delay.
 *
 * @param {string} imageBase64 - Base64-encoded image (with or without data-URI prefix)
 * @returns {Promise<{ hazards: Array, overallRisk: string, hazardCount: number, detectedLabels: Array, analyzedAt: string }>}
 */
export async function analyzeHazards(imageBase64) {
  // Demo mode or no API URL: use mock data
  if (DEMO_MODE || !API_GATEWAY_URL) {
    console.log('[Rekognition] Using DEMO mode', { DEMO_MODE, hasApiUrl: !!API_GATEWAY_URL })

    const delayMs = 2000 + Math.random() * 1000 // 2-3 seconds
    await delay(delayMs)
    return generateMockResults()
  }

  // Live mode
  console.log('[Rekognition] Using LIVE mode — calling real API')

  try {
    const data = await callApiWithRetry(imageBase64)

    console.log('[Rekognition] API source:', data.source || 'unknown')

    // Normalize hazards — handle both Bedrock hybrid format and legacy fallback
    const hazards = (data.hazards || []).map((h) => ({
      severity: h.severity,
      confidence: h.confidence,
      // Bedrock hybrid returns: description (=en.name), recommendation (=en.description)
      // Fallback returns: description, recommendation (same field names)
      description: h.description || h.name || 'Safety hazard detected',
      recommendation: h.recommendation || h.description || '',
      hindiDescription: h.hindiDescription || h.name_hi || '',
      hindiRecommendation: h.hindiRecommendation || h.description_hi || '',
      type: h.type || 'detected_hazard',
    }))

    return {
      hazards,
      overallRisk: data.overallRisk || 'NONE',
      hazardCount: data.hazardCount || hazards.length,
      detectedLabels: data.detectedLabels || data.labels || [],
      analyzedAt: data.analyzedAt || new Date().toISOString(),
      source: data.source || 'unknown',
    }
  } catch (error) {
    // Return error-shaped result so the UI can show it gracefully
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isNetwork = error.code === 'ERR_NETWORK' || !navigator.onLine

    let message = 'Unable to analyze the image. Please try again.'
    if (isTimeout) message = 'Analysis timed out. Please try with a smaller image or try again.'
    if (isNetwork) message = 'No internet connection. Please check your network and try again.'

    return {
      hazards: [],
      overallRisk: 'NONE',
      hazardCount: 0,
      detectedLabels: [],
      analyzedAt: new Date().toISOString(),
      error: true,
      errorMessage: message,
    }
  }
}
