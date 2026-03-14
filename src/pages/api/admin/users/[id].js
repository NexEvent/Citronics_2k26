import adminService from 'src/services/admin-service'
import { adminAuthMiddleware, canActOnUser } from 'src/lib/adminAuthMiddleware'

/**
 * /api/admin/users/[id]
 *
 * GET    — Get user (Owner only)
 * PUT    — Update user (Owner only)
 * DELETE — Delete user (Owner only)
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

  const { id } = req.query
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' })
  }

  try {
    if (req.method === 'GET') {
      const targetUser = await adminService.getUserById(userId)
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' })

      return res.status(200).json({ success: true, data: targetUser })
    }

    if (req.method === 'PUT') {
      const targetUser = await adminService.getUserById(userId)
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' })

      if (!canActOnUser(user, 'update', targetUser)) {
        return res.status(403).json({ success: false, message: 'Cannot edit this user' })
      }

      const { name, email, phone, role } = req.body

      if (role?.toLowerCase() === 'owner') {
        return res.status(403).json({ success: false, message: 'Cannot assign owner role' })
      }

      const updated = await adminService.updateUser(userId, { name, email, phone, role })

      return res.status(200).json({ success: true, message: 'User updated successfully', data: updated })
    }

    if (req.method === 'DELETE') {
      const targetUser = await adminService.getUserById(userId)
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' })

      if (!canActOnUser(user, 'delete', targetUser)) {
        return res.status(403).json({ success: false, message: 'Cannot delete this user' })
      }

      if (userId === parseInt(user.id, 10) || userId === user.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete your own account' })
      }

      await adminService.deleteUser(userId)

      return res.status(200).json({ success: true, message: 'User deleted successfully' })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])

    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (err) {
    console.error(`[/api/admin/users/${id}]`, err)

    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
