import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor } from 'src/configs/acl'
import Spinner from 'src/components/Spinner'
import MinimalLayout from 'src/layouts/MinimalLayout'
import NotAuthorized from 'src/pages/401'

/**
 * ACL Guard Component
 * Controls access based on user permissions
 */
const AclGuard = ({ children, aclAbilities, guestGuard = false, authGuard = true }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Build ability synchronously from session — always in sync, no stale state
  const ability = useMemo(() => {
    if (!session?.user) return null
    const meta = {
      eventIds: session.user.eventIds ?? [],
      userId: session.user.id
    }
    const role = session.user.role
      ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1).toLowerCase()
      : 'Student'
    return buildAbilityFor(role, meta)
  }, [session])

  // Only redirect staff/admin roles to dashboard from home — students stay on home page
  const STAFF_ROLES = ['owner', 'admin', 'head', 'Owner', 'Admin', 'Head']

  // Build ability synchronously from session — always in sync, no stale state
  const ability = useMemo(() => {
    if (!session?.user) return null
    const meta = {
      eventIds: session.user.eventIds ?? [],
      userId: session.user.id
    }
    const role = session.user.role
      ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1).toLowerCase()
      : 'Student'
    return buildAbilityFor(role, meta)
  }, [session])

  // Only redirect staff/admin roles to dashboard from home — students stay on home page
  const STAFF_ROLES = ['owner', 'admin', 'head', 'Owner', 'Admin', 'Head']

  useEffect(() => {
    if (
      session?.user &&
      session.user.role &&
      STAFF_ROLES.includes(session.user.role) &&
      !guestGuard &&
      router.route === '/'
    ) {
      const role = session.user.role
      if (['owner', 'admin', 'executive'].includes(role)) {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [session?.user, guestGuard, router])

  // Reset auth state during redirect to prevent protected-content flash
  if (router.isTransitioning) {
    return <Spinner />
  }

  // Wait for session to load and ability to be built before making any decisions
  if (status === 'loading' || (session?.user && !ability)) {
    return <Spinner />
  }

  // For guest guards or error pages — no ACL check needed
  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    if (session?.user && ability) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    }
    return <>{children}</>
  }

  // No session — AuthGuard will handle the redirect to login
  if (!session?.user) {
    return <Spinner />
  }

  // ability is always in sync with session via useMemo — no stale state possible
  const currentAbility = ability ?? buildAbilityFor('Student', { eventIds: [], userId: session.user.id })

  if (currentAbility.can(aclAbilities.action, aclAbilities.subject)) {
    return <AbilityContext.Provider value={currentAbility}>{children}</AbilityContext.Provider>
  }

  // Confirmed: user is logged in but lacks permission for this specific page
  return (
    <MinimalLayout>
      <NotAuthorized />
    </MinimalLayout>
  )
}

export default AclGuard
