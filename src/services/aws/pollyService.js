import axios from 'axios'
import { API_GATEWAY_URL, DEMO_MODE } from './config'

const POLLY_TIMEOUT_MS = 10000 // 10s timeout for TTS API calls
const MAX_TEXT_LENGTH = 3000

/**
 * Call Amazon Polly via Lambda to synthesize speech.
 * Returns an Audio element ready to play, or null if Polly is unavailable.
 *
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code: 'hi-IN', 'hi', 'en-IN', or 'en'
 * @returns {Promise<HTMLAudioElement|null>} Audio element or null on failure
 */
export async function synthesizePolly(text, language = 'hi') {
  // Skip Polly in demo mode or if no API URL configured
  if (DEMO_MODE || !API_GATEWAY_URL) {
    console.log('[Polly] Skipping — demo mode or no API URL')
    return null
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return null
  }

  // Normalize language code: 'hi-IN' → 'hi', 'en-IN' → 'en'
  const lang = language.startsWith('en') ? 'en' : 'hi'

  // Truncate text to Polly limit
  const speechText = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH - 3) + '...'
    : text

  const url = `${API_GATEWAY_URL}/text-to-speech`

  try {
    console.log(`[Polly] Calling API | Lang: ${lang} | Chars: ${speechText.length}`)

    const response = await axios.post(
      url,
      {
        text: speechText,
        language: lang,
      },
      {
        timeout: POLLY_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const data = response.data

    // Check if we got a fallback signal (Polly failed server-side)
    if (data.fallback || data.error) {
      console.log('[Polly] Server returned fallback signal:', data.error)
      return null
    }

    // Validate audio data
    if (!data.audio || typeof data.audio !== 'string') {
      console.log('[Polly] No audio data in response')
      return null
    }

    // Create Audio element from base64 MP3
    const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`)

    console.log(`[Polly] Audio ready | Voice: ${data.voiceId} | Lang: ${data.language}`)
    return audio
  } catch (error) {
    // Network error, timeout, or API not deployed yet — silent fallback
    if (error.code === 'ECONNABORTED') {
      console.log('[Polly] Request timed out — falling back to browser TTS')
    } else if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
      console.log('[Polly] Network unavailable — falling back to browser TTS')
    } else {
      console.log('[Polly] API error — falling back to browser TTS:', error.message)
    }
    return null
  }
}
