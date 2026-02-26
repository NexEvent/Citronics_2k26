/**
 * useSpeechRecognition — Browser Speech-to-Text Hook
 *
 * Wraps the Web Speech API (SpeechRecognition) for Citro.
 * Zero backend load — all STT happens in the browser.
 *
 * Returns:
 *   - start()       Begin listening
 *   - stop()        Stop listening
 *   - isSupported   Whether the browser supports Web Speech API
 *   - transcript    Current/final transcript text
 *   - isListening   Whether actively listening
 *
 * Supports both English and Hindi recognition.
 */
import { useState, useRef, useCallback, useEffect } from 'react'

const useSpeechRecognition = ({ lang = 'en-IN', onResult, onError } = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = lang
      recognition.interimResults = false    // Only final results
      recognition.continuous = false         // Single command mode
      recognition.maxAlternatives = 1

      recognition.onresult = event => {
        const result = event.results[0][0]
        const text = result.transcript
        setTranscript(text)
        setIsListening(false)

        if (onResult) onResult(text, result.confidence)
      }

      recognition.onerror = event => {
        console.warn('[Citro STT] Error:', event.error)
        setIsListening(false)

        if (onError) onError(event.error)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err) {
      // Already started — ignore DOMException
      console.warn('[Citro STT] Start failed:', err.message)
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch {
      // Not started — ignore
    }

    setIsListening(false)
  }, [])

  return {
    start,
    stop,
    isListening,
    transcript,
    isSupported
  }
}

export default useSpeechRecognition
