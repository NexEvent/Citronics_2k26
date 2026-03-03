import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import { getQueueStats } from 'src/services/email-queue'

/**
 * GET /api/email/queue-status
 *
 * Returns email queue diagnostics (pending count, processing state, recent failures).
 * Admin-only endpoint for monitoring.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    // Admin only
    const ELEVATED_ROLES = ['admin', 'owner']
    const sessionRole = (session.user.role || '').toLowerCase()
    if (!ELEVATED_ROLES.includes(sessionRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const stats = getQueueStats()

    return res.status(200).json({ success: true, data: stats })
  } catch (error) {
    console.error('[GET /api/email/queue-status]', error)

    return res.status(500).json({ success: false, message: 'Failed to get queue status' })
  }
}
