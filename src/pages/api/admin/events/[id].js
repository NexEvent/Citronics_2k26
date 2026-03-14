import adminService from 'src/services/admin-service'
import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'

/**
 * /api/admin/events/[id]
 *
 * GET    — Get event (Owner + Admin)
 * PUT    — Update event (Owner only)
 * DELETE — Delete event (Owner only)
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  const { id } = req.query
  const eventId = parseInt(id, 10)

  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' })
  }

  try {
    if (req.method === 'GET') {
      const event = await adminService.getEventById(eventId)
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

      // Admin scoping — non-Owner can only see events they manage (manager_id must match user.id)
      if (!permissions.isOwner && Number(event.manager_id) !== Number(user.id)) {
        return res.status(403).json({ success: false, message: 'You can only view events you manage' })
      }

      return res.status(200).json({ success: true, data: event })
    }

    if (req.method === 'PUT') {
      if (!permissions.canUpdate) {
        return res.status(403).json({ success: false, message: 'Only Owner can modify events' })
      }

      const event = await adminService.getEventById(eventId)
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

      const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, status, visibility } = req.body

      const updated = await adminService.updateEvent(eventId, {
        name, description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        venue,
        maxTickets: maxTickets ? parseInt(maxTickets, 10) : undefined,
        ticketPrice: ticketPrice !== undefined ? parseFloat(ticketPrice) : undefined,
        departmentId, status, visibility
      })

      return res.status(200).json({ success: true, message: 'Event updated successfully', data: updated })
    }

    if (req.method === 'DELETE') {
      if (!permissions.canDelete) {
        return res.status(403).json({ success: false, message: 'Only Owner can delete events' })
      }

      const event = await adminService.getEventById(eventId)
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

      await adminService.deleteEvent(eventId)

      return res.status(200).json({ success: true, message: 'Event deleted successfully' })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (err) {
    console.error(`[/api/admin/events/${id}]`, err)

    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
