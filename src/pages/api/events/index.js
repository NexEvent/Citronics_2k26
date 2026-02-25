import eventService from 'src/services/event-service'

/**
 * /api/events
 * GET — List published events with optional filters.
 *
 * Query params:
 *   departmentId — department ID (numeric, omit for all)
 *   search       — search term (matches name, tagline, venue)
 *   sort         — 'newest' | 'oldest' | 'popular'
 *   page         — page number (1-based, default 1)
 *   limit        — items per page (default 14, max 50)
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const {
      departmentId,
      search = '',
      sort = 'newest',
      page = '1',
      limit = '14'
    } = req.query

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 14))
    const offset = (pageNum - 1) * limitNum
    const deptId = departmentId ? parseInt(departmentId) || null : null

    const [events, total] = await Promise.all([
      eventService.getPublishedEvents({
        departmentId: deptId,
        search,
        sort,
        limit: limitNum,
        offset
      }),
      eventService.countPublishedEvents({
        departmentId: deptId,
        search
      })
    ])

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('[/api/events]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
