import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import { isAdminRole, isOwner } from 'src/configs/acl'

/**
 * Admin Authentication Middleware
 *
 * Two admin roles:
 *   Owner — full CRUD everywhere
 *   Admin — read-only (dashboard, events, payments, analytics), no users page
 *
 * @param {object} req - Next.js API request object
 * @param {object} res - Next.js API response object (REQUIRED)
 * @returns {object} - { user, authenticated, error, permissions }
 */
export async function adminAuthMiddleware(req, res) {
  try {
    if (!res) {
      console.error('[adminAuthMiddleware] res parameter is required')

      return { user: null, authenticated: false, error: 'Server configuration error', permissions: null }
    }

    const session = await getServerSession(req, res, nextAuthConfig)

    if (!session || !session.user) {
      return { user: null, authenticated: false, error: 'Not authenticated', permissions: null }
    }

    const userRole = session.user.role

    if (!isAdminRole(userRole)) {
      return { user: null, authenticated: false, error: 'Access denied. Admin role required.', permissions: null }
    }

    const ownerFlag = isOwner(userRole)

    const permissions = {
      canRead: true,
      canCreate: ownerFlag,
      canUpdate: ownerFlag,
      canDelete: ownerFlag,
      canManageUsers: ownerFlag,
      isOwner: ownerFlag,
      isAdmin: !ownerFlag
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

    return { user: null, authenticated: false, error: 'Authentication failed', permissions: null }
  }
}

/**
 * Require specific permission middleware wrapper
 */
export async function requirePermission(permission, req, res) {
  const authResult = await adminAuthMiddleware(req, res)

  if (!authResult.authenticated) return authResult

  if (!authResult.permissions[permission]) {
    return { ...authResult, authenticated: false, error: `Permission denied: ${permission} required` }
  }

  return authResult
}

/**
 * Check if acting user (Owner) can perform action on target user.
 * Only Owner can modify users; Admin is read-only.
 */
export function canActOnUser(actingUser, action, targetUser = null) {
  if (!actingUser) return false
  const actorRole = actingUser.role?.toLowerCase()

  // Only owners can modify users
  if (actorRole !== 'owner') return false

  // Cannot delete other owners
  if (action === 'delete' && targetUser?.role?.toLowerCase() === 'owner') return false

  return true
}

export default adminAuthMiddleware
