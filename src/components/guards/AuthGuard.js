import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

/**
 * Auth Guard Component
 * Protects routes that require authentication
 */
const AuthGuard = ({ children, fallback }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return fallback
  }

  return children
}

export default AuthGuard
