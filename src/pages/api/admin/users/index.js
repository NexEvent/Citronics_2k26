import adminService from 'src/services/admin-service'
import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import { isOwner } from 'src/configs/acl'

/**
 * /api/admin/users
 *
 * GET  — List users (Owner only — Admin cannot see users page)
 * POST — Create admin user (Owner only)
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  // Only Owner can access user management
  if (!permissions.canManageUsers) {
    return res.status(403).json({ success: false, message: 'Only Owner can manage users' })
  }

  try {
    if (req.method === 'GET') {
      const pageRaw = Array.isArray(req.query.page) ? req.query.page[0] : (req.query.page || '1')
      const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : (req.query.limit || '20')
      const role = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role
      const search = Array.isArray(req.query.search) ? req.query.search[0] : (req.query.search || '')

      const pageNum = Math.max(1, parseInt(pageRaw, 10))
      const limitNum = Math.min(100, Math.max(1, parseInt(limitRaw, 10)))
      const offset = (pageNum - 1) * limitNum

      const canSeeAdmins = isOwner(user.role)

      const [users, total] = await Promise.all([
        adminService.getAllUsers({ limit: limitNum, offset, role, search, canSeeAdmins }),
        adminService.getUsersCount({ role, search, canSeeAdmins })
      ])

      return res.status(200).json({
        success: true,
        data: users,
        pagination: { page: pageNum, limit: limitNum, total: parseInt(total), totalPages: Math.ceil(parseInt(total) / limitNum) }
      })
    }

    if (req.method === 'POST') {
      const { name, email, password, phone, role } = req.body
      const targetRole = role?.toLowerCase()

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
      }

      if (!['admin'].includes(targetRole)) {
        return res.status(400).json({ success: false, message: 'Only admin role can be created.' })
      }

      try {
        const newUser = await adminService.createUser({
          name, email, password, phone, role: targetRole, createdBy: user.id
        })

        return res.status(201).json({ success: true, message: 'User created successfully', data: newUser })
      } catch (err) {
        if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
          return res.status(400).json({ success: false, message: 'Email already exists' })
        }
        throw err
      }
    }

    res.setHeader('Allow', ['GET', 'POST'])

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (err) {
    console.error('[/api/admin/users]', err)

    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
