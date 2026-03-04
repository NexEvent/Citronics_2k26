import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor, isAdminRole, isOwner } from 'src/configs/acl'

/**
 * Admin Guard Component
 * Protects admin routes — only allows Owner and Admin roles.
 * Owner: full access. Admin: no /admin/users routes.
 */
const AdminGuard = ({ children, fallback, requiredAbility = null }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ability, setAbility] = useState(null)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Reset auth state before checks to prevent brief exposure of protected UI
    setAuthorized(false)
    setAbility(null)

    if (!session) {
      router.push('/admin/login')

      return
    }

    const userRole = session?.user?.role

    if (!isAdminRole(userRole)) {
      router.push('/401')

      return
    }

    // Admin cannot access /admin/users routes
    if (!isOwner(userRole) && router.pathname.startsWith('/admin/users')) {
      router.push('/admin/dashboard')

      return
    }

    const userAbility = buildAbilityFor(userRole, {
      userId: session.user.id
    })

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
