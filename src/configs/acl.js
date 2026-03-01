import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Citronics — Admin Portal Role Hierarchy:
 *
 *  Owner      — superadmin; full CRUD, manages everything including creating/deleting admins
 *  Admin      — site maintainer; same as Owner but CANNOT delete other admins (Owner can)
 *  Executive  — read-only access; can view events, analytics, users but cannot modify anything
 *  Head       — event organiser assigned to one or more events; limited to their own events
 *  Student    — end-user / ticket buyer; books tickets & views own registrations
 *
 * @param {'Owner'|'Admin'|'Executive'|'Head'|'Student'} role
 * @param {object} [meta]               Extra data encoded in the JWT
 * @param {number[]} [meta.eventIds]    Event IDs the Head is assigned to
 * @param {number} [meta.userId]        User ID for own-record rules
 */
const defineRulesFor = (role, meta = {}) => {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility)

  switch (role) {
    // ── Owner ─────────────────────────────────────────────────────────────────
    case 'Owner':
    case 'owner':
      can('manage', 'all') // full access everywhere
      break

    // ── Admin ─────────────────────────────────────────────────────────────────
    case 'Admin':
    case 'admin':
      can('manage', 'all') // same operational power as Owner…
      cannot('manage', 'owner-settings') // …except Owner-level system settings
      cannot('delete', 'user', { role: 'owner' }) // cannot remove Owner accounts
      cannot('delete', 'user', { role: 'admin' }) // cannot delete other admins
      cannot('create', 'user', { role: 'owner' }) // cannot create owner accounts
      break

    // ── Executive ─────────────────────────────────────────────────────────────
    case 'Executive':
    case 'executive':
      // Read-only access across the admin portal
      can('read', 'dashboard')
      can('read', 'analytics')
      can('read', 'event')
      can('read', 'user')
      can('read', 'booking')
      can('read', 'ticket')
      can('read', 'category')
      can('read', 'department')
      can('read', 'profile')
      can('update', 'profile') // Can update their own profile only
      // Explicitly deny all write operations
      cannot('create', 'event')
      cannot('update', 'event')
      cannot('delete', 'event')
      cannot('create', 'user')
      cannot('update', 'user')
      cannot('delete', 'user')
      break

    // ── Head (Organizer) ──────────────────────────────────────────────────────
    case 'Head':
    case 'organizer': {
      const eventIds = meta?.eventIds ?? []
      can('read', 'dashboard')
      can('read', 'profile')
      can('update', 'profile')

      // Their assigned events only
      can('read', 'event', { id: { $in: eventIds } })
      can('update', 'event', { id: { $in: eventIds } }) // basic details

      // Read-only view of registrations for their events
      can('read', 'registration', { eventId: { $in: eventIds } })

      // Can view attendee list for their events
      can('read', 'attendee', { eventId: { $in: eventIds } })
      break
    }

    // ── Student ───────────────────────────────────────────────────────────────
    case 'Student':
    case 'student':
      can('read', 'dashboard')
      can('read', 'profile')
      can('update', 'profile')

      can('read', 'event') // browse all published events
      can('create', 'registration') // book a ticket
      can('read', 'registration', { userId: meta?.userId }) // own bookings only
      can('update', 'registration', { userId: meta?.userId }) // e.g. cancel
      can('read', 'ticket', { userId: meta?.userId }) // own tickets
      break

    default:
      // Unauthenticated / unknown role — read public events only
      can('read', 'event')
      break
  }

  return rules
}

/**
 * Build a CASL Ability instance for a session user.
 * @param {'Owner'|'Admin'|'Executive'|'Head'|'Student'} role
 * @param {object} [meta]  Extra JWT payload (eventIds for Head, userId for Student)
 */
export const buildAbilityFor = (role, meta = {}) =>
  new AppAbility(defineRulesFor(role, meta), {
    detectSubjectType: obj => obj?.type
  })

/**
 * Check if role is admin-level (can access admin portal)
 */
export const isAdminRole = role => ['owner', 'admin', 'executive', 'Owner', 'Admin', 'Executive'].includes(role)

/**
 * Check if role can modify data (not executive)
 */
export const canModify = role => ['owner', 'admin', 'Owner', 'Admin'].includes(role)

/**
 * Check if role is owner (full privileges)
 */
export const isOwner = role => ['owner', 'Owner'].includes(role)

/** Default ACL used by AclGuard for pages that declare no explicit acl obj */
export const defaultACLObj = {
  action: 'read',
  subject: 'dashboard'
}

export default defineRulesFor
