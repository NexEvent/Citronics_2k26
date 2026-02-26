import eventService from 'src/services/event-service'

/**
 * /api/categories → DEPRECATED — use /api/departments instead.
 * Kept as a redirect / alias to departments endpoint.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const departments = await eventService.getAllDepartments()

    return res.status(200).json({ success: true, data: departments })
  } catch (error) {
    console.error('[/api/categories]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
