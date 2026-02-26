/**
 * VoiceAssistant (Citro) — Orchestrator Component
 *
 * Wires together:
 *   - CitroBot (sleek robot mascot in bottom-right corner)
 *   - CitroBotPanel (voice interface panel)
 *   - useSpeechRecognition (browser STT)
 *   - useTextToSpeech (browser TTS)
 *   - voiceSlice (Redux state)
 *   - Router (for navigation actions)
 *
 * Flow:
 *   Bot click → panel opens → mic tap → STT listens → transcript
 *   → Redux thunk (POST /api/voice/process)
 *   → Citro reply appears in panel + spoken via TTS
 *   → Navigation/action executed if needed
 *
 * Auth is NOT required — voice assistant works for all visitors.
 * Mounted globally in _app.js alongside PWAPrompts, ScrollToTop, etc.
 */
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'

// Redux actions
import {
  setListening,
  togglePanel,
  openPanel,
  closePanel,
  addUserMessage,
  clearPendingAction,
  processVoiceCommand
} from 'src/store/slices/voiceSlice'

// Sub-components — original
import CitroPuppy from './CitroPuppy'
import CitroPopup from './CitroPopup'

// Sub-components — new sleek robot variant
import CitroBot from './CitroBot'
import CitroBotPanel from './CitroBotPanel'

// Hooks
import useSpeechRecognition from './useSpeechRecognition'
import useTextToSpeech from './useTextToSpeech'

// ── Mascot mode ──────────────────────────────────────────────────────────────
// Switch between 'bot' (sleek robot) and 'puppy' (anime dog) to compare.
// Change this single value to swap the entire mascot + panel UI.
const MASCOT_MODE = 'bot' // 'bot' | 'puppy'

const VoiceAssistant = () => {
  const dispatch = useDispatch()
  const router = useRouter()

  // Redux state
  const {
    isListening,
    isProcessing,
    isPanelOpen,
    messages,
    pendingAction
  } = useSelector(state => state.voice)

  // ── Speech Recognition (STT) ─────────────────────────────────────────────
  const handleSpeechResult = useCallback(
    (text, confidence) => {
      if (!text) return

      // Add user message to conversation
      dispatch(addUserMessage(text))
      dispatch(setListening(false))
      dispatch(openPanel())

      // Send to API via Redux thunk — include current page for context
      dispatch(processVoiceCommand({ transcript: text, currentPage: router.pathname }))
    },
    [dispatch, router.pathname]
  )

  const handleSpeechError = useCallback(
    error => {
      dispatch(setListening(false))

      if (error === 'no-speech') {
        // User didn't say anything — silent fail, no need to spam
        return
      }
      console.warn('[Citro] Speech error:', error)
    },
    [dispatch]
  )

  const {
    start: startListening,
    stop: stopListening,
    isSupported: sttSupported
  } = useSpeechRecognition({
    lang: 'en-IN', // Supports English + Hindi/Hinglish accents
    onResult: handleSpeechResult,
    onError: handleSpeechError
  })

  // ── Text-to-Speech (TTS) ─────────────────────────────────────────────────
  const { speak } = useTextToSpeech({ rate: 1.0, pitch: 1.0, lang: 'en-IN' })

  // ── Speak Citro's replies ────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]

    if (lastMsg.sender === 'citro') {
      speak(lastMsg.text)
    }
  }, [messages, speak])

  // ── Execute pending actions (navigation, etc.) ───────────────────────────
  useEffect(() => {
    if (!pendingAction) return

    const executeAction = async () => {
      switch (pendingAction.type) {
        case 'navigate':
          if (pendingAction.path === 'back') {
            router.back()
          } else if (pendingAction.path && router.pathname !== pendingAction.path) {
            await router.push(pendingAction.path)
          }
          break

        case 'close':
          // Close the panel (e.g., "goodbye" intent)
          dispatch(closePanel())
          break

        case 'display':
          // Widget display — handled by specific views in future
          break

        case 'execute':
          // Execution actions — will be wired to specific handlers
          break

        default:
          break
      }

      dispatch(clearPendingAction())
    }

    // Small delay so the user sees/hears the reply before navigation
    const timer = setTimeout(executeAction, 800)
    return () => clearTimeout(timer)
  }, [pendingAction, router, dispatch])

  // ── Bot click — toggle popup ────────────────────────────────────────────
  const handlePuppyClick = useCallback(() => {
    dispatch(togglePanel())
  }, [dispatch])

  // ── Mic toggle — no login required, works for everyone ─────────────────
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening()
      dispatch(setListening(false))
    } else {
      startListening()
      dispatch(setListening(true))
      dispatch(openPanel())
    }
  }, [isListening, startListening, stopListening, dispatch])

  // ── Chip click handler — sends text as a voice command directly ─────────
  const handleChipClick = useCallback((label) => {
    dispatch(addUserMessage(label))
    dispatch(openPanel())
    dispatch(processVoiceCommand({ transcript: label, currentPage: router.pathname }))
  }, [dispatch, router.pathname])

  return (
    <>
      {MASCOT_MODE === 'bot' ? (
        <>
          {/* New: Sleek robot mascot + tech-themed panel */}
          <CitroBotPanel
            isOpen={isPanelOpen}
            isListening={isListening}
            isProcessing={isProcessing}
            messages={messages}
            onClose={() => dispatch(closePanel())}
            onMicClick={handleMicClick}
            onChipClick={handleChipClick}
          />
          <CitroBot
            isListening={isListening}
            isProcessing={isProcessing}
            isOpen={isPanelOpen}
            onClick={handlePuppyClick}
          />
        </>
      ) : (
        <>
          {/* Original: Anime puppy mascot + popup */}
          <CitroPopup
            isOpen={isPanelOpen}
            isListening={isListening}
            isProcessing={isProcessing}
            messages={messages}
            onClose={() => dispatch(closePanel())}
            onMicClick={handleMicClick}
          />
          <CitroPuppy
            isListening={isListening}
            isProcessing={isProcessing}
            isOpen={isPanelOpen}
            onClick={handlePuppyClick}
          />
        </>
      )}
    </>
  )
}

export default VoiceAssistant
