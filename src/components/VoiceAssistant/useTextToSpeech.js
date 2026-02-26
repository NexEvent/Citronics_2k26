/**
 * useTextToSpeech — Browser Speech Synthesis Hook
 *
 * Wraps the Web Speech API (SpeechSynthesis) for Citro.
 * Zero backend load — all TTS happens in the browser.
 *
 * Returns:
 *   - speak(text)     Speak the given text
 *   - stop()          Stop speaking
 *   - isSpeaking      Whether currently speaking
 *   - isSupported     Whether the browser supports TTS
 */
import { useState, useCallback, useEffect, useRef } from 'react'

const useTextToSpeech = ({ rate = 1.0, pitch = 1.0, lang = 'en-IN' } = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = useCallback(
    text => {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) return

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = 1.0

      // Try to pick a good voice (prefer Google / natural voices)
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(
        v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
      )

      if (preferred) utterance.voice = preferred

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [lang, rate, pitch]
  )

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported
  }
}

export default useTextToSpeech
