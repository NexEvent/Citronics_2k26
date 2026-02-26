import eventService from 'src/services/event-service'

/**
 * /api/departments
 * GET — All departments ordered by name.
 *
 * Public endpoint — no authentication required.
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
    console.error('[/api/departments]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
