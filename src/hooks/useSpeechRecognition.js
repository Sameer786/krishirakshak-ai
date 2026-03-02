import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

export default function useSpeechRecognition({ lang = 'hi-IN', onResult, silenceTimeout = 2000 }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported] = useState(!!SpeechRecognition)

  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearSilenceTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [clearSilenceTimer])

  const start = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.')
      return
    }

    setError(null)
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      clearSilenceTimer()

      let finalTranscript = ''

      // Only use results from resultIndex onwards, and only final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim())
        silenceTimerRef.current = setTimeout(() => {
          stop()
          if (onResult) onResult(finalTranscript.trim())
        }, silenceTimeout)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.')
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else if (event.error !== 'aborted') {
        setError(`Speech error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, onResult, silenceTimeout, stop, clearSilenceTimer])

  useEffect(() => {
    return () => {
      clearSilenceTimer()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [clearSilenceTimer])

  return { isListening, transcript, error, isSupported, start, stop }
}
