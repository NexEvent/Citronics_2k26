import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import adminService from 'src/services/admin-service'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)
  if (!authenticated) {
    return res.status(401).json({ error })
  }

  try {
    const period = parseInt(req.query.period) || 30
    // Admin scoping — Admin sees only analytics for their managed events
    const managerId = permissions.isOwner ? null : user.id
    const data = await adminService.getAnalytics(period, managerId)

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('Analytics fetch error:', error)

    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}