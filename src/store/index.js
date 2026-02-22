import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'

/**
 * Redux Store Configuration — Citronics
 * Add new slice reducers here as pages are built.
 */
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
