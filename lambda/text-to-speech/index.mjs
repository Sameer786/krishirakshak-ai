import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

const REGION = process.env.AWS_REGION || 'ap-south-1'
const MAX_TEXT_LENGTH = 3000

const pollyClient = new PollyClient({ region: REGION })
const dynamoClient = new DynamoDBClient({ region: REGION })

console.log('[Polly] Text-to-Speech Lambda initialized | Region:', REGION)

// ---------------------------------------------------------------------------
// CORS & response helpers (same pattern as other Lambdas)
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
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

// ---------------------------------------------------------------------------
// Text cleanup — strip emojis, Hindi danda, markdown before sending to Polly
// ---------------------------------------------------------------------------
function cleanTextForSpeech(text) {
  let cleaned = text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // transport & map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')  // flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')    // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')    // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')    // variation selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')  // supplemental symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')  // chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')  // symbols extended
    .replace(/[\u{200D}]/gu, '')              // zero width joiner
    // Replace Hindi danda with period (for natural pause)
    .replace(/।/g, '.')
    .replace(/॥/g, '.')
    // Remove markdown formatting
    .replace(/[*#_~`]/g, '')
    .replace(/^[-•]\s*/gm, '')
    // Clean up whitespace
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

// ---------------------------------------------------------------------------
// Voice configuration
// ---------------------------------------------------------------------------
const VOICE_CONFIG = {
  hi: { VoiceId: 'Aditi', Engine: 'standard', LanguageCode: 'hi-IN' },
  en: { VoiceId: 'Kajal', Engine: 'neural', LanguageCode: 'en-IN' },
}

// ---------------------------------------------------------------------------
// DynamoDB activity logging (fire-and-forget, same as other Lambdas)
// ---------------------------------------------------------------------------
async function logActivity(feature, question, source, confidence) {
  try {
    await dynamoClient.send(new PutItemCommand({
      TableName: 'krishirakshak-activity-log',
      Item: {
        userId: { S: 'web-user' },
        timestamp: { S: new Date().toISOString() },
        question: { S: question.substring(0, 500) },
        source: { S: source },
        confidence: { N: String(confidence || 0) },
        feature: { S: feature },
      },
    }))
  } catch (error) {
    console.error('DynamoDB log error:', error)
    // Don't fail the main request if logging fails
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

  try {
    // Parse request body
    const body = parseBody(event)
    if (!body) {
      return response(400, { error: 'Invalid request body', fallback: true })
    }

    const { text, language } = body

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return response(400, { error: 'Text is required', fallback: true })
    }

    // Determine language (default to Hindi)
    const lang = language === 'en' ? 'en' : 'hi'
    const voiceConfig = VOICE_CONFIG[lang]

    // Clean text: remove emojis, convert Hindi danda to periods, strip markdown
    let speechText = cleanTextForSpeech(text)

    // Truncate text if too long (Polly limit)
    if (speechText.length > MAX_TEXT_LENGTH) {
      speechText = speechText.substring(0, MAX_TEXT_LENGTH - 3) + '...'
      console.log(`[Polly] Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} chars`)
    }

    console.log(`[Polly] Synthesizing speech | Lang: ${lang} | Voice: ${voiceConfig.VoiceId} | Engine: ${voiceConfig.Engine} | Chars: ${speechText.length}`)

    // Call Amazon Polly
    const command = new SynthesizeSpeechCommand({
      Text: speechText,
      OutputFormat: 'mp3',
      VoiceId: voiceConfig.VoiceId,
      Engine: voiceConfig.Engine,
      LanguageCode: voiceConfig.LanguageCode,
    })

    let pollyResponse
    try {
      pollyResponse = await pollyClient.send(command)
    } catch (pollyError) {
      console.error('[Polly] SynthesizeSpeech error:', pollyError)

      // If neural engine fails for English, retry with standard engine
      if (lang === 'en' && voiceConfig.Engine === 'neural') {
        console.log('[Polly] Retrying with standard engine and Aditi voice...')
        const fallbackCommand = new SynthesizeSpeechCommand({
          Text: speechText,
          OutputFormat: 'mp3',
          VoiceId: 'Aditi',
          Engine: 'standard',
          LanguageCode: 'en-IN',
        })
        pollyResponse = await pollyClient.send(fallbackCommand)
      } else {
        throw pollyError
      }
    }

    // Convert audio stream to base64
    const audioBytes = await pollyResponse.AudioStream.transformToByteArray()
    const audioBase64 = Buffer.from(audioBytes).toString('base64')

    console.log(`[Polly] Audio generated | Size: ${audioBytes.length} bytes | Base64: ${audioBase64.length} chars`)

    // Log activity (fire-and-forget)
    logActivity(
      'text-to-speech',
      speechText.substring(0, 100),
      `polly-${voiceConfig.VoiceId}`,
      100
    )

    return response(200, {
      audio: audioBase64,
      contentType: 'audio/mpeg',
      voiceId: voiceConfig.VoiceId,
      language: lang,
    })
  } catch (error) {
    console.error('[Polly] Handler error:', error)

    return response(500, {
      error: 'Failed to synthesize speech. Please try again.',
      fallback: true,
    })
  }
}
