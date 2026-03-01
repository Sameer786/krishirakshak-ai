import axios from 'axios'
import { API_GATEWAY_URL, DEMO_MODE, REQUEST_TIMEOUT_MS, MAX_RETRIES } from './config'
import { findMockAnswer } from './mockData'

const ERROR_MESSAGES = {
  hi: {
    network: 'कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
    timeout: 'अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।',
    server: 'प्रश्न संसाधित नहीं हो सका। कृपया बाद में प्रयास करें।',
  },
  en: {
    network: 'Please check your internet connection and try again.',
    timeout: 'Request timed out. Please try again.',
    server: 'Unable to process your question. Please try later.',
  },
}

// Greeting patterns — handle locally to avoid unnecessary API calls
const GREETING_PATTERNS = /^(hello|hi|hey|namaste|namaskar|हेलो|हाय|नमस्ते|नमस्कार|राम राम|जय हिन्द)\s*[!?.]*$/i

const GREETING_RESPONSES = {
  hi: 'नमस्ते! मैं KrishiRakshak हूँ — आपका कृषि सुरक्षा सहायक। आप मुझसे खेती से जुड़े सुरक्षा के सवाल पूछ सकते हैं। जैसे:\n- कीटनाशक का सुरक्षित उपयोग कैसे करें?\n- ट्रैक्टर चलाते समय क्या सावधानी रखें?\n- गर्मी में खेत में काम करने के टिप्स',
  en: 'Hello! I am KrishiRakshak — your agricultural safety assistant. You can ask me safety questions about farming. For example:\n- How to safely use pesticides?\n- What precautions to take while operating a tractor?\n- Tips for working in the field during hot weather',
}

function getErrorMessage(error, langKey) {
  const messages = ERROR_MESSAGES[langKey] || ERROR_MESSAGES.en

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return messages.timeout
  }
  if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
    return messages.network
  }
  return messages.server
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callApiWithRetry(question, language, attempt = 1) {
  const url = `${API_GATEWAY_URL}/ask-safety-question`

  try {
    console.log('[Bedrock] Calling real API:', url, { question: question.slice(0, 50), language, attempt })

    const response = await axios.post(
      url,
      {
        question,
        language,
        context: { source: 'pwa' },
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('[Bedrock] Response:', {
      status: response.status,
      hasAnswer: !!response.data?.answer,
      confidence: response.data?.confidence,
    })

    return response.data
  } catch (error) {
    console.error('[Bedrock] API error:', { attempt, code: error.code, message: error.message })

    if (attempt < MAX_RETRIES && error.code !== 'ERR_CANCELED') {
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
      await delay(backoff)
      return callApiWithRetry(question, language, attempt + 1)
    }
    throw error
  }
}

/**
 * Ask a safety question via Bedrock (through API Gateway + Lambda).
 * In demo mode or when API is not configured, returns mock responses.
 *
 * @param {string} question - The user's safety question
 * @param {string} language - Language code e.g. 'hi-IN' or 'en-IN'
 * @returns {Promise<{ answer: string, sources: string[], confidence: number, language: string }>}
 */
export async function askSafetyQuestion(question, language = 'hi-IN') {
  const langKey = language.startsWith('hi') ? 'hi' : 'en'

  // Handle greetings locally — no need to call the API
  if (GREETING_PATTERNS.test(question.trim())) {
    console.log('[Bedrock] Greeting detected, responding locally')
    await delay(300)
    return {
      answer: GREETING_RESPONSES[langKey] || GREETING_RESPONSES.en,
      sources: ['KrishiRakshak'],
      confidence: 1,
      language: langKey,
    }
  }

  // Demo mode or no API URL: return mock data with simulated delay
  if (DEMO_MODE || !API_GATEWAY_URL) {
    console.log('[Bedrock] Using DEMO mode', { DEMO_MODE, hasApiUrl: !!API_GATEWAY_URL })

    const delayMs = 800 + Math.random() * 1200
    await delay(delayMs)

    const mock = findMockAnswer(question, langKey)

    return {
      answer: mock.answer,
      sources: mock.sources,
      confidence: mock.confidence,
      language: langKey,
    }
  }

  // Live mode: call API Gateway → Lambda → Bedrock
  console.log('[Bedrock] Using LIVE mode — calling real API')

  try {
    const data = await callApiWithRetry(question, langKey)

    const answer = data.answer || data.body?.answer || ''

    // Always show the Bedrock response if we got one — never replace with fallback
    return {
      answer,
      sources: data.sources || data.body?.sources || [],
      confidence: data.confidence || data.body?.confidence || 0.8,
      language: data.language || langKey,
    }
  } catch (error) {
    // Only show fallback message on actual API failures (network/500 errors)
    console.error('[Bedrock] API call failed:', error.message)
    const errorMsg = getErrorMessage(error, langKey)

    return {
      answer: errorMsg,
      sources: [],
      confidence: 0,
      language: langKey,
      error: true,
    }
  }
}
