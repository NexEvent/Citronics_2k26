/**
 * In-memory rate limiter for Next.js API routes.
 *
 * Uses a sliding window counter per IP. Entries auto-expire to prevent
 * memory leaks. Suitable for single-instance deployments (Vercel, Railway).
 *
 * Usage:
 *   const limiter = rateLimit({ windowMs: 60_000, max: 10 })
 *   // in handler:
 *   const { ok, remaining } = limiter.check(req)
 *   if (!ok) return res.status(429).json(...)
 */

const limiters = new Map()

/**
 * @param {object} opts
 * @param {number} opts.windowMs  - Time window in milliseconds
 * @param {number} opts.max       - Max requests per window per IP
 */
export default function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  const hits = new Map()

  // Periodic cleanup every windowMs to prevent memory bloat
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key)
    }
  }, windowMs)

  // Allow GC to collect the interval if the module is unloaded
  if (cleanupInterval.unref) cleanupInterval.unref()

  return {
    /**
     * Check if the request is within rate limits.
     * @param {import('http').IncomingMessage} req
     * @returns {{ ok: boolean, remaining: number }}
     */
    check(req) {
      const forwarded = req.headers['x-forwarded-for']
      const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
                 req.socket?.remoteAddress ||
                 'unknown'
      const now = Date.now()
      const entry = hits.get(ip)

      if (!entry || now - entry.start > windowMs) {
        hits.set(ip, { start: now, count: 1 })
        return { ok: true, remaining: max - 1 }
      }

      entry.count++
      if (entry.count > max) {
        return { ok: false, remaining: 0 }
      }

      return { ok: true, remaining: max - entry.count }
    }
  }
}
