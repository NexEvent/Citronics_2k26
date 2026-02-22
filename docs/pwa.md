# PWA Setup & Offline Strategy

---

## What's Implemented

| Feature | File |
|---------|------|
| Web App Manifest | `public/manifest.json` |
| Service Worker | `public/sw.js` |
| Offline fallback page | `public/offline.html` |
| SW registration | `src/components/PWAPrompts/usePWA.js` |
| Install prompt | `src/components/PWAPrompts/InstallPrompt.js` |
| Update notification | `src/components/PWAPrompts/UpdatePrompt.js` |

---

## Service Worker (`public/sw.js`)

### Cache name

```js
const CACHE_NAME = 'eventhub-v1'
```

> When you make breaking changes to cached assets, increment the version: `eventhub-v2`.  
> The activate handler automatically cleans up old caches.

### Caching strategy — Network First

```
Request
  ↓
Network  →  success?  →  clone response → cache it  →  return response
  ↓ fail
Cache  →  hit?  →  return cached response
  ↓ miss
Navigation request?  →  return /offline.html
  ↓
503 plain text
```

We use network-first (not cache-first) because event data changes frequently.

### What gets pre-cached on install (app shell)

```js
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/events',
  '/offline.html',
  '/images/icons/pwa/icon-192x192.png',
  '/images/icons/pwa/icon-512x512.png',
  '/images/logo.png'
]
```

### What is NOT cached

- `/api/*` routes — always network, never cache (stale data is dangerous)
- Cross-origin requests
- Non-GET requests (POST, PUT, DELETE)

---

## Registering the Service Worker

The SW is registered in `src/components/PWAPrompts/usePWA.js`:

```js
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        // Poll for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available → show UpdatePrompt
              setUpdateAvailable(true)
            }
          })
        })
      })
  }
}, [])
```

The `<PWAPrompts>` wrapper is mounted once in `UserLayout.js`.

---

## Manifest (`public/manifest.json`)

Key fields explained:

```json
{
  "name":             "EventHub",          // full name shown at install
  "short_name":       "EventHub",          // name on home screen icon
  "start_url":        "/dashboard",        // URL opened when app launches
  "display":          "standalone",        // hides browser chrome
  "theme_color":      "#7C3AED",           // status bar / title bar color
  "background_color": "#ffffff",           // splash screen background
  "scope":            "/"                  // what URLs the SW controls
}
```

### Icons required

Place these in `public/images/icons/pwa/`:

```
icon-16x16.png
icon-32x32.png
icon-96x96.png
apple-touch-icon.png    (180×180)
icon-192x192.png        (required for installability)
icon-512x512.png        (required for installability)
```

Use a tool like [RealFaviconGenerator](https://realfavicongenerator.net) to generate all sizes from a single SVG.

---

## Linking Manifest in `_document.js`

```jsx
<Head>
  <link rel="manifest"         href="/manifest.json" />
  <meta name="theme-color"     content="#7C3AED" />
  <link rel="apple-touch-icon" href="/images/icons/pwa/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable"          content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title"            content="EventHub" />
</Head>
```

---

## `next.config.js` — Service Worker Headers

```js
async headers() {
  return [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type',  value: 'application/javascript; charset=utf-8' }
      ]
    }
  ]
}
```

This ensures the browser always fetches the latest SW, not a cached version.

---

## Background Sync (Offline Registrations)

When the user submits an event registration while offline, the request is stored in IndexedDB.  
When connectivity is restored, the service worker fires a `sync` event and replays the requests.

```js
// In the browser (before going offline)
await navigator.serviceWorker.ready
await registration.sync.register('sync-registrations')

// In sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-registrations') {
    event.waitUntil(syncPendingRegistrations())
  }
})
```

---

## Forcing an Update

When a new version of the SW is deployed, show the user an update banner:

```js
// In UpdatePrompt component
const handleUpdate = () => {
  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
  window.location.reload()
}
```

The SW listens:

```js
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
```

---

## Testing PWA Locally

1. Build the app: `npm run build && npm run start`
2. Open Chrome DevTools → Application → Service Workers
3. Application → Manifest — check for any errors
4. Use "Offline" checkbox in Network tab to test offline fallback
5. Use Lighthouse → PWA audit to verify installability
