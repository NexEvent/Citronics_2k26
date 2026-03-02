import adminService from 'src/services/admin-service'
import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'

/**
 * /api/admin/events/[id]
 * 
 * GET — Get single event by ID
 * PUT — Update event details
 * DELETE — Delete event
 * 
 * Role-based permissions:
 * - Owner: Full CRUD
 * - Admin: Full CRUD
 * - Executive: Read-only access
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
    // GET — Fetch event details
    if (req.method === 'GET') {
      const event = await adminService.getEventById(eventId)

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' })
      }

      return res.status(200).json({
        success: true,
        data: event
      })
    }

    // PUT — Update event
    if (req.method === 'PUT') {
      if (!permissions.canUpdate) {
        return res.status(403).json({ success: false, message: 'Executives cannot modify events' })
      }

      const event = await adminService.getEventById(eventId)
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' })
      }

      const { 
        name, description, startTime, endTime, 
        venue, maxTickets, ticketPrice, departmentId, 
        status, visibility 
      } = req.body

      const updatedEvent = await adminService.updateEvent(eventId, {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        venue,
        maxTickets: maxTickets ? parseInt(maxTickets, 10) : undefined,
        ticketPrice: ticketPrice !== undefined ? parseFloat(ticketPrice) : undefined,
        departmentId,
        status,
        visibility
      })

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      })
    }

    // DELETE — Delete event
    if (req.method === 'DELETE') {
      if (!permissions.canDelete) {
        return res.status(403).json({ success: false, message: 'Executives cannot delete events' })
      }

      const event = await adminService.getEventById(eventId)
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' })
      }

      await adminService.deleteEvent(eventId)

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error(`[/api/admin/events/${id}]`, error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
