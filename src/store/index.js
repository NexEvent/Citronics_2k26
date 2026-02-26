import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'
import eventsReducer from './slices/eventsSlice'

/**
 * Redux Store Configuration — Citronics
 * Add new slice reducers here as pages are built.
 */
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    events: eventsReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
