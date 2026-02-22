import { createContext, useState, useEffect } from 'react'
import themeConfig from 'src/configs/themeConfig'

// Initial settings from config
const initialSettings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  footer: themeConfig.footer,
  layout: themeConfig.layout,
  lastLayout: themeConfig.layout,
  direction: themeConfig.direction,
  navHidden: themeConfig.navHidden,
  appBarBlur: themeConfig.appBarBlur,
  navCollapsed: themeConfig.navCollapsed,
  contentWidth: themeConfig.contentWidth,
  toastPosition: themeConfig.toastPosition,
  appBar: themeConfig.layout === 'horizontal' && themeConfig.appBar === 'hidden' 
    ? 'fixed' 
    : themeConfig.appBar
}

// Static settings (not persisted)
const staticSettings = {
  appBar: initialSettings.appBar,
  footer: initialSettings.footer,
  layout: initialSettings.layout,
  navHidden: initialSettings.navHidden,
  lastLayout: initialSettings.lastLayout,
  toastPosition: initialSettings.toastPosition
}

/**
 * Restore settings from localStorage
 */
const restoreSettings = () => {
  let settings = null
  
  try {
    const storedData = typeof window !== 'undefined' 
      ? window.localStorage.getItem('settings') 
      : null
      
    if (storedData) {
      settings = { ...JSON.parse(storedData), ...staticSettings }
    } else {
      settings = initialSettings
    }
  } catch (err) {
    console.error('Error restoring settings:', err)
    settings = initialSettings
  }

  return settings
}

/**
 * Store settings in localStorage
 */
const storeSettings = (settings) => {
  const initSettings = Object.assign({}, settings)
  
  // Remove static settings before storing
  delete initSettings.appBar
  delete initSettings.footer
  delete initSettings.layout
  delete initSettings.navHidden
  delete initSettings.lastLayout
  delete initSettings.toastPosition
  
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('settings', JSON.stringify(initSettings))
  }
}

// Create context
export const SettingsContext = createContext({
  saveSettings: () => null,
  settings: initialSettings
})

/**
 * Settings Provider Component
 */
export const SettingsProvider = ({ children, pageSettings }) => {
  const [settings, setSettings] = useState({ ...initialSettings })

  useEffect(() => {
    const restoredSettings = restoreSettings()
    
    if (restoredSettings) {
      setSettings({ ...restoredSettings })
    }
    
    if (pageSettings) {
      setSettings(prev => ({ ...prev, ...pageSettings }))
    }
  }, [pageSettings])

  // Handle layout changes
  useEffect(() => {
    if (settings.layout === 'horizontal' && settings.mode === 'semi-dark') {
      saveSettings({ ...settings, mode: 'light' })
    }
    
    if (settings.layout === 'horizontal' && settings.appBar === 'hidden') {
      saveSettings({ ...settings, appBar: 'fixed' })
    }
  }, [settings.layout])

  const saveSettings = (updatedSettings) => {
    storeSettings(updatedSettings)
    setSettings(updatedSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const SettingsConsumer = SettingsContext.Consumer
