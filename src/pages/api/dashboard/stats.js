import { getServerSession } from 'next-auth'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import dashboardService from 'src/services/dashboard-service'

/**
 * /api/dashboard/stats
 * GET — KPI overview: total events, active events, registrations, tickets sold, revenue
 */
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session) return res.status(401).json({ success: false, message: 'Not authenticated' })

    switch (req.method) {
      case 'GET': {
        const data = await dashboardService.getStats()
        return res.status(200).json({ success: true, data })
      }

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('[/api/dashboard/stats]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
