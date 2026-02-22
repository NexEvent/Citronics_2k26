import { useEffect, useState, useCallback } from 'react'

/**
 * usePWA
 *
 * Handles:
 *  - Service Worker registration / update detection
 *  - A2HS (Add to Home Screen) install prompt
 *  - Online/offline network status
 */
const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistration, setSwRegistration] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // ── Online / Offline ───────────────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // ── Detect standalone (already installed) ─────────────────────────────────
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(standalone)
  }, [])

  // ── Service Worker registration ────────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        setSwRegistration(reg)

        // Detect update
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })

        console.log('[PWA] Service Worker registered')
      } catch (err) {
        console.error('[PWA] Service Worker registration failed:', err)
      }
    }

    register()
  }, [])

  // ── A2HS install prompt ────────────────────────────────────────────────────
  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPromptEvent(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  // ── Prompt install ─────────────────────────────────────────────────────────
  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) return

    installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
    }
    setInstallPromptEvent(null)
  }, [installPromptEvent])

  // ── Apply SW update ────────────────────────────────────────────────────────
  const applyUpdate = useCallback(() => {
    if (!swRegistration?.waiting) return
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }, [swRegistration])

  return {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    promptInstall,
    applyUpdate,
    swRegistration
  }
}

export default usePWA
