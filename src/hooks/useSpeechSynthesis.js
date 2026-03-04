import { useState, useRef, useCallback, useEffect } from 'react'
import { synthesizePolly } from '../services/aws/pollyService'

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

/**
 * Fall back to browser Web Speech API
 */
function browserSpeak(text, lang, callbacks) {
  if (!window.speechSynthesis) {
    callbacks.onEnd?.()
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  utterance.pitch = 1

  const voices = window.speechSynthesis.getVoices()
  const matchingVoice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]))
  if (matchingVoice) {
    utterance.voice = matchingVoice
  }

  utterance.onstart = () => callbacks.onStart?.()
  utterance.onend = () => callbacks.onEnd?.()
  utterance.onerror = () => callbacks.onEnd?.()

  callbacks.setUtterance?.(utterance)
  window.speechSynthesis.speak(utterance)
}

export default function useSpeechSynthesis({ lang = 'hi-IN' }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const utteranceRef = useRef(null)
  const audioRef = useRef(null)          // Polly Audio element
  const usingPollyRef = useRef(false)    // Tracks which engine is active

  const stop = useCallback(() => {
    // Stop Polly audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    // Stop browser TTS if playing
    window.speechSynthesis.cancel()
    usingPollyRef.current = false
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  const speak = useCallback(async (text) => {
    if (!text) return

    stop()

    const cleanText = stripMarkdown(text)
    if (!cleanText) return

    // --- Try Polly first ---
    const audio = await synthesizePolly(cleanText, lang)

    if (audio) {
      usingPollyRef.current = true
      audioRef.current = audio

      audio.addEventListener('playing', () => {
        setIsSpeaking(true)
        setIsPaused(false)
      })

      audio.addEventListener('ended', () => {
        setIsSpeaking(false)
        setIsPaused(false)
        audioRef.current = null
        usingPollyRef.current = false
      })

      audio.addEventListener('error', () => {
        console.log('[TTS] Polly audio playback error — falling back to browser TTS')
        audioRef.current = null
        usingPollyRef.current = false
        // Fall back to browser TTS on playback error
        browserSpeak(cleanText, lang, {
          onStart: () => { setIsSpeaking(true); setIsPaused(false) },
          onEnd: () => { setIsSpeaking(false); setIsPaused(false) },
          setUtterance: (u) => { utteranceRef.current = u },
        })
      })

      try {
        await audio.play()
      } catch {
        // play() can fail if user hasn't interacted yet — fall back
        console.log('[TTS] Audio.play() blocked — falling back to browser TTS')
        audioRef.current = null
        usingPollyRef.current = false
        browserSpeak(cleanText, lang, {
          onStart: () => { setIsSpeaking(true); setIsPaused(false) },
          onEnd: () => { setIsSpeaking(false); setIsPaused(false) },
          setUtterance: (u) => { utteranceRef.current = u },
        })
      }
      return
    }

    // --- Polly unavailable — use browser TTS ---
    usingPollyRef.current = false
    browserSpeak(cleanText, lang, {
      onStart: () => { setIsSpeaking(true); setIsPaused(false) },
      onEnd: () => { setIsSpeaking(false); setIsPaused(false) },
      setUtterance: (u) => { utteranceRef.current = u },
    })
  }, [lang, stop])

  const pause = useCallback(() => {
    if (usingPollyRef.current && audioRef.current) {
      audioRef.current.pause()
    } else {
      window.speechSynthesis.pause()
    }
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (usingPollyRef.current && audioRef.current) {
      audioRef.current.play()
    } else {
      window.speechSynthesis.resume()
    }
    setIsPaused(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [])

  return { isSpeaking, isPaused, speak, pause, resume, stop }
}
