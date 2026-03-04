// ** React Imports
import { createContext, useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'

// ** Next Auth
import { useSession, signIn, signOut, getSession } from 'next-auth/react'

// ** ACL
import { isAdminRole } from 'src/configs/acl'

// ** Create Auth Context
const AuthContext = createContext()

// ** Hook to use auth context
export const useAuth = () => useContext(AuthContext)

/**
 * Auth Provider Component
 * Wraps the application with authentication context
 */
const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [status])

  /**
   * Handle user login
   * @param {Object} credentials - User credentials
   */
  const handleLogin = async credentials => {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false
    })

    if (result?.ok) {
      // Add delay to ensure session is updated, then fetch and determine redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      const session = await getSession()
      const userRole = session?.user?.role
      const callbackUrl = isAdminRole(userRole) ? '/admin/dashboard' : '/'
      router.push(callbackUrl)
    }
  }

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const values = {
    user: session?.user,
    loading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
