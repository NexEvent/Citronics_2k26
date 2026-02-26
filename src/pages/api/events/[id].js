import eventService from 'src/services/event-service'

/**
 * /api/events/[id]
 * GET — Single event with full details.
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const { id } = req.query

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' })
    }

    const event = await eventService.getEventById(parseInt(id))

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    return res.status(200).json({ success: true, data: event })
  } catch (error) {
    console.error('[/api/events/[id]]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
