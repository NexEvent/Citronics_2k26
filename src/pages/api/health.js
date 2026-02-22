import { testConnection } from 'src/lib/database'

/**
 * /api/health
 * GET — verify server is up and DB connection is alive.
 * No auth required — safe for uptime monitors / first-run validation.
 *
 * Response 200: { ok: true,  db: { ok: true, now: "2026-..." } }
 * Response 500: { ok: false, db: { ok: false, error: "..." }   }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ ok: false, message: `Method ${req.method} not allowed` })
  }

  let db = { ok: false, error: null }

  try {
    const result = await testConnection()
    db = { ok: true, now: result.now }
  } catch (error) {
    db = { ok: false, error: error.message }
    console.error('[/api/health] DB connection failed:', error.message)
    return res.status(500).json({ ok: false, db })
  }

  return res.status(200).json({ ok: true, db })
}
