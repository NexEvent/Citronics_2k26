import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import {
  validateCheckout,
  confirmBooking,
  resetCheckout,
  selectValidatedItems,
  selectCheckoutGrandTotal,
  selectCheckoutStep,
  selectCheckoutError,
  selectCheckoutUserId,
  selectCheckoutBookings
} from 'src/store/slices/checkoutSlice'
import { clearCart } from 'src/store/slices/cartSlice'

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatCurrency(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function getItemImage(item) {
  if (!item.image) return null
  if (typeof item.image === 'string') return item.image
  return item.image?.url || null
}

/* ── Loading Skeleton ──────────────────────────────────────────────────────── */

function CheckoutSkeleton() {
  return (
    <Container maxWidth='lg' sx={{ py: { xs: 4, md: 8 } }}>
      <Skeleton width={240} height={40} sx={{ mb: 4 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 4 }}>
        <Box>
          {[1, 2].map(i => (
            <Skeleton key={i} variant='rectangular' height={140} sx={{ borderRadius: '14px', mb: 2 }} />
          ))}
        </Box>
        <Skeleton variant='rectangular' height={300} sx={{ borderRadius: '14px' }} />
      </Box>
    </Container>
  )
}

/* ── Checkout Item Card ────────────────────────────────────────────────────── */

function CheckoutItemCard({ item }) {
  const c = useAppPalette()
  const accent = c.primary
  const imageUrl = getItemImage(item)

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, md: 2.5 },
        p: { xs: 2, md: 2.5 },
        borderRadius: '14px',
        border: `1px solid ${alpha(accent, 0.1)}`,
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' }
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: { xs: '100%', sm: 100 },
          height: { xs: 140, sm: 100 },
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: alpha(accent, 0.04),
          border: `1px solid ${c.dividerA30}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {imageUrl ? (
          <Box
            component='img'
            src={imageUrl}
            alt={item.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Icon icon='tabler:calendar-event' fontSize={32} style={{ color: alpha(accent, 0.3) }} />
        )}
      </Box>

      {/* Details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant='subtitle1'
          sx={{ fontWeight: 700, fontSize: '0.95rem', color: c.textPrimary, mb: 0.5, lineHeight: 1.3 }}
        >
          {item.title}
        </Typography>

        {item.departmentName && (
          <Chip
            label={item.departmentName}
            size='small'
            sx={{
              mb: 1,
              fontWeight: 600,
              fontSize: '0.68rem',
              height: 22,
              background: alpha(accent, 0.08),
              color: accent,
              border: `1px solid ${alpha(accent, 0.15)}`
            }}
          />
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
          {item.startTime && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.78rem' }}>
              <Icon icon='tabler:calendar' fontSize={13} style={{ verticalAlign: -2, marginRight: 3 }} />
              {formatDate(item.startTime)}
            </Typography>
          )}
          {item.startTime && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.78rem' }}>
              <Icon icon='tabler:clock' fontSize={13} style={{ verticalAlign: -2, marginRight: 3 }} />
              {formatTime(item.startTime)}
            </Typography>
          )}
          {item.venue && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.78rem' }}>
              <Icon icon='tabler:map-pin' fontSize={13} style={{ verticalAlign: -2, marginRight: 3 }} />
              {item.venue}
            </Typography>
          )}
        </Box>

        {/* Price breakdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500, fontSize: '0.82rem' }}>
              {formatCurrency(item.ticketPrice)} × {item.quantity}
            </Typography>
            {item.quantityCapped && (
              <Chip
                label={`Capped (max ${item.available})`}
                size='small'
                sx={{
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 20,
                  bgcolor: alpha(c.warning, 0.1),
                  color: c.warning,
                  border: `1px solid ${alpha(c.warning, 0.2)}`
                }}
              />
            )}
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: c.textPrimary }}>
            {formatCurrency(item.totalAmount)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

/* ── Booking Success View ──────────────────────────────────────────────────── */

function BookingSuccess({ bookings, grandTotal }) {
  const c = useAppPalette()
  const router = useRouter()

  return (
    <Container maxWidth='sm' sx={{ py: { xs: 6, md: 12 }, textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(c.success, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}
      >
        <Icon icon='tabler:circle-check-filled' fontSize={48} style={{ color: c.success }} />
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 800, color: c.textPrimary, mb: 1, letterSpacing: '-0.02em' }}>
        Booking Confirmed!
      </Typography>
      <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
        Your tickets have been booked successfully. You will receive a confirmation email shortly.
      </Typography>

      {/* Booking summary */}
      <Box
        sx={{
          borderRadius: '16px',
          border: `1.5px solid ${alpha(c.primary, 0.15)}`,
          p: 3,
          mb: 4,
          textAlign: 'left'
        }}
      >
        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: c.textPrimary, mb: 2 }}>
          Booking Summary
        </Typography>

        {bookings.map(b => (
          <Box key={b.bookingId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: c.textPrimary, fontSize: '0.85rem' }}>
                {b.eventTitle}
              </Typography>
              <Typography variant='caption' sx={{ color: c.textSecondary }}>
                {b.quantity} ticket{b.quantity > 1 ? 's' : ''} × {formatCurrency(b.pricePerTicket)}
              </Typography>
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 700, color: c.textPrimary, whiteSpace: 'nowrap' }}>
              {formatCurrency(b.totalAmount)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2, borderColor: c.dividerA30 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 800, color: c.textPrimary }}>
            Grand Total
          </Typography>
          <Typography variant='h6' sx={{ fontWeight: 800, color: c.primary }}>
            {formatCurrency(grandTotal)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
        <Button
          variant='contained'
          onClick={() => router.push('/events')}
          startIcon={<Icon icon='tabler:calendar-event' />}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            bgcolor: c.primary,
            '&:hover': { bgcolor: alpha(c.primary, 0.9) }
          }}
        >
          Browse More Events
        </Button>
        <Button
          variant='outlined'
          onClick={() => router.push('/')}
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderColor: alpha(c.primary, 0.3),
            color: c.primary,
            '&:hover': { borderColor: c.primary, bgcolor: alpha(c.primary, 0.04) }
          }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Checkout View — Main Component
 * ═════════════════════════════════════════════════════════════════════════ */

export default function CheckoutView() {
  const c = useAppPalette()
  const router = useRouter()
  const dispatch = useDispatch()
  const accent = c.primary

  const step = useSelector(selectCheckoutStep)
  const validatedItems = useSelector(selectValidatedItems)
  const grandTotal = useSelector(selectCheckoutGrandTotal)
  const error = useSelector(selectCheckoutError)
  const userId = useSelector(selectCheckoutUserId)
  const bookings = useSelector(selectCheckoutBookings)
  const { checkoutItems, source, confirming, bookingGrandTotal } = useSelector(state => state.checkout)

  // Guard + validate on mount
  useEffect(() => {
    if (!userId) {
      // User arrived without completing registration — send back
      toast.error('Please complete your details before checkout.')
      router.replace('/cart')
      return
    }
    if (checkoutItems.length === 0) {
      router.replace('/cart')
      return
    }
    dispatch(validateCheckout(checkoutItems))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmBooking = useCallback(async () => {
    if (!userId || validatedItems.length === 0) return

    const result = await dispatch(confirmBooking({
      userId,
      items: validatedItems.map(item => ({ eventId: item.eventId, quantity: item.quantity }))
    }))

    if (confirmBooking.fulfilled.match(result)) {
      toast.success('Booking confirmed successfully!', { duration: 5000 })
      if (source === 'cart') dispatch(clearCart())
    } else {
      toast.error(result.payload || 'Booking failed. Please try again.')
    }
  }, [dispatch, userId, validatedItems, source])

  // Show success view
  if (step === 'success') {
    return <BookingSuccess bookings={bookings} grandTotal={bookingGrandTotal} />
  }

  // Loading state
  if (step === 'validating' || step === 'idle') {
    return <CheckoutSkeleton />
  }

  // Error state (no items)
  if (step === 'error' || validatedItems.length === 0) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:alert-triangle' fontSize={56} style={{ color: c.warning, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
          Checkout Unavailable
        </Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
          {error || 'The items in your checkout are no longer available. Please try again.'}
        </Typography>
        <Button
          variant='contained'
          onClick={() => { dispatch(resetCheckout()); router.push('/cart') }}
          startIcon={<Icon icon='tabler:arrow-left' />}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            bgcolor: c.primary,
            '&:hover': { bgcolor: alpha(c.primary, 0.9) }
          }}
        >
          Back to Cart
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Button
          onClick={() => { dispatch(resetCheckout()); router.push('/cart') }}
          startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
          sx={{
            color: c.textSecondary,
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'none',
            mb: 2,
            p: 0,
            minWidth: 0,
            '&:hover': { color: accent }
          }}
        >
          Back to Cart
        </Button>
        <Typography
          variant='h4'
          sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: c.textPrimary }}
        >
          Checkout
        </Typography>
        <Typography variant='body2' sx={{ color: c.textSecondary, mt: 0.5 }}>
          Review your order and confirm your booking
        </Typography>
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
          gap: { xs: 3, md: 4 },
          alignItems: 'start'
        }}
      >
        {/* ── Items Column ── */}
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, color: c.textSecondary, mb: 2, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Order Items ({validatedItems.length})
          </Typography>

          {validatedItems.map(item => (
            <CheckoutItemCard key={item.eventId} item={item} />
          ))}

          {/* Validation warnings */}
          {validatedItems.some(item => item.quantityCapped) && (
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: '10px',
                bgcolor: alpha(c.warning, 0.06),
                border: `1px solid ${alpha(c.warning, 0.15)}`
              }}
            >
              <Typography variant='body2' sx={{ color: c.warning, fontWeight: 600, fontSize: '0.82rem' }}>
                <Icon icon='tabler:alert-circle' fontSize={16} style={{ verticalAlign: -3, marginRight: 6 }} />
                Some quantities were adjusted due to limited availability.
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Summary Column ── */}
        <Box
          sx={{
            position: { md: 'sticky' },
            top: { md: 100 },
            borderRadius: '16px',
            border: `1.5px solid ${alpha(accent, 0.15)}`,
            p: { xs: 3, md: 3.5 },
            bgcolor: c.bgPaper
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 3, color: c.textPrimary, letterSpacing: '-0.01em' }}>
            Order Summary
          </Typography>

          {/* Line items */}
          {validatedItems.map(item => (
            <Box key={item.eventId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: c.textSecondary, fontWeight: 500, fontSize: '0.82rem', flex: 1, minWidth: 0 }}
              >
                {item.title}
                <Typography
                  component='span'
                  sx={{ color: c.textDisabled, fontWeight: 400, ml: 0.5, fontSize: '0.78rem' }}
                >
                  × {item.quantity}
                </Typography>
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600, color: c.textPrimary, whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                {formatCurrency(item.totalAmount)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ borderColor: c.dividerA30, my: 2.5 }} />

          {/* Subtotal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500 }}>
              Subtotal
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, color: c.textPrimary }}>
              {formatCurrency(grandTotal)}
            </Typography>
          </Box>

          {/* Platform Fee */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500 }}>
              Platform Fee
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, color: c.success }}>
              FREE
            </Typography>
          </Box>

          <Divider sx={{ borderColor: c.dividerA30, my: 2.5 }} />

          {/* Grand Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ fontWeight: 800, color: c.textPrimary }}>
              Total
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 800, color: accent }}>
              {formatCurrency(grandTotal)}
            </Typography>
          </Box>

          {/* Error display */}
          {error && step === 'error' && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: alpha(c.error, 0.06),
                border: `1px solid ${alpha(c.error, 0.15)}`
              }}
            >
              <Typography variant='body2' sx={{ color: c.error, fontWeight: 500, fontSize: '0.82rem' }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Confirm Booking CTA */}
          <Button
            variant='contained'
            size='large'
            fullWidth
            disabled={confirming}
            onClick={handleConfirmBooking}
            endIcon={confirming ? undefined : <Icon icon='tabler:lock' />}
            sx={{
              mt: 3,
              py: 1.8,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              bgcolor: accent,
              boxShadow: `0 6px 24px ${alpha(accent, 0.35)}`,
              '&:hover': {
                bgcolor: alpha(accent, 0.9),
                boxShadow: `0 8px 32px ${alpha(accent, 0.45)}`
              },
              '&.Mui-disabled': {
                bgcolor: alpha(accent, 0.5),
                color: c.white
              },
              transition: 'all 0.25s ease'
            }}
          >
            {confirming ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'inherit' }} />
                Confirming...
              </Box>
            ) : (
              'Confirm Booking'
            )}
          </Button>

          {/* Security note */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 0.5 }}>
            <Icon icon='tabler:shield-check' fontSize={14} style={{ color: c.textDisabled }} />
            <Typography variant='caption' sx={{ color: c.textDisabled, fontWeight: 500 }}>
              Secure checkout — prices verified from database
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
