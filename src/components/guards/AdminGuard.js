import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor, isAdminRole } from 'src/configs/acl'

/**
 * Admin Guard Component
 * Protects admin routes - only allows owner, admin, and executive roles
 * 
 * Role Hierarchy:
 * - Owner: Full access (can manage admins)
 * - Admin: Full access except managing other admins
 * - Executive: Read-only access
 */
const AdminGuard = ({ children, fallback, requiredAbility = null }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ability, setAbility] = useState(null)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Not logged in → redirect to admin login
    if (!session) {
      router.push('/admin/login')
      return
    }

    const userRole = session?.user?.role

    // Check if user has admin-level role
    if (!isAdminRole(userRole)) {
      // User is logged in but doesn't have admin access
      router.push('/401')
      return
    }

    // Build CASL ability for the user
    const userAbility = buildAbilityFor(userRole, {
      userId: session.user.id,
      eventIds: session.user.eventIds ?? []
    })

    // Check specific ability if required
    if (requiredAbility) {
      const { action, subject } = requiredAbility
      if (!userAbility.can(action, subject)) {
        router.push('/401')
        return
      }
    }

    setAbility(userAbility)
    setAuthorized(true)
  }, [session, status, router, requiredAbility])

  // Show loading state
  if (status === 'loading' || !authorized || !ability) {
    return fallback || null
  }

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

export default AdminGuard
