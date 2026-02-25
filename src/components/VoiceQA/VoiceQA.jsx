import { useState, useEffect, useCallback, useRef } from 'react'
import useSpeechRecognition from '../../hooks/useSpeechRecognition'
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis'
import useOnlineStatus from '../../hooks/useOnlineStatus'
import { askSafetyQuestion } from '../../services/aws/bedrockService'
import { getSampleQuestions } from '../../services/aws/mockData'
import { saveQAToCache, searchCache, clearOldCache, getStorageUsage } from '../../services/offline/cacheService'
import { logQuestionAsked, logResponseReceived, logError } from '../../utils/analytics'
import LanguageToggle from './LanguageToggle'
import QuestionChips from './QuestionChips'
import ResponseHistory from './ResponseHistory'

const HISTORY_KEY = 'krishirakshak_voice_history'
const LANG_KEY = 'krishirakshak_lang'
const MAX_HISTORY = 5
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

// Clean old cache on first load
clearOldCache()

export default function VoiceQA() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'hi-IN')
  const [textInput, setTextInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [history, setHistory] = useState(loadHistory)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const isOnline = useOnlineStatus()
  const scrollRef = useRef(null)
  const autoSpeakRef = useRef(null)

  const tts = useSpeechSynthesis({ lang })

  const handleQuestionSubmit = useCallback(
    async (question, source = 'text') => {
      if (!question.trim()) return

      const trimmed = question.trim()
      setTextInput('')
      setStatus('thinking')

      const startTime = Date.now()
      const langKey = lang.startsWith('hi') ? 'hi' : 'en'

      logQuestionAsked({ question: trimmed, language: langKey, isOnline, source })

      // --- Offline path: try cache first ---
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
            question: trimmed,
            responseTimeMs: Date.now() - startTime,
            language: langKey,
            isOnline: false,
            fromCache: true,
            confidence: cached.confidence,
          })

          setHistory((prev) => {
            const next = [entry, ...prev].slice(0, MAX_HISTORY)
            saveHistory(next)
            return next
          })
          setStatus('idle')

          // Auto-read cached response
          autoSpeakRef.current = cached.answer
          return
        }

        // No cache match while offline
        const offlineMsg = langKey === 'hi'
          ? 'आप ऑफ़लाइन हैं। नए सवालों के लिए इंटरनेट से कनेक्ट करें।'
          : "You're offline. Connect to the internet to ask new questions."

        const entry = {
          question: trimmed,
          answer: offlineMsg,
          sources: [],
          confidence: 0,
          isError: true,
          isOffline: true,
          timestamp: Date.now(),
        }

        logError({ action: 'question_offline_no_cache', error: 'No cached answer', language: langKey })

        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, MAX_HISTORY)
          saveHistory(next)
          return next
        })
        setStatus('idle')
        return
      }

      // --- Online path: call bedrockService ---
      try {
        const result = await askSafetyQuestion(trimmed, lang)
        const entry = {
          question: trimmed,
          answer: result.answer,
          sources: result.sources || [],
          confidence: result.confidence || 0,
          isError: !!result.error,
          timestamp: Date.now(),
        }

        logResponseReceived({
          question: trimmed,
          responseTimeMs: Date.now() - startTime,
          language: langKey,
          isOnline: true,
          fromCache: false,
          confidence: result.confidence,
        })

        // Cache successful responses for offline use
        if (!result.error) {
          saveQAToCache(trimmed, result.answer, langKey, result.sources, result.confidence)
        }

        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, MAX_HISTORY)
          saveHistory(next)
          return next
        })

        // Auto-read the response
        if (!result.error) {
          autoSpeakRef.current = result.answer
        }
      } catch (err) {
        logError({ action: 'question_submit', error: err, language: langKey })
      } finally {
        setStatus('idle')
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    },
    [lang, isOnline]
  )

  // Auto-speak new responses
  useEffect(() => {
    if (autoSpeakRef.current && status === 'idle' && !tts.isSpeaking) {
      const text = autoSpeakRef.current
      autoSpeakRef.current = null
      setTimeout(() => {
        setSpeakingIndex(0)
        tts.speak(text)
      }, 300)
    }
  }, [status, tts])

  const speech = useSpeechRecognition({
    lang,
    onResult: (text) => handleQuestionSubmit(text, 'voice'),
    silenceTimeout: 2000,
  })

  // Update status from speech recognition
  useEffect(() => {
    if (speech.isListening) setStatus('listening')
    else if (status === 'listening') setStatus('idle')
  }, [speech.isListening, status])

  // Update status from TTS
  useEffect(() => {
    if (tts.isSpeaking) setStatus('speaking')
    else if (status === 'speaking') setStatus('idle')
  }, [tts.isSpeaking, status])

  const handleLangChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem(LANG_KEY, newLang)
    tts.stop()
  }

  const handleMicToggle = () => {
    if (speech.isListening) {
      speech.stop()
    } else {
      tts.stop()
      speech.start()
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      handleQuestionSubmit(textInput, 'text')
    }
  }

  const handleChipSelect = (question) => {
    setTextInput(question)
    handleQuestionSubmit(question, 'chip')
  }

  const handleSpeak = (text) => {
    setSpeakingIndex(history.findIndex((h) => h.answer === text))
    tts.speak(text)
  }

  const handleStopSpeak = () => {
    setSpeakingIndex(-1)
    tts.stop()
  }

  // Clear speaking index when TTS ends
  useEffect(() => {
    if (!tts.isSpeaking) setSpeakingIndex(-1)
  }, [tts.isSpeaking])

  const isHindi = lang.startsWith('hi')
  const sampleQuestions = getSampleQuestions(lang)
  const storageInfo = getStorageUsage()

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-dark">
            {isHindi ? 'आवाज़ से पूछें' : 'Voice Q&A'}
          </h2>
          <p className="text-xs text-gray-500">
            {isHindi ? 'कृषि सुरक्षा के सवाल पूछें' : 'Ask agricultural safety questions'}
          </p>
        </div>
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Offline
          </span>
        )}
      </div>

      {/* Language Toggle */}
      <LanguageToggle lang={lang} onChange={handleLangChange} />

      {/* Status Banner */}
      {status !== 'idle' && (
        <div
          className={`text-center py-3 px-4 rounded-xl text-sm font-medium animate-pulse ${
            status === 'listening'
              ? 'bg-red-50 text-red-600'
              : status === 'thinking'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          {status === 'listening' && (isHindi ? '🎤 सुन रहा हूँ...' : '🎤 Listening...')}
          {status === 'thinking' && (isHindi ? '🤔 AI सोच रहा है...' : '🤔 AI is thinking...')}
          {status === 'speaking' && (isHindi ? '🔊 बोल रहा हूँ...' : '🔊 Speaking...')}
        </div>
      )}

      {/* Mic Button */}
      {speech.isSupported && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleMicToggle}
            disabled={status === 'thinking'}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg ${
              speech.isListening
                ? 'bg-red-500 hover:bg-red-600'
                : status === 'thinking'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {speech.isListening && (
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-10 h-10 relative z-10"
            >
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </button>
          <p className="text-xs text-gray-500">
            {speech.isListening
              ? isHindi
                ? 'बोलना शुरू करें...'
                : 'Start speaking...'
              : isHindi
              ? 'माइक दबाएं और बोलें'
              : 'Tap mic and speak'}
          </p>
        </div>
      )}

      {/* Real-time transcription */}
      {speech.isListening && speech.transcript && (
        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <p className="text-xs text-red-500 font-medium mb-1">
            {isHindi ? 'आप बोल रहे हैं:' : 'You are saying:'}
          </p>
          <p className="text-base text-gray-800">{speech.transcript}</p>
        </div>
      )}

      {/* Error message */}
      {speech.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {speech.error}
        </div>
      )}

      {/* Text Input Fallback */}
      <form onSubmit={handleTextSubmit} className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value.slice(0, MAX_CHARS))}
            placeholder={
              isHindi
                ? 'यहाँ टाइप करें या ऊपर माइक दबाएं...'
                : 'Type here or tap the mic above...'
            }
            className="w-full px-4 py-3 pr-20 text-base rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
            disabled={status === 'thinking' || speech.isListening}
          />
          {textInput && (
            <button
              type="button"
              onClick={() => setTextInput('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={!textInput.trim() || status === 'thinking'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[10px] text-gray-400">
            {!speech.isSupported && (isHindi ? 'आवाज़ इस ब्राउज़र में उपलब्ध नहीं' : 'Voice not supported in this browser')}
          </span>
          <span className="text-[10px] text-gray-400">
            {textInput.length}/{MAX_CHARS}
          </span>
        </div>
      </form>

      {/* Sample Questions */}
      <QuestionChips questions={sampleQuestions} onSelect={handleChipSelect} />

      {/* Response History */}
      <div ref={scrollRef}>
        <ResponseHistory
          history={history}
          onSpeak={handleSpeak}
          speakingIndex={speakingIndex}
          onStop={handleStopSpeak}
          lang={lang}
        />
      </div>

      {/* Footer: Clear History + Cache Info */}
      {history.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setHistory([])
              saveHistory([])
            }}
            className="py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {isHindi ? 'इतिहास साफ़ करें' : 'Clear history'}
          </button>
          <span className="text-[10px] text-gray-400">
            Cache: {storageInfo.itemCount} items ({storageInfo.formatted})
          </span>
        </div>
      )}
    </div>
  )
}
