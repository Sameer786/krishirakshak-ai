import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'

const REGION = process.env.AWS_BEDROCK_REGION || 'ap-south-1'
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'apac.amazon.nova-lite-v1:0'
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '500', 10)

const client = new BedrockRuntimeClient({ region: REGION })

console.log('[Bedrock] Using model: Amazon Nova 2 Lite')
console.log('[Bedrock] Region:', REGION, '| Model:', MODEL_ID)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const SYSTEM_PROMPT = `You are KrishiRakshak, a friendly and knowledgeable AI agricultural safety expert for Indian farmers. You help farmers stay safe and healthy while working on their farms.

Your responsibilities:
- Answer ANY question related to agriculture, farming, crops, livestock, and farm safety
- Provide safety guidance for pesticide handling, machinery operation, chemical storage, heat stress, electrical hazards, animal handling, and all farming activities
- Give practical, actionable advice that farmers can follow immediately
- Recommend appropriate PPE (Personal Protective Equipment) when relevant
- Mention Indian government schemes or regulations when applicable
- Provide first aid guidance for common farm injuries and emergencies
- Answer questions about specific crops (sugarcane, rice, wheat, cotton, vegetables, fruits, etc.) with relevant safety information
- Handle greetings warmly and introduce yourself and your capabilities

Rules:
- Respond in the SAME LANGUAGE as the question (Hindi for Hindi questions, English for English)
- Keep responses concise - under 200 words
- Always prioritize safety-first advice
- Use simple language that farmers with limited education can understand
- Include emoji where helpful for visual clarity
- If a question is completely unrelated to agriculture or safety, politely redirect to farming safety topics
- NEVER say you don't have information - always provide the best safety advice you can`

const LANGUAGE_INSTRUCTIONS = {
  hi: '\n\nIMPORTANT: Respond ONLY in Hindi (Devanagari script). Do not use English.',
  en: '\n\nIMPORTANT: Respond ONLY in English. Use simple, easy-to-understand language.',
}

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

function extractSources(answer) {
  const sources = []
  const lower = answer.toLowerCase()

  const keywords = {
    'Insecticides Act 1968': ['insecticide', 'pesticide', 'कीटनाशक'],
    'BIS Safety Standards': ['bis ', 'bureau of indian', 'ppe', 'safety standard', 'सुरक्षा मानक'],
    'FSSAI Guidelines': ['fssai', 'food safety', 'खाद्य सुरक्षा'],
    'Indian Factories Act': ['factory', 'factories act', 'कारखाना'],
    'Agricultural Safety Manual': ['tractor', 'machinery', 'ट्रैक्टर', 'मशीन'],
    'First Aid Guidelines': ['first aid', 'emergency', 'प्राथमिक चिकित्सा', 'आपातकाल'],
    'WHO Pesticide Classification': ['who ', 'classification', 'class i', 'class ii'],
    'ICAR Guidelines': ['icar', 'crop', 'harvest', 'फसल', 'कटाई'],
  }

  for (const [source, terms] of Object.entries(keywords)) {
    if (terms.some((t) => lower.includes(t))) {
      sources.push(source)
    }
  }

  return sources.length > 0 ? sources : ['KrishiRakshak Knowledge Base']
}

function estimateConfidence(answer, question) {
  let score = 0.75

  // Longer, more detailed answers suggest higher confidence
  if (answer.length > 300) score += 0.05
  if (answer.length > 600) score += 0.05

  // Structured answers with bullet points or numbered lists
  if (/[\n•\-\d+\.]/.test(answer)) score += 0.05

  // Contains specific safety terms
  const safetyTerms = [
    'PPE', 'gloves', 'mask', 'goggles', 'safety',
    'सुरक्षा', 'दस्ताने', 'मास्क', 'चश्मा',
  ]
  if (safetyTerms.some((t) => answer.toLowerCase().includes(t.toLowerCase()))) {
    score += 0.05
  }

  return Math.min(score, 0.95)
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return response(200, { message: 'OK' })
  }

  // Parse request
  const body = parseBody(event)
  if (!body) {
    return response(400, {
      error: 'Invalid request body',
      message: 'Request body must be valid JSON with a "question" field.',
    })
  }

  const { question, language, context } = body

  // Validate question
  if (!question || typeof question !== 'string' || !question.trim()) {
    return response(400, {
      error: 'Missing question',
      message: 'The "question" field is required and must be a non-empty string.',
    })
  }

  const trimmedQuestion = question.trim()
  if (trimmedQuestion.length > 1000) {
    return response(400, {
      error: 'Question too long',
      message: 'Question must be under 1000 characters.',
    })
  }

  // Determine language
  const langKey = (language || 'hi').toLowerCase().startsWith('hi') ? 'hi' : 'en'
  const langInstruction = LANGUAGE_INSTRUCTIONS[langKey]

  // Build user message with language context
  const userMessage =
    langKey === 'hi'
      ? `कृपया इस प्रश्न का उत्तर हिंदी में दें:\n\n${trimmedQuestion}`
      : `Please answer this question:\n\n${trimmedQuestion}`

  // Call Bedrock using Converse API (Amazon Nova Lite)
  try {
    console.log('[Bedrock] Calling Converse API:', { model: MODEL_ID, language: langKey, questionLength: trimmedQuestion.length })

    const bedrockResponse = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: SYSTEM_PROMPT + langInstruction }],
        messages: [{ role: 'user', content: [{ text: userMessage }] }],
        inferenceConfig: {
          maxTokens: MAX_TOKENS,
          temperature: 0.3,
        },
      })
    )

    const answer =
      bedrockResponse.output?.message?.content?.[0]?.text ||
      (langKey === 'hi' ? 'कोई उत्तर नहीं मिला।' : 'No answer found.')

    console.log('[Bedrock] Response received:', { answerLength: answer.length, stopReason: bedrockResponse.stopReason })

    const sources = extractSources(answer)
    const confidence = estimateConfidence(answer, trimmedQuestion)

    return response(200, {
      answer,
      language: langKey,
      sources,
      confidence,
      source: 'bedrock-nova-lite',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Bedrock] Error:', JSON.stringify({
      name: err.name,
      message: err.message,
      code: err.$metadata?.httpStatusCode,
      requestId: err.$metadata?.requestId,
    }))

    // Throttling
    if (
      err.name === 'ThrottlingException' ||
      err.$metadata?.httpStatusCode === 429
    ) {
      return {
        statusCode: 429,
        headers: {
          ...CORS_HEADERS,
          'Retry-After': '5',
        },
        body: JSON.stringify({
          error: 'Too many requests',
          message:
            langKey === 'hi'
              ? 'बहुत अधिक अनुरोध। कृपया कुछ सेकंड बाद पुनः प्रयास करें।'
              : 'Too many requests. Please try again in a few seconds.',
          retryAfter: 5,
        }),
      }
    }

    // Access denied
    if (
      err.name === 'AccessDeniedException' ||
      err.$metadata?.httpStatusCode === 403
    ) {
      console.error('[Bedrock] Access denied — check IAM role permissions for model:', MODEL_ID)
      return response(500, {
        error: 'Service configuration error',
        message:
          langKey === 'hi'
            ? 'सेवा कॉन्फ़िगरेशन में समस्या है। कृपया बाद में प्रयास करें।'
            : 'Service configuration issue. Please try again later.',
      })
    }

    // Validation error (bad model params)
    if (err.name === 'ValidationException') {
      console.error('[Bedrock] Validation error:', err.message)
      return response(500, {
        error: 'Processing error',
        message:
          langKey === 'hi'
            ? 'प्रश्न संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Unable to process your question. Please try again.',
      })
    }

    // Generic server error
    return response(500, {
      error: 'Internal server error',
      message:
        langKey === 'hi'
          ? 'कुछ गड़बड़ हो गई। कृपया बाद में पुनः प्रयास करें।'
          : 'Something went wrong. Please try again later.',
    })
  }
}
