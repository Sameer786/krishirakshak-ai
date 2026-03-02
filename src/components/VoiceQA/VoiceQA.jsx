import { useState, useEffect, useCallback, useRef } from 'react'
import useSpeechRecognition from '../../hooks/useSpeechRecognition'
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis'
import useOnlineStatus from '../../hooks/useOnlineStatus'
import { askSafetyQuestion } from '../../services/aws/bedrockService'
import { getSampleQuestions } from '../../services/aws/mockData'
import { saveQAToCache, searchCache, clearOldCache } from '../../services/offline/cacheService'
import { logQuestionAsked, logResponseReceived, logError } from '../../utils/analytics'
import QuestionChips from './QuestionChips'
import ChatBubble from './ChatBubble'

const HISTORY_KEY = 'krishirakshak_voice_history'
const LANG_KEY = 'krishirakshak_lang'
const MAX_HISTORY = 20
const MAX_CHARS = 300

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

clearOldCache()

export default function VoiceQA() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'hi-IN')
  const [textInput, setTextInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [history, setHistory] = useState(loadHistory)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { isOnline } = useOnlineStatus()
  const chatEndRef = useRef(null)
  const autoSpeakRef = useRef(null)
  const tts = useSpeechSynthesis({ lang })
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      speech?.stop?.()
      tts?.stop?.()
      window.speechSynthesis?.cancel()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when history changes or thinking
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [history, status])

  const handleQuestionSubmit = useCallback(
    async (question, source = 'text') => {
      if (!question.trim()) return
      const trimmed = question.trim()
      setTextInput('')
      setStatus('thinking')

      const startTime = Date.now()
      const langKey = lang.startsWith('hi') ? 'hi' : 'en'
      logQuestionAsked({ question: trimmed, language: langKey, isOnline, source })

      if (!isOnline) {
        const cached = searchCache(trimmed)
        if (cached) {
          const entry = {
            question: trimmed,
            answer: cached.answer,
            sources: cached.sources || [],
            confidence: cached.confidence || 0,
            fromCache: true,
            timestamp: Date.now(),
          }
          logResponseReceived({
            question: trimmed, responseTimeMs: Date.now() - startTime,
            language: langKey, isOnline: false, fromCache: true, confidence: cached.confidence,
          })
          setHistory((prev) => {
            const next = [...prev, entry].slice(-MAX_HISTORY)
            saveHistory(next)
            return next
          })
          setStatus('idle')
          autoSpeakRef.current = cached.answer
          return
        }

        const offlineMsg = langKey === 'hi'
          ? 'आप ऑफ़लाइन हैं। नए सवालों के लिए इंटरनेट से कनेक्ट करें।'
          : "You're offline. Connect to the internet to ask new questions."
        const entry = {
          question: trimmed, answer: offlineMsg, sources: [], confidence: 0,
          isError: true, isOffline: true, timestamp: Date.now(),
        }
        logError({ action: 'question_offline_no_cache', error: 'No cached answer', language: langKey })
        setHistory((prev) => {
          const next = [...prev, entry].slice(-MAX_HISTORY)
          saveHistory(next)
          return next
        })
        setStatus('idle')
        return
      }

      try {
        const result = await askSafetyQuestion(trimmed, lang)
        if (!isMountedRef.current) return

        const entry = {
          question: trimmed,
          answer: result.answer,
          sources: result.sources || [],
          confidence: result.confidence || 0,
          isError: !!result.error,
          timestamp: Date.now(),
        }
        logResponseReceived({
          question: trimmed, responseTimeMs: Date.now() - startTime,
          language: langKey, isOnline: true, fromCache: false, confidence: result.confidence,
        })
        if (!result.error) {
          saveQAToCache(trimmed, result.answer, langKey, result.sources, result.confidence)
        }
        setHistory((prev) => {
          const next = [...prev, entry].slice(-MAX_HISTORY)
          saveHistory(next)
          return next
        })
        if (!result.error) {
          autoSpeakRef.current = result.answer
        }
      } catch (err) {
        logError({ action: 'question_submit', error: err, language: lang.startsWith('hi') ? 'hi' : 'en' })
      } finally {
        if (isMountedRef.current) setStatus('idle')
      }
    },
    [lang, isOnline]
  )

  useEffect(() => {
    if (autoSpeakRef.current && status === 'idle' && !tts.isSpeaking) {
      const text = autoSpeakRef.current
      autoSpeakRef.current = null
      setTimeout(() => {
        setSpeakingIndex(history.length - 1)
        tts.speak(text)
      }, 300)
    }
  }, [status, tts, history.length])

  const speech = useSpeechRecognition({
    lang,
    onResult: (text) => handleQuestionSubmit(text, 'voice'),
    silenceTimeout: 2000,
  })

  useEffect(() => {
    if (speech.isListening) setStatus('listening')
    else if (status === 'listening') setStatus('idle')
  }, [speech.isListening, status])

  useEffect(() => {
    if (tts.isSpeaking) setStatus('speaking')
    else if (status === 'speaking') setStatus('idle')
  }, [tts.isSpeaking, status])

  const handleLangChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem(LANG_KEY, newLang)
    tts.stop()
  }

  const handleMicToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (speech.isListening) {
      speech.stop()
    } else {
      tts.stop()
      speech.start()
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) handleQuestionSubmit(textInput, 'text')
  }

  const handleChipSelect = (question) => {
    setTextInput(question)
    handleQuestionSubmit(question, 'chip')
  }

  const handleSpeak = (text, index) => {
    setSpeakingIndex(index)
    tts.speak(text)
  }

  const handleStopSpeak = () => {
    setSpeakingIndex(-1)
    tts.stop()
  }

  const handleClearChat = useCallback(() => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
    setShowClearConfirm(false)
    tts.stop()
    setSpeakingIndex(-1)
  }, [tts])

  useEffect(() => {
    if (!tts.isSpeaking) setSpeakingIndex(-1)
  }, [tts.isSpeaking])

  const isHindi = lang.startsWith('hi')
  const sampleQuestions = getSampleQuestions(lang)

  return (
    <div className="chat-container">
      {/* Page header with title + language toggle */}
      <div className="chat-header">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-bold text-primary-dark truncate">
            {isHindi ? 'आवाज़ से पूछें' : 'Voice Q&A'}
          </h2>
          {!isOnline && (
            <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Clear chat button — only show when there are messages */}
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Clear chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Compact language toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => handleLangChange('hi-IN')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isHindi ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Hi
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en-IN')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                !isHindi ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              En
            </button>
          </div>
        </div>
      </div>

      {/* Clear chat confirmation */}
      {showClearConfirm && (
        <div className="mx-4 mt-2 bg-white border border-gray-200 rounded-xl p-3 shadow-md">
          <p className="text-sm text-gray-700 font-medium text-center mb-3">
            {isHindi ? 'सभी मैसेज हटाएं?' : 'Clear all messages?'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg active:scale-[0.97] transition-transform"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleClearChat}
              className="flex-1 py-2 text-sm font-medium text-white bg-red-500 rounded-lg active:scale-[0.97] transition-transform"
            >
              {isHindi ? 'हटाएं' : 'Clear'}
            </button>
          </div>
        </div>
      )}

      {/* Listening banner */}
      {status === 'listening' && (
        <div className="mx-4 mt-2 text-center py-2 px-3 rounded-xl text-xs font-medium bg-red-50 text-red-600 animate-pulse">
          {isHindi ? '🎤 सुन रहा हूँ... बोलें' : '🎤 Listening... speak now'}
        </div>
      )}

      {/* Chat area */}
      <div className="chat-messages">
        {/* Empty state: welcome + chips */}
        {history.length === 0 && status !== 'thinking' && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="text-4xl mb-3">🌾</div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'नमस्ते! मैं KrishiRakshak हूँ' : 'Hello! I am KrishiRakshak'}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {isHindi ? 'कृषि सुरक्षा के बारे में कुछ भी पूछें' : 'Ask me anything about farm safety'}
            </p>
            <QuestionChips questions={sampleQuestions} onSelect={handleChipSelect} />
          </div>
        )}

        {/* Chat bubbles — chronological order (oldest first) */}
        {history.map((item, i) => (
          <ChatBubble
            key={item.timestamp}
            item={item}
            onSpeak={(text) => handleSpeak(text, i)}
            isSpeaking={speakingIndex === i}
            onStop={handleStopSpeak}
            lang={lang}
          />
        ))}

        {/* Typing indicator */}
        {status === 'thinking' && (
          <div className="flex items-start gap-2 px-4 py-1">
            <span className="text-lg leading-none mt-1">🌾</span>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl px-4 py-3 shadow-sm">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Quick chips above input when chat has messages */}
      {history.length > 0 && status === 'idle' && (
        <div className="chat-chips-bar">
          <QuestionChips questions={sampleQuestions} onSelect={handleChipSelect} />
        </div>
      )}

      {/* Speech error */}
      {speech.error && (
        <div className="mx-4 mb-1 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
          {speech.error}
        </div>
      )}

      {/* Input bar — fixed above bottom nav */}
      <div className="chat-input-bar">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2 w-full">
          {/* Mic button */}
          {speech.isSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={status === 'thinking'}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                speech.isListening
                  ? 'bg-red-500 mic-pulse'
                  : status === 'thinking'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            </button>
          )}

          {/* Text input */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value.slice(0, MAX_CHARS))}
            placeholder={isHindi ? 'मैसेज टाइप करें...' : 'Type a message...'}
            className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-full border border-gray-200 bg-white focus:outline-none focus:border-primary placeholder:text-gray-400"
            disabled={status === 'thinking' || speech.isListening}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!textInput.trim() || status === 'thinking'}
            className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
