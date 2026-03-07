import eventService from 'src/services/event-service'

/**
 * /api/categories
 * GET — All event categories ordered by name.
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const categories = await eventService.getAllCategories()

    return res.status(200).json({ success: true, data: categories })
  } catch (error) {
    console.error('[/api/categories]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
