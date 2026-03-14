import adminService from 'src/services/admin-service'
import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'

/**
 * /api/admin/events
 *
 * GET  — List events (Owner + Admin)
 * POST — Create event (Owner only)
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  // Admin (read-only) cannot create
  if (req.method !== 'GET' && !permissions.canCreate) {
    return res.status(403).json({ success: false, message: 'Only Owner can create events' })
  }

  try {
    if (req.method === 'GET') {
      const pageRaw = Array.isArray(req.query.page) ? req.query.page[0] : (req.query.page || '1')
      const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : (req.query.limit || '20')
      const status = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status
      const search = Array.isArray(req.query.search) ? req.query.search[0] : (req.query.search || '')
      const departmentId = Array.isArray(req.query.departmentId) ? req.query.departmentId[0] : req.query.departmentId

      const pageNum = Math.max(1, parseInt(pageRaw, 10))
      const limitNum = Math.min(100, Math.max(1, parseInt(limitRaw, 10)))
      const offset = (pageNum - 1) * limitNum

      // Admin scoping — Admin sees only events they manage, Owner sees all
      const managerId = permissions.isOwner ? null : user.id

      const [events, total] = await Promise.all([
        adminService.getAllEventsAdmin({ limit: limitNum, offset, status, search, departmentId, managerId }),
        adminService.getEventsCountAdmin({ status, search, departmentId, managerId })
      ])

      return res.status(200).json({
        success: true,
        data: events,
        pagination: { page: pageNum, limit: limitNum, total: parseInt(total), totalPages: Math.ceil(parseInt(total) / limitNum) }
      })
    }

    if (req.method === 'POST') {
      const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId } = req.body

      if (!name || !startTime || !endTime || !maxTickets) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
      }

      const newEvent = await adminService.createEvent({
        name, description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        venue,
        maxTickets: parseInt(maxTickets, 10),
        ticketPrice: parseFloat(ticketPrice) || 0,
        departmentId,
        createdBy: user.id
      })

      return res.status(201).json({ success: true, message: 'Event created successfully', data: newEvent })
    }

    res.setHeader('Allow', ['GET', 'POST'])

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (err) {
    console.error('[/api/admin/events]', err)

    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
