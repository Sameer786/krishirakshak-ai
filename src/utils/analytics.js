const PREFIX = '[KrishiRakshak Analytics]'

export function logQuestionAsked({ question, language, isOnline, source }) {
  console.log(PREFIX, 'Question Asked', {
    question: question.slice(0, 100),
    language,
    online: isOnline,
    source, // 'voice' | 'text' | 'chip'
    timestamp: new Date().toISOString(),
  })
}

export function logResponseReceived({ question, responseTimeMs, language, isOnline, fromCache, confidence }) {
  console.log(PREFIX, 'Response Received', {
    question: question.slice(0, 100),
    responseTimeMs,
    language,
    online: isOnline,
    fromCache: !!fromCache,
    confidence,
    timestamp: new Date().toISOString(),
  })
}

export function logFeedback({ question, helpful, language }) {
  console.log(PREFIX, 'Feedback', {
    question: question.slice(0, 100),
    helpful, // true | false
    language,
    timestamp: new Date().toISOString(),
  })
}

export function logError({ action, error, language }) {
  console.error(PREFIX, 'Error', {
    action,
    error: typeof error === 'string' ? error : error?.message,
    language,
    timestamp: new Date().toISOString(),
  })
}
