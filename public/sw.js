/**
 * Citronics Service Worker
 *
 * Network-first strategy with cache fallback.
 * Provides offline support for the PWA.
 */

const CACHE_VERSION = 'v1'
const CACHE_NAME = `citronics-${CACHE_VERSION}`
// NOTE: legacy 'eventhub-*' caches (pre-rebrand) are automatically removed
// by the activate handler below — no manual migration needed.
const OFFLINE_URL = '/offline.html'

// Assets pre-cached on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/events',
  '/offline.html',
  '/images/icons/pwa/icon-192x192.png',
  '/images/icons/pwa/icon-512x512.png',
  '/logo/citronics2.png'
]

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('[SW] Install complete — skipping waiting')
        return self.skipWaiting()
      })
      .catch((err) => console.error('[SW] Pre-cache failed:', err))
  )
})

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Removing old cache:', name)
              return caches.delete(name) // removes both old citronics-* and legacy eventhub-* caches
            })
        )
      )
      .then(() => {
        console.log('[SW] Activated — claiming clients')
        return self.clients.claim()
      })
  )
})

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip API calls — always go to network
  if (request.url.includes('/api/')) return

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return

  // Skip Next.js internals
  if (request.url.includes('/_next/')) {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  event.respondWith(networkFirstWithCache(request))
})

/**
 * Network-first strategy:
 *  1. Try network → cache a successful response
 *  2. On failure → serve from cache
 *  3. If nothing cached and it's a navigation → serve offline page
 */
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok || networkResponse.status === 0) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    // Navigation fallback → offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL)
      if (offlinePage) return offlinePage
    }

    return new Response('Service Unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

// ─── Message bus ─────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.ports?.[0]?.postMessage({ success: true })
      })
      break

    default:
      break
  }
})

// ─── Background sync ─────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-registrations') {
    event.waitUntil(syncPendingRegistrations())
  }
})

async function syncPendingRegistrations() {
  try {
    // Flush any queued offline registration requests
    const db = await openDB()
    const pending = await db.getAll('pending-registrations')

    for (const registration of pending) {
      await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration)
      })
      await db.delete('pending-registrations', registration.id)
    }
  } catch (err) {
    console.error('[SW] Background sync failed:', err)
  }
}

// Minimal IDB helper (no library needed in SW scope)
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('citronics-offline', 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('pending-registrations', { keyPath: 'id' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = reject
  })
}
