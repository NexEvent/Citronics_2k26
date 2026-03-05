import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Citronics — two admin roles + student:
 *
 *  Owner   — superadmin; full CRUD on everything, can manage users
 *  Admin   — read-only access to dashboard, events, payments, analytics (NO users page)
 *  Student — end-user / ticket buyer; books tickets & views own registrations
 *
 * @param {'Owner'|'Admin'|'Student'} role
 * @param {object} [meta]
 */
const defineRulesFor = (role, meta = {}) => {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility)

  switch (role) {
    // ── Owner ─────────────────────────────────────────────────────────────────
    case 'Owner':
      can('manage', 'all') // full access everywhere
      break

    // ── Admin ─────────────────────────────────────────────────────────────────
    case 'Admin':
      can('read', 'dashboard')
      can('read', 'event')
      can('read', 'analytics')
      can('read', 'payment')
      can('read', 'profile')
      can('update', 'profile')
      // Admin CANNOT create/update/delete events, users, etc.
      break

    // ── Student ───────────────────────────────────────────────────────────────
    case 'Student':
      can('read', 'dashboard')
      can('read', 'profile')
      can('update', 'profile')
      can('read', 'event')
      can('create', 'registration')
      can('read', 'registration', { userId: meta?.userId })
      can('update', 'registration', { userId: meta?.userId })
      can('read', 'ticket', { userId: meta?.userId })
      break

    default:
      can('read', 'event')
      break
  }

  return rules
}

/**
 * Build a CASL Ability instance for a session user.
 * @param {'Owner'|'Admin'|'Student'} role
 * @param {object} [meta]
 */
export const buildAbilityFor = (role, meta = {}) =>
  new AppAbility(defineRulesFor(role, meta), {
    detectSubjectType: obj => obj?.type
  })

// ── Helper functions used across the app ──────────────────────────────────

/**
 * Check if role is an admin-level role (can access /admin portal)
 * @param {string} role
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
  const r = role?.toLowerCase?.() ?? ''

  return r === 'owner' || r === 'admin'
}

/**
 * Check if role is Owner (full CRUD)
 * @param {string} role
 * @returns {boolean}
 */
export const isOwner = (role) => {
  const r = role?.toLowerCase?.() ?? ''

  return r === 'owner'
}

/**
 * Check if role can modify (create/update/delete) — only Owner
 * @param {string} role
 * @returns {boolean}
 */
export const canModify = (role) => isOwner(role)

/**
 * Lowercase role slugs that grant elevated (cross-user) access in API routes.
 */
export const ELEVATED_ROLES = ['admin', 'owner']

/** Default ACL used by AclGuard for pages that declare no explicit acl obj */
export const defaultACLObj = {
  action: 'read',
  subject: 'dashboard'
}

export default defineRulesFor
