import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

// MUI
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Chip from '@mui/material/Chip'

// Icons
import { IconEye, IconEyeOff, IconShield, IconCrown, IconUserCheck } from '@tabler/icons-react'

// Config
import MinimalLayout from 'src/layouts/MinimalLayout'
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'
import { isAdminRole } from 'src/configs/acl'

/**
 * Admin Login Page
 * Role-based access for Owner, Admin, and Executive
 * 
 * Access Levels:
 * - Owner: Full access, can manage admins
 * - Admin: Full access, cannot manage other admins
 * - Executive: Read-only access
 */
const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { data: session, status } = useSession()
  const c = useAppPalette()

  // Redirect if already logged in with admin role
  useEffect(() => {
    if (status === 'loading') return

    if (session?.user && isAdminRole(session.user.role)) {
      router.push('/admin/dashboard')
    }
  }, [session, status, router])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!email.trim()) return setError('Email is required')
    if (!password) return setError('Password is required')

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Get session to verify role
      const res = await fetch('/api/auth/session')
      const sessionData = await res.json()

      if (sessionData?.user) {
        const userRole = sessionData.user.role

        // Check if user has admin-level role
        if (isAdminRole(userRole)) {
          await router.push('/admin/dashboard')
        } else {
          setError('Access denied. Only Owner, Admin, and Executive roles can access the admin portal.')
          setLoading(false)
        }
      } else {
        setError('Session not found. Please try again.')
        setLoading(false)
      }
    } catch (_err) {
      console.error('Login error:', _err)
      setError('An error occurred during login')
      setLoading(false)
    }
  }

  // Role information chips
  const roleInfo = [
    { label: 'Owner', icon: <IconCrown size={14} />, color: 'warning', desc: 'Full Access' },
    { label: 'Admin', icon: <IconShield size={14} />, color: 'primary', desc: 'Manage Events' },
    { label: 'Executive', icon: <IconUserCheck size={14} />, color: 'info', desc: 'View Only' }
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: `linear-gradient(135deg, ${c.primaryA3} 0%, ${c.primaryA8} 100%)`,
        backgroundColor: c.bgDefault
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: '20px',
          boxShadow: `0 8px 40px ${c.blackA8}`,
          border: `1px solid ${c.dividerA40}`
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>

          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 4px 14px ${c.primaryA30}`
              }}
            >
              <IconShield size={26} color={c.primaryContrast} />
            </Box>
            <Typography variant='h5' fontWeight={700}>
              Admin Portal
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {themeConfig.templateName} Admin Access
            </Typography>
          </Box>

          {/* Role Info
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
            {roleInfo.map(role => (
              <Chip
                key={role.label}
                icon={role.icon}
                label={role.label}
                size='small'
                color={role.color}
                variant='outlined'
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box> */}

          {/* Error Alert */}
          <Collapse in={!!error}>
            <Alert severity='error' sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Collapse>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label='Email'
              type='email'
              placeholder='admin@example.com'
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              disabled={loading}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label='Password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your password'
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              variant='contained'
              size='large'
              type='submit'
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                'Sign In to Admin Portal'
              )}
            </Button>
          </form>

          {/* Back Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Go back to{' '}
              <Link href='/login' style={{ color: c.primary, textDecoration: 'none', fontWeight: 600 }}>
                Student Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

AdminLoginPage.getLayout = page => <MinimalLayout>{page}</MinimalLayout>
AdminLoginPage.guestGuard = true
AdminLoginPage.authGuard = false

export default AdminLoginPage
