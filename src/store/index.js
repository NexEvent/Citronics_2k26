import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'
import eventsReducer from './slices/eventsSlice'
import voiceReducer from './slices/voiceSlice'
import cartReducer from './slices/cartSlice'
import checkoutReducer from './slices/checkoutSlice'

/**
 * Redux Store Configuration — Citronics
 * Add new slice reducers here as pages are built.
 */
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    events: eventsReducer,
    voice: voiceReducer,
    cart: cartReducer,
    checkout: checkoutReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
