import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

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
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'

// Icons
import { IconEye, IconEyeOff, IconLogin, IconBrandGoogle } from '@tabler/icons-react'

// Config
import MinimalLayout from 'src/layouts/MinimalLayout'
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'

/**
 * Login Page
 */
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const c = useAppPalette()

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
      } else {
        router.push('/')
      }
    } catch (_err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

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
              <IconLogin size={26} color={c.primaryContrast} />
            </Box>
            <Typography variant='h5' fontWeight={700}>
              Welcome Back
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Sign in to {themeConfig.templateName}
            </Typography>
          </Box>

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
              placeholder='you@example.com'
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
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              type='submit'
              variant='contained'
              size='large'
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem'
              }}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <Divider sx={{ my: 3 }}>
            <Typography variant='caption' color='text.disabled'>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant='outlined'
            size='large'
            disabled={loading}
            onClick={() => signIn('google', { callbackUrl: '/' })}
            startIcon={<IconBrandGoogle size={20} />}
            sx={{
              py: 1.3,
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              borderColor: c.dividerA60,
              color: 'text.primary',
              '&:hover': {
                borderColor: c.primary,
                backgroundColor: c.primaryA4
              }
            }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant='body2' textAlign='center' color='text.secondary'>
            Don't have an account?{' '}
            <Link href='/register' passHref legacyBehavior>
              <Typography
                component='a'
                variant='body2'
                color='primary'
                sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Create Account
              </Typography>
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

// Use blank layout
LoginPage.getLayout = page => <MinimalLayout>{page}</MinimalLayout>

// Allow guest access
LoginPage.guestGuard = true
LoginPage.authGuard = false

export default LoginPage
