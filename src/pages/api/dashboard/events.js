import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import dashboardService from 'src/services/dashboard-service'

/**
 * /api/dashboard/events
 * GET — next 5 upcoming published events (for dashboard widget)
 */
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session) return res.status(401).json({ success: false, message: 'Not authenticated' })

    switch (req.method) {
      case 'GET': {
        const data = await dashboardService.getUpcomingEvents()
        return res.status(200).json({ success: true, data })
      }

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('[/api/dashboard/events]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
