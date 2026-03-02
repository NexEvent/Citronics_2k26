import eventService from 'src/services/event-service'

/**
 * /api/events/[id]
 * GET — Single event with full details.
 *
 * Public endpoint — no authentication required.
 * Returns parsed JSONB for prize, rules, rounds.
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

    // Ensure JSONB fields are properly parsed (pg driver usually handles this,
    // but guard against edge cases where they might be strings)
    const data = {
      ...event,
      prize: typeof event.prize === 'string' ? JSON.parse(event.prize) : (event.prize || null),
      rules: typeof event.rules === 'string' ? JSON.parse(event.rules) : (event.rules || null),
      rounds: typeof event.rounds === 'string' ? JSON.parse(event.rounds) : (event.rounds || null)
    }

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('[/api/events/[id]]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
