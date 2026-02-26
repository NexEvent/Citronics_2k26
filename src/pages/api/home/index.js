import eventService from 'src/services/event-service'

/**
 * /api/home
 * GET — All data needed for the public home page in a single request.
 *
 * Returns: departments, featured events, schedule, stats, sponsors,
 *          testimonials, highlights, hero words, event start date.
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const [departments, events] = await Promise.all([
      eventService.getAllDepartments(),
      eventService.getPublishedEvents({ limit: 50 })
    ])

    return res.status(200).json({
      success: true,
      data: {
        departments,
        events
      }
    })
  } catch (error) {
    console.error('[/api/home]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
