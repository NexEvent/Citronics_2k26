import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import axios from 'axios'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Ticket Verification Page
 *
 *  Landing page when someone scans a ticket QR code.
 *  Staff can also check in tickets from this page.
 *
 *  URL: /tickets/verify?code=<uuid>
 * ═══════════════════════════════════════════════════════════════════════════ */

function VerifyView() {
  const c = useAppPalette()
  const router = useRouter()
  // Normalize: router.query values can be arrays when the same param appears multiple times
  const rawCode = router.query.code
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode
  const { data: session, status: sessionStatus } = useSession()

  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)
  const [valid, setValid] = useState(false)
  const [error, setError] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInDone, setCheckInDone] = useState(false)

  const STAFF_ROLES = ['admin', 'organizer', 'owner', 'head']
  const isStaff = session?.user?.role && STAFF_ROLES.includes(session.user.role.toLowerCase())

  const verify = useCallback(async () => {
    if (!code) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.post('/api/payment/verify-ticket', { qrCode: code })
      if (data.success) {
        setTicket(data.data.ticket)
        setValid(data.data.valid)
      } else {
        setError(data.message || 'Verification failed')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('__unauthenticated__')
      } else {
        setError(err.response?.data?.message || 'Failed to verify ticket')
      }
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (code) verify()
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckIn = async () => {
    if (!code) return
    setCheckingIn(true)
    try {
      const { data } = await axios.post('/api/payment/verify-ticket', { qrCode: code, checkIn: true })
      if (data.success) {
        setTicket(data.data.ticket)
        setCheckInDone(true)
        setValid(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed')
    } finally {
      setCheckingIn(false)
    }
  }

  // No code provided
  if (!code) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:qrcode-off' fontSize={56} style={{ color: c.textDisabled, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>No Ticket Code</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary }}>
          Please scan a valid ticket QR code to verify.
        </Typography>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: c.primary, mb: 3 }} />
        <Typography variant='h6' sx={{ fontWeight: 700, color: c.textPrimary }}>Verifying Ticket...</Typography>
      </Container>
    )
  }

  // 401 — prompt sign-in
  if (error === '__unauthenticated__') {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:lock' fontSize={56} style={{ color: c.primary, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>Sign in to verify</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4 }}>
          You need to be signed in to verify this ticket.
        </Typography>
        <Button
          variant='contained'
          onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
        >
          Sign In
        </Button>
      </Container>
    )
  }

  if (error && !ticket) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(c.error, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Icon icon='tabler:alert-circle' fontSize={48} style={{ color: c.error }} />
        </Box>
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>Invalid Ticket</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 3 }}>{error}</Typography>
        <Button variant='outlined' onClick={verify} startIcon={<Icon icon='tabler:refresh' />}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', borderColor: alpha(c.primary, 0.3), color: c.primary }}>
          Retry
        </Button>
      </Container>
    )
  }

  if (!ticket) return null

  // Determine visual state
  const isCheckedIn = ticket.checkedIn || checkInDone
  const isConfirmed = ticket.bookingStatus === 'confirmed'

  let statusIcon, statusColor, statusTitle, statusSubtitle
  if (isCheckedIn) {
    statusIcon = 'tabler:circle-check-filled'
    statusColor = c.info || '#3B82F6'
    statusTitle = 'Already Checked In'
    statusSubtitle = ticket.checkInAt
      ? `Checked in on ${fmtDate(ticket.checkInAt)} at ${fmtTime(ticket.checkInAt)}`
      : 'This ticket has been used'
  } else if (isConfirmed && valid) {
    statusIcon = 'tabler:circle-check-filled'
    statusColor = c.success
    statusTitle = 'Valid Ticket'
    statusSubtitle = 'This ticket is verified and valid for entry'
  } else {
    statusIcon = 'tabler:alert-triangle'
    statusColor = c.warning
    statusTitle = `Booking ${ticket.bookingStatus}`
    statusSubtitle = 'This ticket may not be valid for entry'
  }

  return (
    <Container maxWidth='sm' sx={{ py: { xs: 6, md: 12 } }}>
      {/* Status header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: alpha(statusColor, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3
        }}>
          <Icon icon={statusIcon} fontSize={48} style={{ color: statusColor }} />
        </Box>
        <Typography variant='h4' sx={{ fontWeight: 800, color: c.textPrimary, mb: 0.5 }}>
          {statusTitle}
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary }}>
          {statusSubtitle}
        </Typography>
      </Box>

      {/* Ticket details card */}
      <Box sx={{
        borderRadius: '16px',
        border: `1.5px solid ${alpha(statusColor, 0.2)}`,
        overflow: 'hidden',
        bgcolor: c.bgPaper,
        mb: 3
      }}>
        <Box sx={{ height: 4, bgcolor: statusColor }} />
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 700, color: c.textPrimary, mb: 0.5 }}>
            {ticket.eventTitle}
          </Typography>
          <Typography variant='caption' sx={{ color: c.textDisabled, fontFamily: 'monospace' }}>
            Ticket #{ticket.ticketId}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DetailRow icon='tabler:calendar' label='Date' value={fmtDate(ticket.startTime)} c={c} />
            <DetailRow icon='tabler:clock' label='Time'
              value={ticket.startTime ? fmtTime(ticket.startTime) : 'TBA'} c={c} />
            <DetailRow icon='tabler:map-pin' label='Venue' value={ticket.venue || 'TBA'} c={c} />
            <DetailRow icon='tabler:user' label='Attendee' value={ticket.attendeeName || '—'} c={c} />
          </Box>

          {ticket.attendeeEmail && (
            <Box sx={{ mt: 2 }}>
              <DetailRow icon='tabler:mail' label='Email' value={ticket.attendeeEmail} c={c} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Staff check-in button */}
      {isStaff && isConfirmed && !isCheckedIn && (
        <Button
          fullWidth variant='contained' size='large'
          onClick={handleCheckIn}
          disabled={checkingIn}
          startIcon={checkingIn ? <CircularProgress size={20} color='inherit' /> : <Icon icon='tabler:scan' />}
          sx={{
            borderRadius: '12px', fontWeight: 700, textTransform: 'none', py: 1.8,
            bgcolor: c.success,
            '&:hover': { bgcolor: alpha(c.success, 0.9) },
            mb: 2
          }}
        >
          {checkingIn ? 'Checking In...' : 'Check In This Ticket'}
        </Button>
      )}

      {checkInDone && (
        <Chip
          icon={<Icon icon='tabler:check' fontSize={16} />}
          label='Successfully checked in!'
          color='success'
          sx={{ fontWeight: 700, mb: 2, width: '100%', justifyContent: 'center' }}
        />
      )}

      {error && (
        <Typography variant='body2' sx={{ color: c.error, textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  )
}

function DetailRow({ icon, label, value, c }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Icon icon={icon} fontSize={15} style={{ color: c.primary, marginTop: 2, flexShrink: 0 }} />
      <Box>
        <Typography variant='caption' sx={{ color: c.textDisabled, fontSize: '0.65rem', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ color: c.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */

const VerifyTicketPage = () => (
  <Box
    component='main'
    sx={{
      overflowX: 'hidden',
      bgcolor: 'background.default',
      minHeight: '100vh',
      pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 }
    }}
  >
    <PublicNavbar />
    <Box sx={{ pt: { xs: 2, md: 10 }, pb: { xs: 4, md: 6 } }}>
      <VerifyView />
    </Box>
    <PublicFooter />
  </Box>
)

VerifyTicketPage.authGuard = false
VerifyTicketPage.guestGuard = false
VerifyTicketPage.getLayout = page => page

export default VerifyTicketPage
