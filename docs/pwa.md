# PWA Setup & Offline Strategy

> **App name:** Citronics  
> **Theme colour:** `#7C3AED`  
> **Icons location:** `public/images/icons/pwa/`  
> **Icon generator:** `node scripts/generate-pwa-icons.js`

---

## What's Implemented

| Feature | File |
|---------|------|
| Web App Manifest | `public/manifest.json` |
| Service Worker | `public/sw.js` |
| Offline fallback page | `public/offline.html` |
| SW registration + A2HS hook | `src/hooks/usePWA.js` |
| Install / Update / Offline UI | `src/components/PWAPrompts/index.js` |
| PWA meta tags (static) | `src/pages/_document.js` |
| PWA meta tags (dynamic) | `src/pages/_app.js` → `<Head>` |
| SW headers (no-cache) | `next.config.js` |
| Icon generation script | `scripts/generate-pwa-icons.js` |

---

## Service Worker (`public/sw.js`)

### Cache versioning

```js
const CACHE_VERSION = 'v1'
const CACHE_NAME = `citronics-${CACHE_VERSION}`
```

> When you make breaking changes to cached assets, bump the version: `v2`, `v3`, …  
> The `activate` handler automatically deletes **all** caches whose name ≠ `CACHE_NAME`,  
> including the legacy `eventhub-*` caches from the pre-rebrand era (migration is automatic).

### Caching strategy — Network First

```
Request
  │
  ├─► Network ──success?──► clone → cache.put() ──► return response
  │
  └─► (network failed)
        │
        ├─► cache.match() ──hit?──► return cached response
        │
        └─► (cache miss)
              │
              └─► navigation? ──► /offline.html
                    │
                    └─► 503 plain text
```

Network-first is chosen because event/ticket data changes frequently and stale reads are dangerous.

### App-shell pre-cached on install

```js
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/events',
  '/offline.html',
  '/images/icons/pwa/icon-192x192.png',
  '/images/icons/pwa/icon-512x512.png',
  '/logo/citronics2.png'
]
```

### What is intentionally NOT cached

| Pattern | Reason |
|---------|--------|
| `/api/*` | Always network — stale API data causes bugs |
| Cross-origin requests | Outside SW scope |
| Non-GET methods | POST / PUT / DELETE must not be intercepted |
| `/_next/*` | Next.js internals — still network-first, but not skipped |

---

## Service Worker Registration (`src/hooks/usePWA.js`)

```js
const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

// Detect background update
reg.addEventListener('updatefound', () => {
  const newWorker = reg.installing
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      setUpdateAvailable(true) // show "New version ready" banner
    }
  })
})
```

The hook also tracks:
- `isOnline` — `navigator.onLine` + `online`/`offline` events
- `isInstallable` — set when `beforeinstallprompt` fires
- `isInstalled` — detected via `(display-mode: standalone)` media query

`<PWAPrompts>` is mounted once in `src/pages/_app.js`.

---

## Manifest (`public/manifest.json`)

```json
{
  "name":             "Citronics",
  "short_name":       "Citronics",
  "start_url":        "/",
  "display":          "standalone",
  "theme_color":      "#7C3AED",
  "background_color": "#ffffff",
  "scope":            "/"
}
```

> `start_url: "/"` is correct — the root page is public and always accessible.  
> Do **not** use `/dashboard` as start_url; unauthenticated users would get a redirect loop.

### Icon matrix

| File | Size | Purpose |
|------|------|---------|
| `icon-48x48.png` | 48×48 | any |
| `icon-72x72.png` | 72×72 | any |
| `icon-96x96.png` | 96×96 | any (shortcut icons) |
| `icon-128x128.png` | 128×128 | any |
| `icon-144x144.png` | 144×144 | any (MS tile) |
| `icon-152x152.png` | 152×152 | any |
| `icon-192x192.png` | 192×192 | any ← **required for installability** |
| `icon-384x384.png` | 384×384 | any |
| `icon-512x512.png` | 512×512 | any ← **required for installability** |
| `icon-192x192-maskable.png` | 192×192 | maskable |
| `icon-512x512-maskable.png` | 512×512 | maskable |
| `apple-touch-icon.png` | 180×180 | linked in `<head>` for iOS |

> **Why separate `any` and `maskable` entries?**  
> Combining `"purpose": "any maskable"` in one entry causes some browsers/launchers to apply  
> the maskable safe-zone clipping to all uses (including favicon), which looks wrong.  
> Keep them as separate objects.

### Re-generating icons

```bash
# Reads: public/logo/citronics2.png
# Writes: public/images/icons/pwa/
node scripts/generate-pwa-icons.js
```

Maskable icons are generated with a `#7C3AED` background and 10 % padding on each side  
so the logo stays inside the safe zone on every launcher shape (circle, squircle, etc.).

---

## Meta Tags

### `src/pages/_document.js` (static — runs server-side, no JS)

```jsx
<Head>
  {/* Fonts */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  ...

  {/* PWA icons */}
  <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/pwa/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32"  href="/images/icons/pwa/icon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16"  href="/images/icons/pwa/icon-16x16.png" />
  <meta name="msapplication-TileImage" content="/images/icons/pwa/icon-144x144.png" />
  <meta name="msapplication-TileColor" content="#7C3AED" />
</Head>
```

### `src/pages/_app.js` (dynamic — can read Next.js `Head` context)

```jsx
<Head>
  <title>Citronics</title>
  <meta name="application-name"                   content="Citronics" />
  <meta name="apple-mobile-web-app-capable"        content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title"          content="Citronics" />
  <meta name="mobile-web-app-capable"              content="yes" />
  <meta name="theme-color"                         content="#7C3AED" />
  <link rel="manifest"                             href="/manifest.json" />
</Head>
```

---

## `next.config.js` — Service Worker Headers

```js
{
  source: '/sw.js',
  headers: [
    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
    { key: 'Content-Type',  value: 'application/javascript; charset=utf-8' }
  ]
}
```

This ensures the browser **always** fetches the freshest SW, regardless of HTTP cache.

---

## Background Sync (Offline Registrations)

Offline registration requests are stored in IndexedDB.  
When connectivity is restored, the SW replays them automatically.

```js
// Browser side — queue before going offline
await navigator.serviceWorker.ready
await registration.sync.register('sync-registrations')

// sw.js — replay on reconnect
self.addEventListener('sync', event => {
  if (event.tag === 'sync-registrations') {
    event.waitUntil(syncPendingRegistrations())
  }
})
```

The IDB store is `citronics-offline` → object store `pending-registrations` (keyPath: `id`).

---

## Forcing a SW Update

```js
// In usePWA.js → applyUpdate()
swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
window.location.reload()

// sw.js listens:
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
```

The `<PWAPrompts>` component surfaces this as a non-intrusive top-centre snackbar.

---

## Testing PWA Locally

```bash
yarn build && yarn start
```

Then in Chrome DevTools:

| Tab | What to check |
|-----|---------------|
| Application → Service Workers | Status = "activated and running", no errors |
| Application → Manifest | No red warnings; icons load; `start_url` resolves |
| Application → Storage | Cache Storage → `citronics-v1` entries present |
| Network → Offline ✓ | Navigate to `/events` → should show `/offline.html` |
| Lighthouse → PWA | All green; installability criteria met |

### Checklist for installability (Chrome / Edge)

- [x] Valid `manifest.json` served with correct MIME type
- [x] `display: standalone` (or `minimal-ui`)
- [x] 192×192 and 512×512 icons present
- [x] `start_url` responds with 200
- [x] Served over HTTPS (or `localhost`)
- [x] Service Worker registered and active
- [x] SW fetch handler present

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Install prompt never shows | SW not registered / no fetch handler | Check DevTools → Application → Service Workers |
| Icons show as blank | Wrong path in manifest | Run `node scripts/generate-pwa-icons.js` and verify paths |
| Offline page not showing | SW pre-cache failed on install | Check SW console errors; ensure `/offline.html` is reachable |
| Stale content after deploy | Browser cached old SW | Bump `CACHE_VERSION` in `sw.js` |
| `display-mode: standalone` not working | `start_url` scope mismatch | Ensure `start_url` is within `scope: "/"` |
