import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Strip markdown formatting so TTS reads clean text
 */
function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.*?)\*/g, '$1')       // *italic*
    .replace(/#{1,6}\s?/g, '')         // # headings
    .replace(/`(.*?)`/g, '$1')         // `code`
    .replace(/^[\s]*[-*+]\s/gm, '')    // - list items
    .replace(/^[\s]*\d+\.\s/gm, '')    // 1. numbered lists
    .replace(/>/g, '')                 // > blockquotes
    .replace(/\n{2,}/g, '. ')          // double newlines → pause
    .replace(/\n/g, '. ')              // single newlines → pause
    .replace(/\s{2,}/g, ' ')           // collapse whitespace
    .trim()
}

export default function useSpeechSynthesis({ lang = 'hi-IN' }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const utteranceRef = useRef(null)

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return

    stop()

    const cleanText = stripMarkdown(text)
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [lang, stop])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return { isSpeaking, isPaused, speak, pause, resume, stop }
}
