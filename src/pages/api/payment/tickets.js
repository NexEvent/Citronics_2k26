import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import paymentService from 'src/services/payment-service'

/**
 * GET /api/payment/tickets?userId=xxx
 *
 * Fetch all tickets for a user. Used in the dashboard/post-payment view.
 * Requires authenticated session. Users can only fetch their own tickets
 * unless they have an elevated role (admin/organizer).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // ── Authentication ──────────────────────────────────────────────────
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { userId } = req.query
    const requestedUserId = userId ? parseInt(userId, 10) : session.user.id

    if (isNaN(requestedUserId) || requestedUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' })
    }

    // ── Authorization ───────────────────────────────────────────────────
    const ELEVATED_ROLES = ['admin', 'organizer', 'owner', 'head']
    const sessionRole = (session.user.role || '').toLowerCase()
    if (requestedUserId !== session.user.id && !ELEVATED_ROLES.includes(sessionRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const tickets = await paymentService.getUserTickets(requestedUserId)

    return res.status(200).json({ success: true, data: { tickets } })
  } catch (error) {
    console.error('[GET /api/payment/tickets]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' })
  }
}
