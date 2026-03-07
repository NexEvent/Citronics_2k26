import eventService from 'src/services/event-service'

/**
 * /api/events
 * GET — List published events with optional filters.
 *
 * Query params:
 *   categoryId   — category ID (numeric, omit for all)
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
    // Normalize query params to scalar strings (handles repeated params e.g. ?page=1&page=2)
    const raw = req.query
    const categoryId = Array.isArray(raw.categoryId) ? raw.categoryId[0] : raw.categoryId
    const departmentId = Array.isArray(raw.departmentId) ? raw.departmentId[0] : raw.departmentId
    const search = Array.isArray(raw.search) ? raw.search[0] : (raw.search || '')
    const sort = Array.isArray(raw.sort) ? raw.sort[0] : (raw.sort || 'newest')
    const pageRaw = Array.isArray(raw.page) ? raw.page[0] : (raw.page || '1')
    const limitRaw = Array.isArray(raw.limit) ? raw.limit[0] : (raw.limit || '14')

    // Validate numeric fields
    const parsedPage = parseInt(pageRaw, 10)
    const parsedLimit = parseInt(limitRaw, 10)
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined
    const parsedCatId = categoryId ? parseInt(categoryId, 10) : undefined

    if (isNaN(parsedPage) || isNaN(parsedLimit) || (departmentId && isNaN(parsedDeptId)) || (categoryId && isNaN(parsedCatId))) {
      return res.status(400).json({ success: false, message: 'Invalid numeric query parameter (page, limit, departmentId, or categoryId)' })
    }

    if (!['newest', 'oldest', 'popular'].includes(sort)) {
      return res.status(400).json({ success: false, message: 'Invalid sort parameter. Must be newest, oldest, or popular' })
    }

    const pageNum = Math.max(1, parsedPage)
    const limitNum = Math.min(50, Math.max(1, parsedLimit))
    const offset = (pageNum - 1) * limitNum
    const deptId = parsedDeptId || null
    const catId = parsedCatId || null

    const [events, total] = await Promise.all([
      eventService.getPublishedEvents({
        departmentId: deptId,
        categoryId: catId,
        search,
        sort,
        limit: limitNum,
        offset
      }),
      eventService.countPublishedEvents({
        departmentId: deptId,
        categoryId: catId,
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
