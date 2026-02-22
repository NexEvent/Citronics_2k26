# State Management (Redux Toolkit)

---

## Setup

The store is configured in `src/store/index.js` and injected into the app via `<Provider>` in `_app.js`.

```js
// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer   from './slices/dashboardSlice'
import eventsReducer      from './slices/eventsSlice'
import ticketsReducer     from './slices/ticketsSlice'
import speakersReducer    from './slices/speakersSlice'
import venuesReducer      from './slices/venuesSlice'
import registrationsReducer from './slices/registrationsSlice'
import analyticsReducer   from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    dashboard:     dashboardReducer,
    events:        eventsReducer,
    tickets:       ticketsReducer,
    speakers:      speakersReducer,
    venues:        venuesReducer,
    registrations: registrationsReducer,
    analytics:     analyticsReducer
  }
})
```

---

## Slice Template

Every domain slice follows the same structure. Copy this and replace the domain name:

```js
// src/store/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/events', { params })
      return data   // { data: [...], total, page, limit }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load events')
    }
  }
)

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/events/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Event not found')
    }
  }
)

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/events', payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Create failed')
    }
  }
)

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/events/${id}`, payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed')
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/events/${id}`)
      return id   // return the ID so we can remove it from state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed')
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    list:        [],    // current page rows
    total:       0,
    page:        1,
    limit:       20,
    selected:    null,  // currently viewed/edited event
    loading:     false,
    error:       null,
    filters: {
      search:    '',
      status:    '',
      startDate: null,
      endDate:   null
    }
  },
  reducers: {
    // Synchronous state updates
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1   // reset to page 1 on new filter
    },
    setPage(state, action) {
      state.page = action.payload
    },
    clearSelected(state) {
      state.selected = null
    },
    clearError(state) {
      state.error = null
    }
  },
  extraReducers: builder => {
    // ── fetchEvents ──
    builder
      .addCase(fetchEvents.pending, state => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchEvents.fulfilled, (state, { payload }) => {
        state.loading = false
        state.list    = payload.data
        state.total   = payload.total
        state.page    = payload.page
        state.limit   = payload.limit
      })
      .addCase(fetchEvents.rejected, (state, { payload }) => {
        state.loading = false
        state.error   = payload
      })

    // ── fetchEventById ──
    builder
      .addCase(fetchEventById.pending, state => { state.loading = true })
      .addCase(fetchEventById.fulfilled, (state, { payload }) => {
        state.loading  = false
        state.selected = payload
      })
      .addCase(fetchEventById.rejected, (state, { payload }) => {
        state.loading = false
        state.error   = payload
      })

    // ── createEvent ──
    builder
      .addCase(createEvent.fulfilled, (state, { payload }) => {
        state.list.unshift(payload)
        state.total += 1
      })

    // ── updateEvent ──
    builder
      .addCase(updateEvent.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(e => e.id === payload.id)
        if (idx !== -1) state.list[idx] = payload
        if (state.selected?.id === payload.id) state.selected = payload
      })

    // ── deleteEvent ──
    builder
      .addCase(deleteEvent.fulfilled, (state, { payload: id }) => {
        state.list  = state.list.filter(e => e.id !== id)
        state.total = Math.max(0, state.total - 1)
        if (state.selected?.id === id) state.selected = null
      })
  }
})

export const { setFilters, setPage, clearSelected, clearError } = eventsSlice.actions
export default eventsSlice.reducer

// ── Selectors ──────────────────────────────────────────────────────────────────
// Colocate selectors with the slice they belong to.

export const selectEvents        = state => state.events.list
export const selectEventsTotal   = state => state.events.total
export const selectSelectedEvent = state => state.events.selected
export const selectEventsLoading = state => state.events.loading
export const selectEventsError   = state => state.events.error
export const selectEventsFilters = state => state.events.filters
export const selectEventsPage    = state => state.events.page
```

---

## Using State in Views

```js
// src/views/events/EventsListView.js
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEvents,
  setFilters,
  setPage,
  selectEvents,
  selectEventsTotal,
  selectEventsLoading,
  selectEventsFilters
} from 'src/store/slices/eventsSlice'

const EventsListView = () => {
  const dispatch = useDispatch()
  const events   = useSelector(selectEvents)
  const loading  = useSelector(selectEventsLoading)
  const filters  = useSelector(selectEventsFilters)

  useEffect(() => {
    dispatch(fetchEvents(filters))
  }, [dispatch, filters])

  const handleSearch = value => dispatch(setFilters({ search: value }))

  // ...
}
```

---

## Rules

1. **No `axios` calls in components** — put them in thunks only.
2. **Selectors live in the slice file** — import them directly; don't write `state.events.list` inline in components.
3. **Use `createAsyncThunk` for all API calls** — gives you pending/fulfilled/rejected states for free.
4. **Never mutate state outside Immer** — RTK uses Immer internally so `state.x = y` works in reducers.
5. **Error state is always a string** — `rejectWithValue(message)` returns a human-readable message, not the raw Error object.
6. **Optimistic is fine for deletes** — remove from list immediately, handle rollback in `rejected`.
