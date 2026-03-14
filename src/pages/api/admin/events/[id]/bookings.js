import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import { dbAny, dbOneOrNone } from 'src/lib/database'

/**
 * /api/admin/events/[id]/bookings
 * 
 * GET — Get all bookings/registrations for an event (includes user role)
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

    // Get all bookings for the event with user details including role
    const bookings = await dbAny(`
      SELECT 
        b.id, b.user_id, b.quantity, b.total_amount, b.status, b.booked_at AS created_at,
        u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      WHERE b.event_id = $1
      ORDER BY b.booked_at DESC
    `, [eventId])

    return res.status(200).json({
      success: true,
      data: bookings || []
    })
  } catch (err) {
    console.error('[/api/admin/events/[id]/bookings]', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
