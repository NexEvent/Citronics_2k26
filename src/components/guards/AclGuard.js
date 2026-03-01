import { useEffect, useState } from 'react'
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
  const [ability, setAbility] = useState(null)

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
      router.replace('/dashboard')
    }
  }, [session?.user, guestGuard, router])

  // Build (or rebuild) ability whenever session changes
  useEffect(() => {
    if (session?.user) {
      const meta = {
        eventIds: session.user.eventIds ?? [],
        userId: session.user.id
      }
      // Normalize role to PascalCase to match CASL switch-cases
      const role = session.user.role
        ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1).toLowerCase()
        : 'Student'
      setAbility(buildAbilityFor(role, meta))
    }
  }, [session])

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

  // Check permissions — normalize role here too in case ability build is stale
  const normalizedRole = session.user.role
    ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1).toLowerCase()
    : 'Student'
  const currentAbility = ability || buildAbilityFor(normalizedRole, {
    eventIds: session.user.eventIds ?? [],
    userId: session.user.id
  })

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
