/**
 * useTextToSpeech — Browser Speech Synthesis Hook
 *
 * Wraps the Web Speech API (SpeechSynthesis) for Citro.
 * Zero backend load — all TTS happens in the browser.
 *
 * Features:
 *   - Uniform voice selection (locks one voice per session for consistency)
 *   - Configurable rate / pitch / lang
 *
 * Returns:
 *   - speak(text)     Speak the given text
 *   - stop()          Stop speaking
 *   - isSpeaking      Whether currently speaking
 *   - isSupported     Whether the browser supports TTS
 */
import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Voice selection priority — first match wins.
 * This ensures a consistent, natural-sounding voice across the entire session.
 * Order: Google US English → Google UK English → any Google English → any
 * "Natural" English → first available English voice → browser default.
 */
function pickBestVoice(voices) {
  if (!voices || voices.length === 0) return null

  // Prefer softer, female voices for a friendlier Citro personality.
  // Priority: Google female US → Google female UK → Microsoft female → any Google → Natural → fallback
  const priorities = [
    v => v.lang === 'en-US' && v.name.includes('Google') && /female|Zira|Aria|Jenny|Sara/i.test(v.name),
    v => v.lang === 'en-US' && v.name.includes('Google'),
    v => v.lang === 'en-GB' && v.name.includes('Google'),
    v => v.lang.startsWith('en') && /Zira|Aria|Jenny|Sara|Samantha|Karen|Moira|Female/i.test(v.name),
    v => v.lang.startsWith('en') && v.name.includes('Google'),
    v => v.lang.startsWith('en') && v.name.includes('Natural'),
    v => v.lang.startsWith('en') && !v.localService,   // remote/high-quality
    v => v.lang.startsWith('en')
  ]

  for (const test of priorities) {
    const match = voices.find(test)
    if (match) return match
  }

  return null // fall back to browser default
}

const useTextToSpeech = ({ rate = 1.0, pitch = 1.0, lang = 'en-US' } = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef(null)
  const lockedVoiceRef = useRef(null)   // uniform voice locked for session

  // Resolve voices (may load async on some browsers)
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    setIsSupported(supported)
    if (!supported) return

    const resolveVoice = () => {
      if (!lockedVoiceRef.current) {
        const best = pickBestVoice(window.speechSynthesis.getVoices())
        if (best) lockedVoiceRef.current = best
      }
    }

    resolveVoice()
    // Chrome fires voiceschanged asynchronously
    window.speechSynthesis.addEventListener('voiceschanged', resolveVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', resolveVoice)
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
      utterance.volume = 0.85  // slightly lower volume for softer feel

      // Use the session-locked voice for uniform sound
      if (lockedVoiceRef.current) {
        utterance.voice = lockedVoiceRef.current
      }

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
