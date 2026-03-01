import adminService from 'src/services/admin-service'
import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import { isOwner, canModify } from 'src/configs/acl'

/**
 * /api/admin/users
 * 
 * GET — List all users with pagination and filtering
 * POST — Create new admin/executive user
 * 
 * Query params (GET):
 *   page — page number (1-based, default 1)
 *   limit — items per page (default 20)
 *   role — filter by role (admin, executive, student, owner, organizer)
 *   search — search by name or email
 * 
 * Role-based visibility:
 * - Owner: Can see all users including other admins and owners
 * - Admin: Can only see executives, organizers, and students (NOT other admins/owners)
 * - Executive: Same visibility as Admin (read-only)
 * 
 * Role-based permissions:
 * - Owner: Can create admins and executives
 * - Admin: Can only create executives
 * - Executive: Read-only (no POST)
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  try {
    if (req.method === 'GET') {
      // List users
      const pageRaw = Array.isArray(req.query.page) ? req.query.page[0] : (req.query.page || '1')
      const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : (req.query.limit || '20')
      const role = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role
      const search = Array.isArray(req.query.search) ? req.query.search[0] : (req.query.search || '')

      const pageNum = Math.max(1, parseInt(pageRaw, 10))
      const limitNum = Math.min(100, Math.max(1, parseInt(limitRaw, 10)))
      const offset = (pageNum - 1) * limitNum

      // Role-based visibility: Admins and Executives can't see other admins/owners
      const actingUserRole = user.role?.toLowerCase()
      const canSeeAdmins = isOwner(actingUserRole)

      const [users, total] = await Promise.all([
        adminService.getAllUsers({ limit: limitNum, offset, role, search, canSeeAdmins }),
        adminService.getUsersCount({ role, search, canSeeAdmins })
      ])

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: parseInt(total),
          totalPages: Math.ceil(parseInt(total) / limitNum)
        }
      })
    }

    if (req.method === 'POST') {
      // Check if user can create
      if (!permissions.canCreate) {
        return res.status(403).json({ success: false, message: 'Executives cannot create users' })
      }

      // Create new user (admin/executive)
      const { name, email, password, phone, role } = req.body
      const userRole = user.role?.toLowerCase()
      const targetRole = role?.toLowerCase()

      // Validation
      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
      }

      // Valid roles for creation
      const validRoles = ['admin', 'executive']
      if (!validRoles.includes(targetRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role. Only admin and executive can be created.' })
      }

      // Only owner can create admins
      if (targetRole === 'admin' && !isOwner(userRole)) {
        return res.status(403).json({ success: false, message: 'Only owner can create admin users' })
      }

      // Admins can only create executives
      if (userRole === 'admin' && targetRole !== 'executive') {
        return res.status(403).json({ success: false, message: 'Admins can only create executive users' })
      }

      try {
        const newUser = await adminService.createUser({
          name,
          email,
          password,
          phone,
          role: targetRole,
          createdBy: user.id
        })

        return res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: newUser
        })
      } catch (err) {
        if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
          return res.status(400).json({ success: false, message: 'Email already exists' })
        }
        throw err
      }
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('[/api/admin/users]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
