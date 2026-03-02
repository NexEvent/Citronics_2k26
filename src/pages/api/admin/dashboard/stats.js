import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import adminService from 'src/services/admin-service'

/**
 * /api/admin/dashboard/stats
 * 
 * GET — Fetch dashboard statistics
 * 
 * Returns:
 * - totalEvents: Total number of events
 * - activeEvents: Events with status 'active' or 'published'
 * - totalUsers: Total number of users
 * - totalBookings: Total number of bookings
 * - totalRevenue: Sum of all confirmed booking amounts
 */
export default async function handler(req, res) {
  const { authenticated, error } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const stats = await adminService.getDashboardStats()

    return res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('[/api/admin/dashboard/stats]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
