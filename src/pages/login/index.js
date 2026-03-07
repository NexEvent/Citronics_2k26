import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { signIn } from 'next-auth/react'

// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/components/mui/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import { alpha } from '@mui/material/styles'

// Icons
import Icon from 'src/components/Icon'

// Config & helpers
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'
import { lookupIdentifier, registerUser, verifyUser, setExistingUser } from 'src/store/slices/checkoutSlice'

/* ═══════════════════════════════════════════════════════════════════════════
 *  Validation helpers
 * ═════════════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\d{10}$/

// Stricter regex for triggering lookup — requires domain with 2+ char TLD (e.g. user@gmail.com)
// Prevents lookup from firing on partial emails like user@g.c while still typing

function validateField(name, value) {
  const v = (value || '').trim()
  switch (name) {
    case 'name':
      if (!v) return 'Full name is required'
      if (v.length < 2) return 'Name must be at least 2 characters'
      return ''
    case 'email':
      if (!v) return 'Email is required'
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address'
      return ''
    case 'phone':
      if (!v) return 'Phone or email is required'
      if (!EMAIL_RE.test(v) && !PHONE_RE.test(v.replace(/[\s\-+()]/g, '').slice(-10))) return 'Enter a valid phone number or email address'
      return ''
    case 'registrationPhone':
      if (!v) return 'Phone number is required'
      if (!PHONE_RE.test(v.replace(/[\s\-+()]/g, '').slice(-10))) return 'Enter a valid 10-digit phone number'
      return ''
    case 'password':
      if (!v) return 'Password is required'
      if (v.length < 6) return 'Password must be at least 6 characters'
      return ''
    case 'college':
      if (!v) return 'College name is required'
      if (v.length < 2) return 'College name must be at least 2 characters'
      return ''
    case 'city':
      if (!v) return 'City is required'
      if (v.length < 2) return 'City must be at least 2 characters'
      return ''
    default:
      return ''
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Login / Register Page
 * ═════════════════════════════════════════════════════════════════════════ */

const LoginPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const c = useAppPalette()

  // Sanitize returnUrl: must be a string, start with '/', and not be protocol-relative (//)
  const rawReturn = router.query.returnUrl
  const returnUrl = (typeof rawReturn === 'string' && rawReturn.startsWith('/') && !rawReturn.startsWith('//')) ? rawReturn : '/'

  // ── Mode: 'register' (default) or 'login' ──
  const [mode, setMode] = useState('register')

  // ── Form state ──
  const [form, setForm] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    college: '',
    city: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Phone lookup state ──
  const [phoneLookup, setPhoneLookup] = useState(null)
  const [lookingUpPhone, setLookingUpPhone] = useState(false)
  const phoneLookupTimer = useRef(null)

  // Tracks the last value we actually looked up, to avoid redundant API calls
  const lastPhoneLookupValue = useRef('')

  // Prevents lookups from firing after form submission (fixes post-registration flash)
  const submittedRef = useRef(false)

  const isExistingUser = mode === 'login' || phoneLookup?.exists

  // ── Live phone lookup (only in register mode) ──
  useEffect(() => {
    if (mode === 'login' || submittedRef.current) return

    const v = form.phone.trim()
    const normalized = v.replace(/[\s\-+()]/g, '').slice(-10)
    const isPhone = PHONE_RE.test(normalized)

    // Clear lookup + cancel any pending timer when value is no longer a valid phone
    if (!isPhone) {
      if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current)
      setLookingUpPhone(false)
      setPhoneLookup(null)
      lastPhoneLookupValue.current = ''
      return
    }

    // Skip if we already looked up this exact value
    if (normalized === lastPhoneLookupValue.current) return

    if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current)
    let cancelled = false

    phoneLookupTimer.current = setTimeout(async () => {
      if (submittedRef.current) return
      setLookingUpPhone(true)
      try {
        const result = await dispatch(lookupIdentifier(v))
        if (cancelled || submittedRef.current) return
        lastPhoneLookupValue.current = normalized
        if (lookupIdentifier.fulfilled.match(result) && result.payload.exists) {
          setPhoneLookup({ exists: true, name: result.payload.data?.maskedName || '' })
        } else {
          setPhoneLookup({ exists: false })
        }
      } catch { /* ignore */ }
      if (!cancelled) setLookingUpPhone(false)
    }, 600)

    return () => { cancelled = true; clearTimeout(phoneLookupTimer.current) }
  }, [form.phone, mode, dispatch])
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validateAll = () => {
    const newErrors = {}
    let hasError = false
    const touch = (field, validationKey) => {
      const err = validateField(validationKey || field, form[field])
      if (err) { newErrors[field] = err; hasError = true }
    }
    if (isExistingUser) {
      touch('phone')       // login: identifier (phone or email)
      touch('password')
    } else {
      touch('phone', 'registrationPhone') // register: phone-only
      touch('name')
      touch('email')
      touch('password')
      touch('college')
      touch('city')
    }
    setErrors(newErrors)
    return !hasError
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateAll()) return

    setServerError('')
    setLoading(true)
    submittedRef.current = true
    const identifier = form.phone.trim()

    // Cancel any pending lookup timers immediately
    if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current)

    try {
      // ── Existing user path — verify password then sign in ──
      if (isExistingUser) {
        const result = await dispatch(verifyUser({ identifier, password: form.password }))
        if (verifyUser.fulfilled.match(result)) {
          const signInResult = await signIn('credentials', {
            email: identifier,
            password: form.password,
            redirect: false
          })
          if (signInResult?.ok) {
            dispatch(setExistingUser({ userId: result.payload.userId }))
            router.push(returnUrl)
          } else {
            setServerError('Login failed. Please try again.')
            submittedRef.current = false
          }
        } else {
          setServerError(result.payload || 'Incorrect password. Please try again.')
          submittedRef.current = false
        }
        setLoading(false)
        return
      }

      // ── New user path — register then sign in ──
      const phoneForReg = form.phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
      const result = await dispatch(registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneForReg,
        password: form.password,
        college: form.college.trim(),
        city: form.city.trim()
      }))

      if (registerUser.fulfilled.match(result)) {
        const signInResult = await signIn('credentials', {
          email: form.email.trim(),
          password: form.password,
          redirect: false
        })
        if (signInResult?.ok) {
          dispatch(setExistingUser({ userId: result.payload.userId }))
          router.push(returnUrl)
        } else {
          setServerError('Account created but auto-login failed. Please refresh and try again.')
          submittedRef.current = false
        }
      } else if (registerUser.rejected.match(result)) {
        const payload = result.payload
        if (payload?.code === 'PHONE_EXISTS') {
          setPhoneLookup({ exists: true, name: '' })
          setErrors({})
          setServerError('This phone number is already registered. Enter your password to login.')
          submittedRef.current = false
          setLoading(false)
          return
        }
        if (payload?.code === 'EMAIL_EXISTS') {
          setErrors(prev => ({ ...prev, email: payload.message || 'This email is already registered.' }))
          submittedRef.current = false
          setLoading(false)
          return
        }
        setServerError(typeof payload === 'string' ? payload : payload?.message || 'Registration failed')
        submittedRef.current = false
      }
    } catch (_err) {
      setServerError('An unexpected error occurred. Please try again.')
      submittedRef.current = false
    }
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'stretch' }}>
        {/* ══ LEFT — brand + animated characters (desktop only) ══ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '0 0 45%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(145deg, ${c.primary} 0%, ${c.primaryDark} 60%, ${alpha(c.primaryDark, 0.85)} 100%)`,
            p: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background blobs */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />

          {/* Logo */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box component='img' src='/logo/citronics2.png' alt={themeConfig.templateName}
              sx={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          </Box>

          {/* ── Brand highlights ─────────────────────────────── */}
          <Box sx={{ position: 'relative', zIndex: 1, py: 2 }}>
            <Typography
              sx={{
                color: alpha('#fff', 0.4),
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: 2.5,
                mb: 2.5,
                textTransform: 'uppercase'
              }}
            >
              Citronics 2026 • CDGI Indore
            </Typography>
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 900,
                fontSize: { md: '2rem', lg: '2.6rem' },
                lineHeight: 1.1,
                letterSpacing: '-1px',
                mb: 2
              }}
            >
              Where Innovation
              <br />
              Meets Ambition
            </Typography>
            <Typography
              sx={{
                color: alpha('#fff', 0.68),
                fontSize: '0.92rem',
                lineHeight: 1.75,
                mb: 4,
                maxWidth: 300
              }}
            >
              Join thousands of students competing, collaborating and creating at Central
              India&apos;s premier techno-management fest.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {[
                { icon: 'tabler:calendar-event', text: '30+ events across 3 days' },
                { icon: 'tabler:users', text: '1,500+ participants expected' },
                { icon: 'tabler:trophy', text: '₹4 Lakh+ prize pool' }
              ].map(item => (
                <Box
                  key={item.text}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: '10px',
                    bgcolor: alpha('#fff', 0.08),
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    width: 'fit-content'
                  }}
                >
                  <Icon icon={item.icon} fontSize={15} style={{ color: alpha('#fff', 0.8) }} />
                  <Typography sx={{ color: alpha('#fff', 0.8), fontSize: '0.8rem', fontWeight: 600 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Ticket notice + footer links */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 2.5, p: 2, borderRadius: '12px', bgcolor: alpha('#fff', 0.1), border: `1px solid ${alpha('#fff', 0.15)}`, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Icon icon='tabler:info-circle' fontSize={16} style={{ color: alpha('#fff', 0.9), flexShrink: 0, marginTop: 2 }} />
              <Typography variant='body2' sx={{ color: alpha('#fff', 0.9), fontSize: '0.8rem', lineHeight: 1.6, fontWeight: 500 }}>
                Tickets will be sent to your registered email or phone. Please provide correct details.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
                <Typography key={link} variant='caption' sx={{ color: alpha('#fff', 0.5), cursor: 'pointer', '&:hover': { color: alpha('#fff', 0.9) }, transition: 'color 0.2s' }}>{link}</Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ══ RIGHT — form panel ══ */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2.5, sm: 4, md: 5 },
            bgcolor: 'background.default',
            minHeight: '100dvh',
            pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', md: 5 }
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440 }}>

            {/* Back to home */}
            <Box sx={{ mb: 3 }}>
              <Button
                onClick={() => router.push('/')}
                startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
                sx={{
                  color: c.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 0,
                  '&:hover': { color: c.primary, bgcolor: 'transparent' }
                }}
              >
                Back to Home
              </Button>
            </Box>

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
              <Box component='img' src='/logo/citronics2.png' alt={themeConfig.templateName} sx={{ height: 30, width: 'auto' }} />
            </Box>

            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='h5' fontWeight={800} sx={{ color: c.textPrimary, mb: 0.5 }}>
                {isExistingUser ? 'Welcome back!' : 'Create your account'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {isExistingUser ? 'Enter your phone/email and password to continue' : 'Fill in the details below to get started'}
              </Typography>
            </Box>

            {/* Mobile-only ticket notice */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                mb: 2.5,
                p: 1.25,
                borderRadius: '10px',
                bgcolor: alpha(c.warning, 0.08),
                border: `1px solid ${alpha(c.warning, 0.18)}`,
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              <Icon icon='tabler:info-circle' fontSize={16} style={{ color: c.warning, flexShrink: 0, marginTop: 1 }} />
              <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500, fontSize: '0.78rem', lineHeight: 1.5 }}>
                Tickets will be sent to your registered email or phone. Provide correct details.
              </Typography>
            </Box>

            {/* Error */}
            <Collapse in={!!serverError}>
              <Alert severity='error' sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setServerError('')}>
                {serverError}
              </Alert>
            </Collapse>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Phone or Email — shown only in login / existing-user mode */}
                {isExistingUser && (
                  <Box>
                    <CustomTextField
                      fullWidth
                      label='Phone or Email'
                      name='phone'
                      value={form.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone || ' '}
                      disabled={loading}
                      autoFocus
                      placeholder='Mobile number or email address'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon={EMAIL_RE.test(form.phone.trim()) ? 'tabler:mail' : 'tabler:phone'} fontSize={17} color={errors.phone ? c.error : c.textDisabled} />
                          </InputAdornment>
                        )
                      }}
                    />
                    {phoneLookup?.exists && (
                      <Box sx={{ mt: -0.5, mb: 0.5, px: 1.5, py: 0.75, borderRadius: '8px', bgcolor: alpha(c.success, 0.07), border: `1px solid ${alpha(c.success, 0.18)}` }}>
                        <Typography variant='body2' sx={{ fontSize: '0.76rem', fontWeight: 600, color: c.success, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Icon icon='tabler:user-check' fontSize={13} />
                          {`Account found${phoneLookup.name ? ` — ${phoneLookup.name}` : ''}. Enter your password below.`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {isExistingUser ? (
                  /* Existing user: password only */
                  <CustomTextField
                    fullWidth
                    label='Password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password || ' '}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon icon='tabler:lock' fontSize={17} color={errors.password ? c.error : c.textDisabled} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                            {showPassword ? <Icon icon='tabler:eye-off' fontSize={17} /> : <Icon icon='tabler:eye' fontSize={17} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                ) : (
                  /* New user: 2-column grid on sm+ */
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <CustomTextField
                        fullWidth
                        label='Phone Number'
                        name='phone'
                        placeholder='10-digit mobile number'
                        value={form.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone || ' '}
                        disabled={loading}
                        autoFocus
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Icon icon='tabler:phone' fontSize={17} color={errors.phone ? c.error : c.textDisabled} />
                            </InputAdornment>
                          ),
                          endAdornment: lookingUpPhone ? (
                            <InputAdornment position='end'>
                              <CircularProgress size={15} sx={{ color: c.textDisabled }} />
                            </InputAdornment>
                          ) : phoneLookup?.exists ? (
                            <InputAdornment position='end'>
                              <Icon icon='tabler:circle-check-filled' fontSize={17} color={c.success} />
                            </InputAdornment>
                          ) : undefined
                        }}
                      />
                      {phoneLookup?.exists && (
                        <Box sx={{ mt: -0.5, mb: 0.5, px: 1.5, py: 0.75, borderRadius: '8px', bgcolor: alpha(c.success, 0.07), border: `1px solid ${alpha(c.success, 0.18)}` }}>
                          <Typography variant='body2' sx={{ fontSize: '0.76rem', fontWeight: 600, color: c.success, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Icon icon='tabler:user-check' fontSize={13} />
                            Account found{phoneLookup.name ? ` — ${phoneLookup.name}` : ''}. Enter your password below.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <CustomTextField
                      fullWidth
                      label='Full Name'
                      name='name'
                      value={form.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name || ' '}
                      disabled={loading}
                      InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:user' fontSize={17} color={errors.name ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                    <CustomTextField
                      fullWidth
                      label='Email Address'
                      name='email'
                      type='email'
                      placeholder='you@example.com'
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email || ' '}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='tabler:mail' fontSize={17} color={errors.email ? c.error : c.textDisabled} />
                          </InputAdornment>
                        )
                      }}
                    />
                    <CustomTextField
                      fullWidth
                      label='Password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Min 6 characters'
                      value={form.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || ' '}
                      disabled={loading}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><Icon icon='tabler:lock' fontSize={17} color={errors.password ? c.error : c.textDisabled} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                              {showPassword ? <Icon icon='tabler:eye-off' fontSize={17} /> : <Icon icon='tabler:eye' fontSize={17} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <CustomTextField
                      fullWidth
                      label='College'
                      name='college'
                      value={form.college}
                      onChange={handleChange}
                      error={!!errors.college}
                      helperText={errors.college || ' '}
                      disabled={loading}
                      InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:building' fontSize={17} color={errors.college ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                    <CustomTextField
                      fullWidth
                      label='City'
                      name='city'
                      value={form.city}
                      onChange={handleChange}
                      error={!!errors.city}
                      helperText={errors.city || ' '}
                      disabled={loading}
                      sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                      InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:map-pin' fontSize={17} color={errors.city ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                  </Box>
                )}

                {/* Submit */}
                <Button
                  fullWidth
                  type='submit'
                  variant='contained'
                  size='large'
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    mt: 0.5,
                    boxShadow: `0 4px 16px ${c.primaryA30}`,
                    '&:hover': { boxShadow: `0 6px 22px ${c.primaryA40}` }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color='inherit' />
                      {isExistingUser ? 'Signing in...' : 'Creating account...'}
                    </Box>
                  ) : isExistingUser ? 'Sign In' : 'Register & Continue'}
                </Button>
              </Box>
            </form>

            {/* Toggle mode */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              {isExistingUser ? (
                <Typography variant='body2' color='text.secondary'>
                  Don&apos;t have an account?{' '}
                  <Box
                    component='button'
                    type='button'
                    onClick={() => { setMode('register'); setPhoneLookup(null); setErrors({}); setServerError(''); setForm({ phone: '', name: '', email: '', password: '', college: '', city: '' }); submittedRef.current = false; lastPhoneLookupValue.current = '' }}
                    sx={{
                      all: 'unset', display: 'inline', cursor: 'pointer',
                      color: 'primary.main', fontWeight: 700, fontSize: 'inherit', fontFamily: 'inherit',
                      '&:hover, &:focus-visible': { textDecoration: 'underline' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '2px' }
                    }}
                  >
                    Create Account
                  </Box>
                </Typography>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Already have an account?{' '}
                  <Box
                    component='button'
                    type='button'
                    onClick={() => { setMode('login'); setErrors({}); setServerError(''); submittedRef.current = false; lastPhoneLookupValue.current = '' }}
                    sx={{
                      all: 'unset', display: 'inline', cursor: 'pointer',
                      color: 'primary.main', fontWeight: 700, fontSize: 'inherit', fontFamily: 'inherit',
                      '&:hover, &:focus-visible': { textDecoration: 'underline' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '2px' }
                    }}
                  >
                    Sign In
                  </Box>
                </Typography>
              )}
            </Box>

          </Box>
        </Box>
    </Box>
  )
}

LoginPage.getLayout = page => page
LoginPage.guestGuard = true
LoginPage.authGuard = false

export default LoginPage