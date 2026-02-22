import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Thunks ────────────────────────────────────────────────────────────────────

/** KPI overview: total events, registrations, tickets sold, revenue */
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/dashboard/stats')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch stats')
    }
  }
)

/** Next 5 upcoming published events */
export const fetchUpcomingEvents = createAsyncThunk(
  'dashboard/fetchUpcomingEvents',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/dashboard/events')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch events')
    }
  }
)

/** Last 10 registrations */
export const fetchRecentRegistrations = createAsyncThunk(
  'dashboard/fetchRecentRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/dashboard/registrations')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch registrations')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  stats: null,
  upcomingEvents: [],
  recentRegistrations: [],
  statsLoading: false,
  eventsLoading: false,
  registrationsLoading: false,
  error: null
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    resetDashboard: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending,    (state)          => { state.statsLoading = true;  state.error = null })
      .addCase(fetchDashboardStats.fulfilled,  (state, action)  => { state.statsLoading = false; state.stats = action.payload })
      .addCase(fetchDashboardStats.rejected,   (state, action)  => { state.statsLoading = false; state.error = action.payload })
      // fetchUpcomingEvents
      .addCase(fetchUpcomingEvents.pending,    (state)          => { state.eventsLoading = true;  state.error = null })
      .addCase(fetchUpcomingEvents.fulfilled,  (state, action)  => { state.eventsLoading = false; state.upcomingEvents = action.payload ?? [] })
      .addCase(fetchUpcomingEvents.rejected,   (state, action)  => { state.eventsLoading = false; state.error = action.payload })
      // fetchRecentRegistrations
      .addCase(fetchRecentRegistrations.pending,   (state)         => { state.registrationsLoading = true;  state.error = null })
      .addCase(fetchRecentRegistrations.fulfilled, (state, action) => { state.registrationsLoading = false; state.recentRegistrations = action.payload ?? [] })
      .addCase(fetchRecentRegistrations.rejected,  (state, action) => { state.registrationsLoading = false; state.error = action.payload })
  }
})

export const { clearError, resetDashboard } = dashboardSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectDashboardStats         = (state) => state.dashboard.stats
export const selectUpcomingEvents         = (state) => state.dashboard.upcomingEvents
export const selectRecentRegistrations    = (state) => state.dashboard.recentRegistrations
export const selectStatsLoading           = (state) => state.dashboard.statsLoading
export const selectEventsLoading          = (state) => state.dashboard.eventsLoading
export const selectRegistrationsLoading   = (state) => state.dashboard.registrationsLoading
export const selectDashboardError         = (state) => state.dashboard.error

export default dashboardSlice.reducer
