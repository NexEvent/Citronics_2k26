import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import {
  registerUser,
  verifyUser,
  lookupPhone,
  closeStudentDialog,
  setExistingUser,
  selectShowStudentDialog
} from 'src/store/slices/checkoutSlice'

/* ═══════════════════════════════════════════════════════════════════════════
 *  Validation helpers
 * ═════════════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\d{10}$/

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
 *  Styled TextField wrapper
 * ═════════════════════════════════════════════════════════════════════════ */

function StyledField({ icon, label, name, value, onChange, error, helperText, type = 'text', required = true, endAdornment, autoFocus, ...props }) {
  const c = useAppPalette()

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText || ' '}
      type={type}
      required={required}
      autoFocus={autoFocus}
      size='small'
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment position='start'>
              <Icon icon={icon} fontSize={18} style={{ color: error ? c.error : c.textDisabled }} />
            </InputAdornment>
          ) : undefined,
          endAdornment: endAdornment || undefined
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          fontSize: '0.9rem',
          '& fieldset': {
            borderColor: alpha(c.divider, 0.5),
            transition: 'border-color 0.2s ease'
          },
          '&:hover fieldset': {
            borderColor: alpha(c.primary, 0.4)
          },
          '&.Mui-focused fieldset': {
            borderColor: c.primary,
            borderWidth: '1.5px'
          },
          '&.Mui-error fieldset': {
            borderColor: c.error
          }
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.85rem',
          fontWeight: 500
        },
        '& .MuiFormHelperText-root': {
          fontSize: '0.72rem',
          mt: 0.5,
          minHeight: '1em'
        }
      }}
      {...props}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Student Details Dialog
 * ═════════════════════════════════════════════════════════════════════════ */

export default function StudentDetailsDialog() {
  const c = useAppPalette()
  const dispatch = useDispatch()
  const router = useRouter()
  const open = useSelector(selectShowStudentDialog)
  const { registering, error: checkoutError } = useSelector(state => state.checkout)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    college: '',
    city: '',
    referredBy: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [phoneLookup, setPhoneLookup] = useState(null) // null | { exists, userId, name }
  const [lookingUpPhone, setLookingUpPhone] = useState(false)
  const phoneLookupTimer = useRef(null)

  // ── Live phone lookup ──────────────────────────────────────────────────
  useEffect(() => {
    // Reset on every keystroke
    setPhoneLookup(null)
    if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current)

    const cleaned = form.phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
    if (!/^\d{10}$/.test(cleaned)) return

    // Debounce 600ms
    phoneLookupTimer.current = setTimeout(async () => {
      setLookingUpPhone(true)
      try {
        const result = await dispatch(lookupPhone(form.phone))
        if (lookupPhone.fulfilled.match(result) && result.payload.exists) {
          const d = result.payload.data
          // Store all user data in phoneLookup — drive fields from here directly
          setPhoneLookup({
            exists: true,
            userId: d.userId,
            name: d.name || '',
            email: d.email || '',
            college: d.college || '',
            city: d.city || ''
          })
        } else {
          setPhoneLookup({ exists: false })
        }
      } catch { /* ignore */ }
      setLookingUpPhone(false)
    }, 600)

    return () => clearTimeout(phoneLookupTimer.current)
  }, [form.phone]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (serverError) setServerError('')
  }

  const validateAll = () => {
    const newErrors = {}
    const requiredFields = ['name', 'email', 'phone', 'password', 'college', 'city']
    let hasError = false

    for (const field of requiredFields) {
      const err = validateField(field, form[field])
      if (err) {
        newErrors[field] = err
        hasError = true
      }
    }

    setErrors(newErrors)
    return !hasError
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Existing user path — verify password before binding userId
    if (phoneLookup?.exists) {
      if (!form.password) {
        setVerifyError('Please enter your password to continue.')
        return
      }
      setVerifyError('')
      setVerifying(true)
      const cleaned = form.phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
      const result = await dispatch(verifyUser({ phone: cleaned, password: form.password }))
      setVerifying(false)
      if (verifyUser.fulfilled.match(result)) {
        dispatch(setExistingUser({ userId: result.payload.userId }))
        dispatch(closeStudentDialog())
        router.push('/checkout')
      } else {
        setVerifyError(result.payload || 'Incorrect password. Please try again.')
      }
      return
    }

    // New user path
    if (!validateAll()) return

    setServerError('')

    const result = await dispatch(registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      college: form.college.trim(),
      city: form.city.trim(),
      referredBy: form.referredBy.trim() || undefined
    }))

    if (registerUser.fulfilled.match(result)) {
      // Navigate to checkout — user data is now stored in DB
      router.push('/checkout')
    } else if (registerUser.rejected.match(result)) {
      const payload = result.payload
      // PHONE_EXISTS at registration time — user should have used the verify path above
      if (payload?.code === 'PHONE_EXISTS' || payload?.code === 'EMAIL_EXISTS') {
        const field = payload.code === 'PHONE_EXISTS' ? 'phone' : 'email'
        setErrors(prev => ({ ...prev, [field]: payload.message || 'Already registered.' }))
        return
      }
      setServerError(typeof payload === 'string' ? payload : payload?.message || 'Registration failed')
    }
  }

  const handleClose = () => {
    dispatch(closeStudentDialog())
  }

  return (
    <Dialog
      open={open}
      onClose={registering || verifying ? undefined : handleClose}
      maxWidth='sm'
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: c.bgPaper,
          backgroundImage: 'none',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.15rem', color: c.textPrimary, letterSpacing: '-0.01em' }}>
            Student Details
          </Typography>
          <Typography variant='body2' sx={{ color: c.textSecondary, mt: 0.5, fontSize: '0.82rem' }}>
            Please fill in your details to complete the booking
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={registering || verifying}
          size='small'
          sx={{ color: c.textDisabled, '&:hover': { color: c.textPrimary } }}
        >
          <Icon icon='tabler:x' fontSize={18} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Server error */}
          {(serverError || checkoutError) && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: alpha(c.error, 0.06),
                border: `1px solid ${alpha(c.error, 0.15)}`
              }}
            >
              <Typography variant='body2' sx={{ color: c.error, fontWeight: 500, fontSize: '0.82rem' }}>
                {serverError || checkoutError}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0.5, sm: 1.5 }, columnGap: 2 }}>
            {/* Phone — first so we can detect existing accounts early */}
            <Box sx={{ position: 'relative' }}>
              <StyledField
                icon='tabler:phone'
                label='Phone Number'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                autoFocus
                endAdornment={
                  lookingUpPhone ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={16} sx={{ color: c.textDisabled }} />
                    </InputAdornment>
                  ) : phoneLookup?.exists ? (
                    <InputAdornment position='end'>
                      <Icon icon='tabler:circle-check-filled' fontSize={18} style={{ color: c.success }} />
                    </InputAdornment>
                  ) : undefined
                }
              />
              {phoneLookup?.exists && (
                <Box
                  sx={{
                    mt: -1,
                    mb: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: '8px',
                    bgcolor: alpha(c.success, 0.08),
                    border: `1px solid ${alpha(c.success, 0.2)}`
                  }}
                >
                  <Typography variant='body2' sx={{ fontSize: '0.78rem', fontWeight: 600, color: c.success }}>
                    <Icon icon='tabler:user-check' fontSize={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Account found{phoneLookup.name ? ` — ${phoneLookup.name}` : ''}. Click “Submit & Continue” to proceed.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Full Name */}
            <StyledField
              icon='tabler:user'
              label='Full Name'
              name='name'
              value={phoneLookup?.exists ? phoneLookup.name : form.name}
              onChange={handleChange}
              error={errors.name}
              disabled={!!phoneLookup?.exists}
              required={!phoneLookup?.exists}
            />

            {/* Email */}
            <StyledField
              icon='tabler:mail'
              label='Email Address'
              name='email'
              type='email'
              value={phoneLookup?.exists ? phoneLookup.email : form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={!!phoneLookup?.exists}
              required={!phoneLookup?.exists}
            />

            {/* Password */}
            <StyledField
              icon='tabler:lock'
              label='Password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={phoneLookup?.exists ? '••••••' : form.password}
              onChange={phoneLookup?.exists ? undefined : handleChange}
              error={errors.password}
              disabled={!!phoneLookup?.exists}
              required={!phoneLookup?.exists}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)}
                    edge='end'
                    size='small'
                    tabIndex={-1}
                    sx={{ color: c.textDisabled }}
                  >
                    <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize={18} />
                  </IconButton>
                </InputAdornment>
              }
            />

            {/* College */}
            <StyledField
              icon='tabler:building'
              label='College'
              name='college'
              value={phoneLookup?.exists ? phoneLookup.college : form.college}
              onChange={handleChange}
              error={errors.college}
              disabled={!!phoneLookup?.exists}
              required={!phoneLookup?.exists}
            />

            {/* City */}
            <StyledField
              icon='tabler:map-pin'
              label='City'
              name='city'
              value={phoneLookup?.exists ? phoneLookup.city : form.city}
              onChange={handleChange}
              error={errors.city}
              disabled={!!phoneLookup?.exists}
              required={!phoneLookup?.exists}
            />
          </Box>

          
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={handleClose}
            disabled={registering || verifying}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              color: c.textSecondary,
              px: 3,
              '&:hover': { bgcolor: alpha(c.textSecondary, 0.06) }
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={registering || verifying}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 4,
              py: 1.2,
              bgcolor: c.primary,
              boxShadow: `0 4px 14px ${alpha(c.primary, 0.3)}`,
              '&:hover': {
                bgcolor: alpha(c.primary, 0.9),
                boxShadow: `0 6px 20px ${alpha(c.primary, 0.4)}`
              },
              '&.Mui-disabled': {
                bgcolor: alpha(c.primary, 0.5),
                color: c.white
              }
            }}
          >
            {registering || verifying ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} sx={{ color: 'inherit' }} />
                {verifying ? 'Verifying...' : 'Registering...'}
              </Box>
            ) : phoneLookup?.exists ? 'Verify & Continue' : 'Submit & Continue'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
