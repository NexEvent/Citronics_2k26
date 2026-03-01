import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import { isAdminRole, canModify, isOwner } from 'src/configs/acl'

/**
 * Admin Authentication Middleware
 * 
 * Validates that the request is from an authenticated admin user
 * Returns user info and role-based permissions
 * 
 * Role Permissions:
 * - Owner: Full CRUD, can manage other admins
 * - Admin: Full CRUD, cannot delete other admins
 * - Executive: Read-only access
 * 
 * @param {object} req - Next.js API request object
 * @param {object} res - Next.js API response object (REQUIRED)
 * @returns {object} - { user, authenticated, error, permissions }
 */
export async function adminAuthMiddleware(req, res) {
  try {
    // Get session - res is required for getServerSession in Next.js pages router
    if (!res) {
      console.error('[adminAuthMiddleware] res parameter is required')
      return {
        user: null,
        authenticated: false,
        error: 'Server configuration error',
        permissions: null
      }
    }

    const session = await getServerSession(req, res, nextAuthConfig)

    if (!session || !session.user) {
      return {
        user: null,
        authenticated: false,
        error: 'Not authenticated',
        permissions: null
      }
    }

    const userRole = session.user.role

    // Check if user has admin-level role (owner, admin, executive)
    if (!isAdminRole(userRole)) {
      return {
        user: null,
        authenticated: false,
        error: 'Access denied. Admin role required.',
        permissions: null
      }
    }

    // Build permissions object based on role
    const permissions = {
      canRead: true, // All admin roles can read
      canCreate: canModify(userRole),
      canUpdate: canModify(userRole),
      canDelete: canModify(userRole),
      canManageAdmins: isOwner(userRole),
      canDeleteAdmins: isOwner(userRole),
      isOwner: isOwner(userRole),
      isAdmin: userRole === 'admin' || userRole === 'Admin',
      isExecutive: userRole === 'executive' || userRole === 'Executive'
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: userRole,
        verified: session.user.verified
      },
      authenticated: true,
      error: null,
      permissions
    }
  } catch (error) {
    console.error('[adminAuthMiddleware] Error:', error)
    return {
      user: null,
      authenticated: false,
      error: 'Authentication failed',
      permissions: null
    }
  }
}

/**
 * Require specific permission middleware wrapper
 * 
 * @param {string} permission - Permission to check (canCreate, canUpdate, canDelete, etc.)
 * @param {object} req - Next.js API request object
 * @returns {object} - Auth result with permission check
 */
export async function requirePermission(permission, req) {
  const authResult = await adminAuthMiddleware(req)

  if (!authResult.authenticated) {
    return authResult
  }

  if (!authResult.permissions[permission]) {
    return {
      ...authResult,
      authenticated: false,
      error: `Permission denied: ${permission} required`
    }
  }

  return authResult
}

/**
 * Check if user can perform action on target user
 * Owners can do anything, admins cannot delete other admins
 * 
 * @param {object} actingUser - User performing the action
 * @param {string} action - Action being performed (create, update, delete)
 * @param {object} targetUser - Target user object (optional)
 * @returns {boolean}
 */
export function canActOnUser(actingUser, action, targetUser = null) {
  const actorRole = actingUser.role?.toLowerCase()

  // Executives cannot modify anything
  if (actorRole === 'executive') {
    return false
  }

  // Owners can do anything
  if (actorRole === 'owner') {
    return true
  }

  // Admins can create executives only
  if (action === 'create' && actorRole === 'admin') {
    const targetRole = targetUser?.role?.toLowerCase()
    return targetRole === 'executive'
  }

  // Admins cannot delete other admins or owners
  if (action === 'delete' && actorRole === 'admin' && targetUser) {
    const targetRole = targetUser.role?.toLowerCase()
    return targetRole !== 'admin' && targetRole !== 'owner'
  }

  // Admins can update executives and students
  if (action === 'update' && actorRole === 'admin' && targetUser) {
    const targetRole = targetUser.role?.toLowerCase()
    return targetRole !== 'admin' && targetRole !== 'owner'
  }

  return actorRole === 'admin'
}

export default adminAuthMiddleware
