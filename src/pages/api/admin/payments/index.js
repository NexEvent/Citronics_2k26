import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import adminService from 'src/services/admin-service'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)
  if (!authenticated) {
    return res.status(401).json({ error })
  }

  try {
    const managerId = permissions.isOwner ? null : user.id
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200)
    const offset = Math.max(parseInt(req.query.offset) || 0, 0)
    const status = ['confirmed', 'pending', 'cancelled'].includes(req.query.status)
      ? req.query.status
      : null
    const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 100) : ''

    const [payments, stats] = await Promise.all([
      adminService.getPaymentsWithTickets({ limit, offset, status, managerId, search }),
      adminService.getPaymentStats(managerId)
    ])

    return res.status(200).json({ success: true, data: { payments, stats } })
  } catch (err) {
    console.error('[/api/admin/payments]', err)
    return res.status(500).json({ error: 'Failed to fetch payment data' })
  }
}
