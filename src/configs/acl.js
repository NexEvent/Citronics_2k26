import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Citronics — four roles:
 *
 *  Owner   — superadmin; manages everything including user management (Admins & Heads)
 *  Admin   — site maintainer; manages all events, transactions, analytics, categories
 *  Head    — event organiser assigned to one or more events; limited to their own events
 *  Student — end-user / ticket buyer; books tickets & views own registrations
 *
 * @param {'Owner'|'Admin'|'Head'|'Student'} role
 * @param {object} [meta]               Extra data encoded in the JWT
 * @param {number[]} [meta.eventIds]    Event IDs the Head is assigned to
 */
const defineRulesFor = (role, meta = {}) => {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility)

  switch (role) {
    // ── Owner ─────────────────────────────────────────────────────────────────
    case 'Owner':
      can('manage', 'all')                         // full access everywhere
      break

    // ── Admin ─────────────────────────────────────────────────────────────────
    case 'Admin':
      can('manage', 'all')                         // same operational power as Owner…
      cannot('manage', 'owner-settings')           // …except Owner-level system settings
      cannot('delete', 'user', { role: 'Owner' })  // cannot remove Owner accounts
      break

    // ── Head ──────────────────────────────────────────────────────────────────
    case 'Head': {
      const eventIds = meta?.eventIds ?? []
      can('read',   'dashboard')
      can('read',   'profile')
      can('update', 'profile')

      // Their assigned events only
      can('read',   'event',        { id: { $in: eventIds } })
      can('update', 'event',        { id: { $in: eventIds } })  // basic details

      // Read-only view of registrations for their events
      can('read',   'registration', { eventId: { $in: eventIds } })

      // Can view attendee list for their events
      can('read',   'attendee',     { eventId: { $in: eventIds } })
      break
    }

    // ── Student ───────────────────────────────────────────────────────────────
    case 'Student':
      can('read',   'dashboard')
      can('read',   'profile')
      can('update', 'profile')

      can('read',   'event')                       // browse all published events
      can('create', 'registration')                // book a ticket
      can('read',   'registration', { userId: meta?.userId })  // own bookings only
      can('update', 'registration', { userId: meta?.userId })  // e.g. cancel
      can('read',   'ticket',       { userId: meta?.userId })  // own tickets
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
 * @param {'Owner'|'Admin'|'Head'|'Student'} role
 * @param {object} [meta]  Extra JWT payload (eventIds for Head, userId for Student)
 */
export const buildAbilityFor = (role, meta = {}) =>
  new AppAbility(defineRulesFor(role, meta), {
    detectSubjectType: obj => obj?.type
  })

/** Default ACL used by AclGuard for pages that declare no explicit acl obj */
export const defaultACLObj = {
  action: 'read',
  subject: 'dashboard'
}

export default defineRulesFor
