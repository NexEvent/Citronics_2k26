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

  useEffect(() => {
    if (session?.user && session.user.role && !guestGuard && router.route === '/') {
      router.replace('/dashboard')
    }
  }, [session?.user, guestGuard, router])

  // Build (or rebuild) ability whenever session changes
  useEffect(() => {
    if (session?.user) {
      // Pass role-specific meta so CASL can scope field-level rules:
      //   Head   → eventIds: assigned event IDs (from JWT)
      //   Student → userId: own user ID for own-record rules
      const meta = {
        eventIds: session.user.eventIds ?? [],
        userId:   session.user.id
      }
      setAbility(buildAbilityFor(session.user.role, meta))
    }
  }, [session])

  // Show spinner while redirecting from root
  if (session && router.route === '/') {
    return <Spinner />
  }

  // For guest guards or error pages
  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    if (session?.user && ability) {
      return (
        <AbilityContext.Provider value={ability}>
          {children}
        </AbilityContext.Provider>
      )
    }
    return <>{children}</>
  }

  // Check user permissions
  if (ability && session?.user && ability.can(aclAbilities.action, aclAbilities.subject)) {
    if (router.route === '/') {
      return <Spinner />
    }

    return (
      <AbilityContext.Provider value={ability}>
        {children}
      </AbilityContext.Provider>
    )
  }

  // Show not authorized page
  return (
    <MinimalLayout>
      <NotAuthorized />
    </MinimalLayout>
  )
}

export default AclGuard
