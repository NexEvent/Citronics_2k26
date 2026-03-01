import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const ADMIN_ROLES = ['owner', 'admin', 'executive']

/**
 * Auth Guard Component
 * Protects routes that require authentication.
 * Also redirects admin roles away from student-facing pages.
 */
const AuthGuard = ({ children, fallback }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect admin/owner/executive users away from student-facing pages
    const role = session?.user?.role?.toLowerCase()
    const isAdminRole = ADMIN_ROLES.includes(role)
    const isStudentRoute = router.pathname.startsWith('/dashboard') ||
      router.pathname.startsWith('/events') ||
      router.pathname.startsWith('/checkout') ||
      router.pathname.startsWith('/cart') ||
      router.pathname.startsWith('/register')

    if (isAdminRole && isStudentRoute) {
      router.replace('/admin/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return fallback
  }

  return children
}

export default AuthGuard
