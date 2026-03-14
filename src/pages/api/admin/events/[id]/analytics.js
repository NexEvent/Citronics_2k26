import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import { dbAny, dbOneOrNone } from 'src/lib/database'

/**
 * /api/admin/events/[id]/analytics
 * 
 * GET — Get event analytics (booking trends, revenue, etc.)
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const { id } = req.query
    const eventId = parseInt(id, 10)

    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' })
    }

    // Check access — Admin can only view events they manage
    const event = await dbOneOrNone('SELECT id, manager_id FROM events WHERE id = $1', [eventId])
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

    if (!permissions.isOwner && Number(event.manager_id) !== Number(user.id)) {
      return res.status(403).json({ success: false, message: 'You can only view events you manage' })
    }

    // Get analytics for the event
    const analytics = await dbOneOrNone(`
      SELECT 
        COUNT(DISTINCT b.id) FILTER (WHERE b.status='confirmed')::int AS ticketsSold,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status='confirmed'), 0)::numeric AS revenue,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status='confirmed')::int AS totalBookings,
        ROUND(
          (COUNT(DISTINCT b.id) FILTER (WHERE b.status='confirmed')::float / NULLIF(e.max_tickets, 0) * 100)::numeric,
          2
        ) AS occupancyRate
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, e.max_tickets
    `, [eventId])

    return res.status(200).json({
      success: true,
      data: analytics || {
        ticketsSold: 0,
        revenue: 0,
        totalBookings: 0,
        occupancyRate: 0
      }
    })
  } catch (err) {
    console.error('[/api/admin/events/[id]/analytics]', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
