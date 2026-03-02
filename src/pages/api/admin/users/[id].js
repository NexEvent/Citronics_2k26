import adminService from 'src/services/admin-service'
import { adminAuthMiddleware, canActOnUser } from 'src/lib/adminAuthMiddleware'
import { isOwner } from 'src/configs/acl'

/**
 * /api/admin/users/[id]
 * 
 * GET — Get single user by ID
 * PUT — Update user details
 * DELETE — Delete user
 * 
 * Role-based visibility:
 * - Owner: Can view all users including other admins and owners
 * - Admin/Executive: Cannot view admin/owner user details
 * 
 * Role-based permissions:
 * - Owner: Can manage all users except other owners
 * - Admin: Can manage executives only
 * - Executive: Read-only access
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  const { id } = req.query
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' })
  }

  const actingUserRole = user.role?.toLowerCase()
  const canSeeAdmins = isOwner(actingUserRole)

  try {
    // GET — Fetch user details
    if (req.method === 'GET') {
      const targetUser = await adminService.getUserById(userId)

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      // Role-based visibility: Non-owners cannot view admin/owner details
      const targetRole = targetUser.role?.toLowerCase()
      if (!canSeeAdmins && (targetRole === 'admin' || targetRole === 'owner')) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to view this user' 
        })
      }

      return res.status(200).json({
        success: true,
        data: targetUser
      })
    }

    // PUT — Update user
    if (req.method === 'PUT') {
      // Check if user can modify
      if (!permissions.canUpdate) {
        return res.status(403).json({ success: false, message: 'Executives cannot modify users' })
      }

      const targetUser = await adminService.getUserById(userId)
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      // Check permission to edit this specific user
      if (!canActOnUser(user, 'update', targetUser)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to edit this user' 
        })
      }

      const { name, email, phone, role } = req.body

      // Validate role change
      if (role) {
        const targetRole = role.toLowerCase()
        const actorRole = user.role.toLowerCase()

        // Only owner can assign admin role
        if (targetRole === 'admin' && actorRole !== 'owner') {
          return res.status(403).json({ 
            success: false, 
            message: 'Only owner can assign admin role' 
          })
        }

        // Nobody can assign owner role
        if (targetRole === 'owner') {
          return res.status(403).json({ 
            success: false, 
            message: 'Cannot assign owner role' 
          })
        }
      }

      const updatedUser = await adminService.updateUser(userId, { name, email, phone, role })

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      })
    }

    // DELETE — Delete user
    if (req.method === 'DELETE') {
      // Check if user can delete
      if (!permissions.canDelete) {
        return res.status(403).json({ success: false, message: 'Executives cannot delete users' })
      }

      const targetUser = await adminService.getUserById(userId)
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      // Check permission to delete this specific user
      if (!canActOnUser(user, 'delete', targetUser)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to delete this user' 
        })
      }

      // Cannot delete yourself (handle type conversion for userId from session)
      if (userId === parseInt(user.id, 10) || userId === user.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete your own account' })
      }

      // Cannot delete owners
      if (targetUser.role?.toLowerCase() === 'owner') {
        return res.status(403).json({ success: false, message: 'Cannot delete owner accounts' })
      }

      await adminService.deleteUser(userId)

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error(`[/api/admin/users/${id}]`, error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
