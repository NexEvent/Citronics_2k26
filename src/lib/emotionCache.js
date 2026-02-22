import createCache from '@emotion/cache'

/**
 * Creates a client-side Emotion cache.
 * Used by _app.js for MUI SSR/CSR compatibility.
 */
export function createEmotionCache() {
  return createCache({ key: 'css' })
}
