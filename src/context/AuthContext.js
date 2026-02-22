// ** React Imports
import { createContext, useEffect, useState, useContext } from 'react'

// ** Next Auth
import { useSession, signIn, signOut } from 'next-auth/react'

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
  const handleLogin = credentials => {
    signIn('credentials', { ...credentials, callbackUrl: '/' })
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
