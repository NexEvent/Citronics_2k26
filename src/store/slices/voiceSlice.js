/**
 * Voice Slice — Citro (Redux State)
 *
 * Manages all voice assistant state:
 *   - Listening status (mic on/off)
 *   - Panel visibility
 *   - Conversation messages (user + Citro)
 *   - Processing state
 *   - Error state
 *
 * Follows the same pattern as dashboardSlice.js
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Thunks ────────────────────────────────────────────────────────────────────

/**
 * Send voice transcript to the API for processing.
 * POST /api/voice/process { transcript, currentPage }
 */
export const processVoiceCommand = createAsyncThunk(
  'voice/processCommand',
  async ({ transcript, currentPage }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/voice/process', { transcript, currentPage })
      return data.data // { reply, action, data, intent, confidence }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Voice command failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  /** Whether the mic is actively listening */
  isListening: false,

  /** Whether Citro is processing a command */
  isProcessing: false,

  /** Whether the subtitle panel is open */
  isPanelOpen: false,

  /** Conversation history: [{ sender: 'user'|'citro', text, timestamp }] */
  messages: [],

  /** Last detected intent (for debugging / UI hints) */
  lastIntent: null,

  /** Last confidence score */
  lastConfidence: 0,

  /** Pending action for the UI to execute (navigate, display, etc.) */
  pendingAction: null,

  /** Error message */
  error: null
}

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    /** Toggle microphone listening state */
    setListening(state, action) {
      state.isListening = action.payload
    },

    /** Toggle subtitle panel visibility */
    togglePanel(state) {
      state.isPanelOpen = !state.isPanelOpen
    },

    /** Open panel */
    openPanel(state) {
      state.isPanelOpen = true
    },

    /** Close panel */
    closePanel(state) {
      state.isPanelOpen = false
    },

    /** Add a user message (speech transcript) */
    addUserMessage(state, action) {
      state.messages.push({
        sender: 'user',
        text: action.payload,
        timestamp: Date.now()
      })
    },

    /** Add a Citro response message */
    addCitroMessage(state, action) {
      state.messages.push({
        sender: 'citro',
        text: action.payload,
        timestamp: Date.now()
      })
    },

    /** Clear the pending action after UI has consumed it */
    clearPendingAction(state) {
      state.pendingAction = null
    },

    /** Clear all messages */
    clearMessages(state) {
      state.messages = []
    },

    /** Clear error */
    clearError(state) {
      state.error = null
    }
  },

  extraReducers: builder => {
    builder
      .addCase(processVoiceCommand.pending, state => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(processVoiceCommand.fulfilled, (state, action) => {
        state.isProcessing = false
        const { reply, action: responseAction, intent, confidence } = action.payload

        // Add Citro's reply to conversation
        state.messages.push({
          sender: 'citro',
          text: reply,
          timestamp: Date.now()
        })

        // Store intent info
        state.lastIntent = intent
        state.lastConfidence = confidence

        // Set pending action for UI to execute
        if (responseAction) {
          state.pendingAction = responseAction
        }
      })
      .addCase(processVoiceCommand.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload || 'Something went wrong'

        state.messages.push({
          sender: 'citro',
          text: 'Oops, something went wrong. Please try again.',
          timestamp: Date.now()
        })
      })
  }
})

export const {
  setListening,
  togglePanel,
  openPanel,
  closePanel,
  addUserMessage,
  addCitroMessage,
  clearPendingAction,
  clearMessages,
  clearError
} = voiceSlice.actions

export default voiceSlice.reducer
