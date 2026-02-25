import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Thunks ────────────────────────────────────────────────────────────────────

/**
 * Fetch all home page data in a single API call.
 * Returns: departments, events, scheduleDays, stats, sponsors,
 *          testimonials, highlights, heroWords, eventStartDate
 */
export const fetchHomeData = createAsyncThunk(
  'events/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/home')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch home data')
    }
  }
)

/**
 * Fetch published events with filters & pagination.
 * @param {object} params - { category, search, sort, page, limit }
 */
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/events', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch events')
    }
  }
)

/**
 * Fetch a single event by ID (for event detail page).
 */
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/events/${id}`)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch event')
    }
  }
)

/**
 * Fetch all departments.
 */
export const fetchDepartments = createAsyncThunk(
  'events/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/departments')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch departments')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  // Home page data
  homeData: null,
  homeLoading: false,

  // Events listing
  events: [],
  pagination: { page: 1, limit: 14, total: 0, totalPages: 0 },
  eventsLoading: false,

  // Departments
  departments: [],
  departmentsLoading: false,

  // Single event detail
  currentEvent: null,
  currentEventLoading: false,

  // Shared
  error: null
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    clearCurrentEvent: state => {
      state.currentEvent = null
    },
    resetEvents: () => initialState
  },
  extraReducers: builder => {
    builder
      // ── fetchHomeData ──
      .addCase(fetchHomeData.pending, state => {
        state.homeLoading = true
        state.error = null
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.homeLoading = false
        state.homeData = action.payload
        // Also populate departments from home data
        if (action.payload.departments) {
          state.departments = action.payload.departments
        }
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.homeLoading = false
        state.error = action.payload
      })

      // ── fetchEvents ──
      .addCase(fetchEvents.pending, state => {
        state.eventsLoading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.eventsLoading = false
        state.events = action.payload.data || []
        state.pagination = action.payload.pagination || initialState.pagination
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.eventsLoading = false
        state.error = action.payload
      })

      // ── fetchEventById ──
      .addCase(fetchEventById.pending, state => {
        state.currentEventLoading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEventLoading = false
        state.currentEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentEventLoading = false
        state.error = action.payload
      })

      // ── fetchDepartments ──
      .addCase(fetchDepartments.pending, state => {
        state.departmentsLoading = true
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsLoading = false
        state.departments = action.payload || []
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearCurrentEvent, resetEvents } = eventsSlice.actions
export default eventsSlice.reducer
