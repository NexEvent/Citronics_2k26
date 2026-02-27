import eventService from 'src/services/event-service'

/**
 * /api/cart/validate
 * POST — Validate cart items against the database.
 *
 * Body: { eventIds: number[] }
 * Returns fresh event data (prices, availability) for the given IDs.
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const { eventIds } = req.body

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ success: false, message: 'eventIds must be a non-empty array' })
    }

    // Sanitize: only allow numeric IDs, cap at 50
    const sanitized = eventIds
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0)
      .slice(0, 50)

    if (sanitized.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid event IDs provided' })
    }

    const events = await eventService.getEventsByIds(sanitized)

    return res.status(200).json({ success: true, data: events })
  } catch (error) {
    console.error('[/api/cart/validate]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
