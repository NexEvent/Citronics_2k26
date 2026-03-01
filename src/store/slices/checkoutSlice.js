import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Thunks ────────────────────────────────────────────────────────────────────

/**
 * Look up an existing user by phone number.
 * Returns { exists, userId, name } — does NOT register or modify anything.
 */
export const lookupPhone = createAsyncThunk(
  'checkout/lookupPhone',
  async (phone, { rejectWithValue }) => {
    try {
      const clean = phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
      const { data } = await axios.get('/api/checkout', { params: { phone: clean } })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Phone lookup failed')
    }
  }
)

/**
 * Validate checkout items against the database.
 * Sends ONLY eventId + quantity — backend computes everything else.
 *
 * @param {Array<{eventId: number, quantity: number}>} items
 */
export const validateCheckout = createAsyncThunk(
  'checkout/validate',
  async (items, { rejectWithValue }) => {
    try {
      const payload = items.map(item => ({
        eventId: item.eventId,
        quantity: item.quantity
      }))
      // POST /api/checkout — validate checkout items
      const { data } = await axios.post('/api/checkout', { items: payload })
      if (!data.success) return rejectWithValue(data.message || 'Validation failed')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to validate checkout')
    }
  }
)

/**
 * Register user + student.
 * Does NOT implement login/auth — only collects and stores data.
 */
export const registerUser = createAsyncThunk(
  'checkout/register',
  async (formData, { rejectWithValue }) => {
    try {
      // PUT /api/checkout — register user + student
      const { data } = await axios.put('/api/checkout', formData)
      if (!data.success) return rejectWithValue(data.message || 'Registration failed')
      return data.data
    } catch (err) {
      const resp = err.response?.data
      // Pass code for EMAIL_EXISTS and PHONE_EXISTS so UI can handle them
      if (resp?.code === 'EMAIL_EXISTS') {
        return rejectWithValue({ message: resp.message, code: 'EMAIL_EXISTS', userId: resp.userId })
      }
      if (resp?.code === 'PHONE_EXISTS') {
        return rejectWithValue({ message: resp.message, code: 'PHONE_EXISTS', userId: resp.userId })
      }
      return rejectWithValue(resp?.message || 'Registration failed')
    }
  }
)

/**
 * Verify an existing user's identity by phone + password.
 * Only called when phone lookup confirms the number is registered.
 * Returns userId on success — never exposes userId without proof-of-ownership.
 */
export const verifyUser = createAsyncThunk(
  'checkout/verifyUser',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const clean = phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
      const { data } = await axios.post('/api/checkout/verify', { phone: clean, password })
      if (!data.success) return rejectWithValue(data.message || 'Verification failed')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Incorrect password. Please try again.')
    }
  }
)

/**
 * Confirm booking — for FREE events only (ticket_price = 0).
 * Paid events should use initiatePayment instead.
 */
export const confirmBooking = createAsyncThunk(
  'checkout/confirm',
  async ({ userId, items }, { rejectWithValue }) => {
    try {
      const payload = {
        userId,
        items: items.map(item => ({ eventId: item.eventId, quantity: item.quantity }))
      }
      // PATCH /api/checkout — confirm booking (free events only)
      const { data } = await axios.patch('/api/checkout', payload)
      if (!data.success) return rejectWithValue(data.message || 'Booking failed')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Booking failed')
    }
  }
)

/**
 * Initiate payment via HDFC SmartGateway (Juspay).
 * Creates pending bookings + Juspay order session.
 * Returns SDK payload for the frontend to open the payment page.
 */
export const initiatePayment = createAsyncThunk(
  'checkout/initiatePayment',
  async ({ userId, items }, { rejectWithValue }) => {
    try {
      const payload = {
        userId,
        items: items.map(item => ({ eventId: item.eventId, quantity: item.quantity }))
      }
      const { data } = await axios.post('/api/payment/initiate', payload)
      if (!data.success) return rejectWithValue(data.message || 'Payment initiation failed')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to initiate payment')
    }
  }
)

/**
 * Verify payment status with Juspay (server-side).
 * Called after user returns from payment page.
 * This is what actually confirms the booking + generates tickets.
 */
export const verifyPayment = createAsyncThunk(
  'checkout/verifyPayment',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/payment/verify', { orderId })
      if (!data.success) return rejectWithValue(data.message || 'Payment verification failed')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

/**
 * Checkout flow steps:
 * 1. validate  — backend validates items
 * 2. register  — user fills student details dialog
 * 3. confirm   — backend creates bookings
 * 4. success   — show confirmation
 */
const initialState = {
  // Step tracking
  step: 'idle', // 'idle' | 'validating' | 'ready' | 'registering' | 'confirming' | 'paying' | 'verifying' | 'success' | 'error'

  // Validated items from backend
  validatedItems: [],
  validationErrors: [],
  grandTotal: 0,

  // User registration result
  userId: null,

  // Booking result
  bookings: [],
  bookingGrandTotal: 0,

  // Payment state (HDFC Juspay)
  paymentOrderId: null,
  paymentSdkPayload: null,
  paymentStatus: null, // 'pending' | 'success' | 'failed'
  tickets: [],
  initiatingPayment: false,
  verifyingPayment: false,

  // Student details dialog
  showStudentDialog: false,

  // Loading states
  validating: false,
  registering: false,
  confirming: false,

  // Error
  error: null,

  // Source: 'cart' or 'buyNow'
  source: null,

  // Original items (eventId + quantity only)
  checkoutItems: []
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    /** Set checkout items and source (called before navigating to /checkout) */
    setCheckoutItems(state, action) {
      const { items, source } = action.payload
      state.checkoutItems = items.map(i => ({ eventId: i.eventId, quantity: i.quantity }))
      state.source = source || 'cart'
      state.step = 'idle'
      state.error = null
    },

    /** Open the student details dialog */
    openStudentDialog(state) {
      state.showStudentDialog = true
    },

    /** Close the student details dialog */
    closeStudentDialog(state) {
      state.showStudentDialog = false
    },

    /** Set existing userId (e.g., when EMAIL_EXISTS and user continues) */
    setExistingUser(state, action) {
      state.userId = action.payload.userId
      state.showStudentDialog = false
    },

    /** Reset checkout to initial state */
    resetCheckout() {
      return initialState
    }
  },
  extraReducers: builder => {
    builder
      // ── validateCheckout ──
      .addCase(validateCheckout.pending, state => {
        state.validating = true
        state.error = null
        state.step = 'validating'
      })
      .addCase(validateCheckout.fulfilled, (state, action) => {
        state.validating = false
        state.validatedItems = action.payload.validItems
        state.validationErrors = action.payload.errors || []
        state.grandTotal = action.payload.grandTotal
        state.step = 'ready'
      })
      .addCase(validateCheckout.rejected, (state, action) => {
        state.validating = false
        state.error = action.payload
        state.step = 'error'
      })

      // ── registerUser ──
      .addCase(registerUser.pending, state => {
        state.registering = true
        state.error = null
        state.step = 'registering'
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registering = false
        state.userId = action.payload.userId
        state.showStudentDialog = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registering = false
        // Don't close dialog on error so user can fix
        state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Registration failed'
      })

      // ── confirmBooking ──
      .addCase(confirmBooking.pending, state => {
        state.confirming = true
        state.error = null
        state.step = 'confirming'
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.confirming = false
        state.bookings = action.payload.bookings
        state.bookingGrandTotal = action.payload.grandTotal
        state.step = 'success'
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.confirming = false
        state.error = action.payload
        state.step = 'error'
      })

      // ── initiatePayment ──
      .addCase(initiatePayment.pending, state => {
        state.initiatingPayment = true
        state.error = null
        state.step = 'paying'
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.initiatingPayment = false
        state.paymentOrderId = action.payload.orderId
        state.paymentSdkPayload = action.payload.sdkPayload
        state.bookings = action.payload.bookings
        state.bookingGrandTotal = action.payload.amount
        state.paymentStatus = 'pending'
        state.step = 'paying'
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.initiatingPayment = false
        state.error = action.payload
        state.step = 'error'
      })

      // ── verifyPayment ──
      .addCase(verifyPayment.pending, state => {
        state.verifyingPayment = true
        state.error = null
        state.step = 'verifying'
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifyingPayment = false
        state.paymentStatus = action.payload.status
        if (action.payload.tickets) {
          state.tickets = action.payload.tickets
        }
        if (action.payload.payment) {
          state.bookingGrandTotal = action.payload.payment.amount || state.bookingGrandTotal
        }
        state.step = action.payload.status === 'success' ? 'success' : action.payload.status === 'failed' ? 'error' : 'verifying'
        if (action.payload.status === 'failed') {
          state.error = action.payload.message || 'Payment failed'
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifyingPayment = false
        state.error = action.payload
        state.step = 'error'
      })
  }
})

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCheckoutStep = state => state.checkout.step
export const selectValidatedItems = state => state.checkout.validatedItems
export const selectCheckoutGrandTotal = state => state.checkout.grandTotal
export const selectCheckoutError = state => state.checkout.error
export const selectCheckoutUserId = state => state.checkout.userId
export const selectCheckoutBookings = state => state.checkout.bookings
export const selectShowStudentDialog = state => state.checkout.showStudentDialog
export const selectPaymentOrderId = state => state.checkout.paymentOrderId
export const selectPaymentSdkPayload = state => state.checkout.paymentSdkPayload
export const selectPaymentStatus = state => state.checkout.paymentStatus
export const selectTickets = state => state.checkout.tickets

export const {
  setCheckoutItems,
  openStudentDialog,
  closeStudentDialog,
  setExistingUser,
  resetCheckout
} = checkoutSlice.actions

export default checkoutSlice.reducer
