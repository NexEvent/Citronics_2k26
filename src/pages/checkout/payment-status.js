import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import axios from 'axios'

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function formatCurrency(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Payment Status Page
 *
 *  Users land here after returning from Juspay payment page.
 *  The page verifies payment status server-side and shows the result.
 * ═════════════════════════════════════════════════════════════════════════ */

function PaymentStatusView() {
  const c = useAppPalette()
  const router = useRouter()
  const { orderId, status: initialStatus } = router.query

  const [verifying, setVerifying] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const handleDownloadTicket = async (ticket) => {
    setDownloadingId(ticket.ticketId)
    try {
      const { generateTicketPDF } = await import('src/lib/generateTicketPDF')
      await generateTicketPDF(ticket)
    } catch (err) {
      console.error('PDF gen failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDownloadAll = async (tickets) => {
    setDownloadingAll(true)
    try {
      const { generateAllTicketsPDF } = await import('src/lib/generateTicketPDF')
      await generateAllTicketsPDF(tickets)
    } catch (err) {
      console.error('PDF gen failed:', err)
    } finally {
      setDownloadingAll(false)
    }
  }

  // Verify payment on mount
  const verifyPayment = useCallback(async () => {
    if (!orderId) return

    setVerifying(true)
    setError(null)

    try {
      const { data } = await axios.post('/api/payment/verify', { orderId })

      if (data.success) {
        setResult(data.data)

        // If still pending, auto-retry up to 3 times
        if (data.data.status === 'pending' && retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 3000) // retry after 3 seconds
        }
      } else {
        setError(data.message || 'Verification failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }, [orderId, retryCount])

  useEffect(() => {
    if (orderId) verifyPayment()
  }, [orderId, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── No order ID ────────────────────────────────────────────────────────
  if (!orderId) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:alert-triangle' fontSize={56} style={{ color: c.warning, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
          No Payment Found
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4 }}>
          We couldn't find a payment to verify. Please try again from your cart.
        </Typography>
        <Button
          variant='contained'
          onClick={() => router.push('/cart')}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
        >
          Go to Cart
        </Button>
      </Container>
    )
  }

  // ── Loading / Verifying ────────────────────────────────────────────────
  if (verifying && !result) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: c.primary, mb: 3 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>
          Verifying Payment...
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary }}>
          Please wait while we confirm your payment with the bank.
        </Typography>
      </Container>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(c.error, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Icon icon='tabler:alert-circle' fontSize={48} style={{ color: c.error }} />
        </Box>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
          Verification Error
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            onClick={verifyPayment}
            startIcon={<Icon icon='tabler:refresh' />}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
          >
            Retry Verification
          </Button>
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', px: 4, py: 1.5, borderColor: alpha(c.primary, 0.3), color: c.primary }}
          >
            Browse Events
          </Button>
        </Box>
      </Container>
    )
  }

  // ── SUCCESS ────────────────────────────────────────────────────────────
  if (result?.status === 'success') {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 6, md: 12 }, textAlign: 'center' }}>
        {/* Success Icon */}
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(c.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Icon icon='tabler:circle-check-filled' fontSize={48} style={{ color: c.success }} />
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 800, color: c.textPrimary, mb: 1, letterSpacing: '-0.02em' }}>
          Payment Successful!
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 1, maxWidth: 400, mx: 'auto' }}>
          Your payment has been confirmed and tickets have been generated.
        </Typography>

        {result.payment?.transactionId && (
          <Chip
            label={`Transaction: ${result.payment.transactionId}`}
            size='small'
            sx={{ mb: 3, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(c.success, 0.08), color: c.success }}
          />
        )}

        {/* Tickets */}
        {result.tickets && result.tickets.length > 0 && (
          <Box sx={{ borderRadius: '16px', border: `1.5px solid ${alpha(c.primary, 0.15)}`, p: 3, mb: 3, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, color: c.textPrimary }}>
                <Icon icon='tabler:ticket' fontSize={16} style={{ verticalAlign: -3, marginRight: 6 }} />
                Your Tickets ({result.tickets.length})
              </Typography>
              {result.tickets.length > 1 && (
                <Button
                  size='small'
                  variant='text'
                  onClick={() => handleDownloadAll(result.tickets)}
                  disabled={downloadingAll}
                  startIcon={downloadingAll ? <CircularProgress size={14} /> : <Icon icon='tabler:download' fontSize={14} />}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: c.primary }}
                >
                  Download All
                </Button>
              )}
            </Box>

            {result.tickets.map((ticket, idx) => (
              <Box
                key={ticket.ticketId || idx}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(c.primary, 0.1)}`,
                  bgcolor: alpha(c.primary, 0.02)
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: c.textPrimary, fontSize: '0.88rem' }}>
                    {ticket.eventTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label='Valid'
                      size='small'
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 20, bgcolor: alpha(c.success, 0.1), color: c.success }}
                    />
                    <Tooltip title='Download PDF'>
                      <IconButton
                        size='small'
                        onClick={() => handleDownloadTicket(ticket)}
                        disabled={downloadingId === ticket.ticketId}
                        sx={{ color: c.primary, p: 0.5 }}
                      >
                        {downloadingId === ticket.ticketId
                          ? <CircularProgress size={14} />
                          : <Icon icon='tabler:download' fontSize={16} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {ticket.venue && (
                  <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.78rem', mb: 0.5 }}>
                    <Icon icon='tabler:map-pin' fontSize={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {ticket.venue}
                  </Typography>
                )}

                {ticket.startTime && (
                  <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.78rem', mb: 1 }}>
                    <Icon icon='tabler:calendar' fontSize={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {formatDate(ticket.startTime)} at {formatTime(ticket.startTime)}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pt: 1, borderTop: `1px dashed ${alpha(c.divider, 0.3)}` }}>
                  <Icon icon='tabler:qrcode' fontSize={14} style={{ color: c.textDisabled }} />
                  <Typography variant='caption' sx={{ color: c.textDisabled, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {ticket.qrCode ? ticket.qrCode.slice(0, 8) + '···' + ticket.qrCode.slice(-4) : ''}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
          <Button
            variant='contained'
            onClick={() => router.push('/tickets')}
            startIcon={<Icon icon='tabler:ticket' />}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
          >
            View My Tickets
          </Button>
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:calendar-event' />}
            sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', px: 4, py: 1.5, borderColor: alpha(c.primary, 0.3), color: c.primary }}
          >
            Browse More Events
          </Button>
        </Box>
      </Container>
    )
  }

  // ── PENDING ────────────────────────────────────────────────────────────
  if (result?.status === 'pending') {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(c.warning, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <CircularProgress size={36} sx={{ color: c.warning }} />
        </Box>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
          Payment Processing
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 2, maxWidth: 400, mx: 'auto' }}>
          Your payment is being processed by the bank. This usually takes a few seconds.
        </Typography>
        {retryCount < 3 && (
          <Typography variant='body2' sx={{ color: c.textDisabled, mb: 4 }}>
            Auto-checking again... ({retryCount + 1}/3)
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            onClick={() => { setRetryCount(0); verifyPayment() }}
            startIcon={<Icon icon='tabler:refresh' />}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
          >
            Check Again
          </Button>
          <Button
            variant='outlined'
            onClick={() => router.push('/')}
            sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', px: 4, py: 1.5, borderColor: alpha(c.primary, 0.3), color: c.primary }}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    )
  }

  // ── FAILED ─────────────────────────────────────────────────────────────
  return (
    <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(c.error, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
        <Icon icon='tabler:x' fontSize={48} style={{ color: c.error }} />
      </Box>
      <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
        Payment Failed
      </Typography>
      <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
        {result?.message || 'Your payment could not be processed. No amount has been charged.'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant='contained'
          onClick={() => router.push('/cart')}
          startIcon={<Icon icon='tabler:shopping-cart' />}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}
        >
          Try Again
        </Button>
        <Button
          variant='outlined'
          onClick={() => router.push('/events')}
          sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', px: 4, py: 1.5, borderColor: alpha(c.primary, 0.3), color: c.primary }}
        >
          Browse Events
        </Button>
      </Box>
    </Container>
  )
}

/**
 * Payment Status Page — Citronics 2026
 * Users land here after returning from the HDFC SmartGateway payment page.
 */
const PaymentStatusPage = () => {
  return (
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
      <Box sx={{ pt: { xs: 2, md: 12 }, pb: { xs: 4, md: 6 } }}>
        <PaymentStatusView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

PaymentStatusPage.authGuard = false
PaymentStatusPage.guestGuard = false
PaymentStatusPage.getLayout = page => page

export default PaymentStatusPage
