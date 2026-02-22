import { useContext } from 'react'
import { SettingsContext } from 'src/context/SettingsContext'

/**
 * Hook to access settings context
 */
export const useSettings = () => useContext(SettingsContext)
