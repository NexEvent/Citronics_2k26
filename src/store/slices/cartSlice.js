import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Persistence helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = 'citronics_cart'

function loadCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistCart(items) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* quota exceeded — silently fail */
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────

/**
 * Validate cart items against the database.
 * Fetches fresh prices and availability for all cart event IDs.
 * Returns the validated items with DB-sourced prices.
 */
export const validateCart = createAsyncThunk(
  'cart/validate',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { items } = getState().cart
      if (items.length === 0) return []

      const eventIds = items.map(item => item.eventId)
      const { data } = await axios.post('/api/cart/validate', { eventIds })

      if (!data.success) return rejectWithValue(data.message || 'Validation failed')

      return data.data // Array of { id, title, ticket_price, seats, registered, start_time, venue, images }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to validate cart')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

/**
 * Cart item shape:
 * {
 *   eventId: number,
 *   title: string,
 *   ticketPrice: number,
 *   quantity: number,
 *   image: string | null,
 *   startTime: string,
 *   venue: string
 * }
 */
const initialState = {
  items: [],
  validating: false,
  validationError: null,
  validationRemovedCount: 0, // items removed during last validation (sold-out / unpublished)
  hydrated: false
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Hydrate cart from localStorage (call once on app mount).
     *  Sanitizes loaded data to discard any corrupted items. */
    hydrateCart(state) {
      const raw = loadCart()
      // Sanitize: discard items with missing eventId or quantity < 1
      state.items = raw.filter(
        item => item && item.eventId && typeof item.quantity === 'number' && item.quantity >= 1
      )
      state.hydrated = true
    },

    /** Add an event to the cart or increase quantity if already present.
     *  Caps quantity at maxAvailable (spots left) to prevent over-booking. */
    addToCart(state, action) {
      const { eventId, title, ticketPrice, quantity = 1, image = null, startTime, venue, maxAvailable } = action.payload

      if (!eventId || quantity < 1) return

      // maxAvailable = available spots for this event (seats - registered)
      const cap = typeof maxAvailable === 'number' && maxAvailable >= 0 ? maxAvailable : Infinity

      const existing = state.items.find(item => item.eventId === eventId)
      if (existing) {
        // Use the freshest cap between what we already stored and what was passed
        const effectiveCap = typeof maxAvailable === 'number' ? cap : (existing.maxAvailable ?? Infinity)
        const newQty = Math.min(existing.quantity + quantity, effectiveCap)
        if (newQty <= 0) return // sold out — ignore the add attempt silently
        existing.quantity = newQty
        if (typeof maxAvailable === 'number') existing.maxAvailable = cap
      } else {
        const newQty = Math.min(quantity, cap)
        if (newQty <= 0) return // sold out — do not add to cart
        state.items.push({
          eventId,
          title,
          ticketPrice: parseFloat(ticketPrice) || 0,
          quantity: newQty,
          image,
          startTime,
          venue,
          maxAvailable: cap === Infinity ? null : cap
        })
      }
      persistCart(state.items)
    },

    /** Update quantity for a specific event.
     *  Caps at maxAvailable if known (set by addToCart or DB validation). */
    updateQuantity(state, action) {
      const { eventId, quantity } = action.payload
      if (quantity < 1) return

      const item = state.items.find(i => i.eventId === eventId)
      if (item) {
        const cap = item.maxAvailable ?? Infinity
        item.quantity = Math.min(quantity, cap)
        persistCart(state.items)
      }
    },

    /** Remove an event from the cart */
    removeFromCart(state, action) {
      const { eventId } = action.payload
      state.items = state.items.filter(i => i.eventId !== eventId)
      persistCart(state.items)
    },

    /** Clear the entire cart */
    clearCart(state) {
      state.items = []
      persistCart(state.items)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(validateCart.pending, state => {
        state.validating = true
        state.validationError = null
        state.validationRemovedCount = 0
      })
      .addCase(validateCart.fulfilled, (state, action) => {
        state.validating = false
        const dbEvents = action.payload
        const prevCount = state.items.length

        // Update cart items with fresh DB prices and remove stale items
        state.items = state.items
          .map(item => {
            const dbEvent = dbEvents.find(e => e.id === item.eventId)
            if (!dbEvent) return null // event no longer exists/published

            const dbAvailable = Math.max(0, (dbEvent.seats || 0) - (dbEvent.registered || 0))

            // Sold out — remove from cart entirely
            if (dbAvailable <= 0) return null

            return {
              ...item,
              title: dbEvent.title,
              ticketPrice: parseFloat(dbEvent.ticket_price) || 0,
              startTime: dbEvent.start_time,
              venue: dbEvent.venue || item.venue,
              image: dbEvent.images?.[0] || item.image,
              maxAvailable: dbAvailable,
              // Cap stored quantity to actual availability — no fallback to 1
              quantity: Math.min(item.quantity, dbAvailable)
            }
          })
          .filter(Boolean)

        state.validationRemovedCount = prevCount - state.items.length
        persistCart(state.items)
      })
      .addCase(validateCart.rejected, (state, action) => {
        state.validating = false
        state.validationError = action.payload
      })
  }
})

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartItems = state => state.cart.items
export const selectCartEventCount = state => state.cart.items.length
export const selectCartItemCount = state =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartSubtotal = state =>
  state.cart.items.reduce((sum, item) => sum + item.ticketPrice * item.quantity, 0)

export const { hydrateCart, addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
