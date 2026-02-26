import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
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
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Collapse from '@mui/material/Collapse'
import { useAppPalette } from 'src/components/palette'

// Icons
import {
  IconEye,
  IconEyeOff,
  IconUser,
  IconSchool,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconUserPlus,
  IconBrandGoogle
} from '@tabler/icons-react'

// Layout
import MinimalLayout from 'src/layouts/MinimalLayout'
import themeConfig from 'src/configs/themeConfig'

const STEPS = ['Personal Details', 'College Info']

// ── Validation helpers ──────────────────────────────────────────────────────────

const validateStep1 = (values) => {
  const errs = {}
  if (!values.name.trim()) errs.name = 'Full name is required'
  if (!values.email.trim()) errs.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email'
  if (!values.password) errs.password = 'Password is required'
  else if (values.password.length < 6) errs.password = 'Minimum 6 characters'
  if (values.password !== values.confirmPassword) errs.confirmPassword = 'Passwords do not match'
  if (values.phone && !/^\+?[\d\s-]{7,20}$/.test(values.phone)) errs.phone = 'Enter a valid phone number'

  return errs
}

const validateStep2 = (values) => {
  const errs = {}
  if (!values.college.trim()) errs.college = 'College name is required'
  if (!values.city.trim()) errs.city = 'City is required'

  return errs
}

// ── Component ───────────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const c = useAppPalette()
  const router = useRouter()

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    college: '',
    city: '',
    referralCode: ''
  })

  const handleChange = (field) => (e) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
    setApiError('')
  }

  const handleNext = () => {
    const stepErrors = validateStep1(values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)

      return
    }
    setActiveStep(1)
  }

  const handleBack = () => {
    setActiveStep(0)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (activeStep === 0) {
      handleNext()

      return
    }

    const stepErrors = validateStep2(values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)

      return
    }

    setLoading(true)
    setApiError('')

    try {
      await axios.post('/api/auth/register', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        password: values.password,
        studentId: values.studentId.trim() || undefined,
        college: values.college.trim(),
        city: values.city.trim(),
        referralCode: values.referralCode.trim() || undefined
      })

      setSuccess(true)

      // Auto-login after 1.5s
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: values.email.trim(),
          password: values.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/')
        } else {
          router.push('/login')
        }
      }, 1500)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component='main'
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
          maxWidth: 520,
          width: '100%',
          borderRadius: '20px',
          boxShadow: `0 8px 40px ${c.blackA8}`,
          border: `1px solid ${c.dividerA40}`,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>

          {/* Header */}
          <Box sx={{ mb: 3.5, textAlign: 'center' }}>
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
              <IconUserPlus size={26} color={c.primaryContrast} />
            </Box>
            <Typography variant='h1' sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              Join {themeConfig.templateName}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Create your student account
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {STEPS.map((label, i) => (
              <Step key={label} completed={activeStep > i || success}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.3s',
                        bgcolor: completed
                          ? 'primary.main'
                          : active
                            ? 'primary.main'
                            : c.textDisabledA12,
                        color: completed || active ? 'primary.contrastText' : 'text.disabled'
                      }}
                    >
                      {completed ? <IconCheck size={16} /> : i + 1}
                    </Box>
                  )}
                >
                  <Typography
                    variant='caption'
                    fontWeight={activeStep === i ? 600 : 400}
                    color={activeStep === i ? 'text.primary' : 'text.disabled'}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Alerts */}
          <Collapse in={!!apiError}>
            <Alert severity='error' sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          </Collapse>

          <Collapse in={success}>
            <Alert severity='success' sx={{ mb: 2, borderRadius: '10px' }}>
              Account created! Signing you in...
            </Alert>
          </Collapse>

          {/* Form */}
          <form onSubmit={handleSubmit} aria-label='Registration form'>
            {/* Step 1 — Personal Details */}
            {activeStep === 0 && (
              <Fade in>
                <Box>
                  <TextField
                    fullWidth
                    label='Full Name'
                    placeholder='Bhavik Sharma'
                    value={values.name}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconUser size={18} color={c.textDisabled} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    placeholder='bhavik@college.edu'
                    value={values.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    fullWidth
                    label='Phone Number'
                    placeholder='+91 98765 43210'
                    value={values.phone}
                    onChange={handleChange('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone || 'Optional'}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    fullWidth
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Min 6 characters'
                    value={values.password}
                    onChange={handleChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end' aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label='Confirm Password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Re-enter password'
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton size='small' onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge='end' aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}>
                            {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    fullWidth
                    variant='contained'
                    size='large'
                    onClick={handleNext}
                    endIcon={<IconArrowRight size={18} />}
                    sx={{
                      py: 1.4,
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Step 2 — College Info */}
            {activeStep === 1 && (
              <Fade in>
                <Box>
                  <TextField
                    fullWidth
                    label='College / University'
                    placeholder='IIT Delhi'
                    value={values.college}
                    onChange={handleChange('college')}
                    error={!!errors.college}
                    helperText={errors.college}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconSchool size={18} color={c.textDisabled} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label='City'
                    placeholder='New Delhi'
                    value={values.city}
                    onChange={handleChange('city')}
                    error={!!errors.city}
                    helperText={errors.city}
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    fullWidth
                    label='Student ID / Roll Number'
                    placeholder='CS2024001'
                    value={values.studentId}
                    onChange={handleChange('studentId')}
                    helperText='Optional — helps verify your identity'
                    disabled={loading}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    fullWidth
                    label='Referral Code'
                    placeholder='CIT-XXXXX'
                    value={values.referralCode}
                    onChange={handleChange('referralCode')}
                    helperText={'Optional — enter your friend\u0027s referral code'}
                    disabled={loading}
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant='outlined'
                      size='large'
                      onClick={handleBack}
                      startIcon={<IconArrowLeft size={18} />}
                      disabled={loading}
                      sx={{
                        py: 1.4,
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        flex: 0.4
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      fullWidth
                      type='submit'
                      variant='contained'
                      size='large'
                      disabled={loading || success}
                      endIcon={loading ? null : <IconCheck size={18} />}
                      sx={{
                        py: 1.4,
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        flex: 0.6
                      }}
                    >
                      {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Account'}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
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
            disabled={loading || success}
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
            Sign up with Google
          </Button>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant='body2' textAlign='center' color='text.secondary'>
            Already have an account?{' '}
            <Link href='/login' passHref legacyBehavior>
              <Typography
                component='a'
                variant='body2'
                color='primary'
                sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Typography>
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

RegisterPage.getLayout = page => <MinimalLayout>{page}</MinimalLayout>
RegisterPage.guestGuard = true
RegisterPage.authGuard = false

export default RegisterPage
