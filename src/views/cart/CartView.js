import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import { store } from 'src/store'
import {
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  validateCart
} from 'src/store/slices/cartSlice'
import { setCheckoutItems, openStudentDialog } from 'src/store/slices/checkoutSlice'

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

/* ── Quantity Control ──────────────────────────────────────────────────────── */

function QuantityControl({ quantity, onDecrease, onIncrease, accent, max }) {
  const c = useAppPalette()
  const atMax = typeof max === 'number' && quantity >= max

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '10px',
        border: `1.5px solid ${alpha(accent, 0.2)}`,
        overflow: 'hidden'
      }}
    >
      <IconButton
        size='small'
        onClick={onDecrease}
        disabled={quantity < 2}
        sx={{
          borderRadius: 0,
          width: 36,
          height: 36,
          color: accent,
          '&:hover': { bgcolor: alpha(accent, 0.06) },
          '&.Mui-disabled': { color: c.textDisabled }
        }}
      >
        <Icon icon='tabler:minus' fontSize={16} />
      </IconButton>
      <Typography
        sx={{
          minWidth: 40,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: c.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none'
        }}
      >
        {quantity}
      </Typography>
      <IconButton
        size='small'
        onClick={onIncrease}
        disabled={atMax}
        sx={{
          borderRadius: 0,
          width: 36,
          height: 36,
          color: accent,
          '&:hover': { bgcolor: alpha(accent, 0.06) }
        }}
      >
        <Icon icon='tabler:plus' fontSize={16} />
      </IconButton>
    </Box>
  )
}

/* ── Cart Item Row ─────────────────────────────────────────────────────────── */

function CartItem({ item, accent }) {
  const c = useAppPalette()
  const dispatch = useDispatch()
  const imageUrl = getItemImage(item)
  const subtotal = item.ticketPrice * item.quantity

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' }
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: { xs: '100%', sm: 120 },
          height: { xs: 160, sm: 120 },
          borderRadius: '12px',
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
          <Icon icon='tabler:calendar-event' fontSize={36} style={{ color: alpha(accent, 0.3) }} />
        )}
      </Box>

      {/* Details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.05rem' },
              lineHeight: 1.3,
              color: c.textPrimary,
              mb: 0.5
            }}
          >
            {item.title}
          </Typography>

          {/* Remove button */}
          <IconButton
            size='small'
            onClick={() => dispatch(removeFromCart({ eventId: item.eventId }))}
            sx={{
              color: c.textDisabled,
              flexShrink: 0,
              '&:hover': { color: c.error, bgcolor: alpha(c.error, 0.08) }
            }}
          >
            <Icon icon='tabler:trash' fontSize={18} />
          </IconButton>
        </Box>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, md: 3 }, mb: 2 }}>
          {item.startTime && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.82rem' }}>
              <Icon icon='tabler:calendar' fontSize={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              {formatDate(item.startTime)}
            </Typography>
          )}
          {item.startTime && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.82rem' }}>
              <Icon icon='tabler:clock' fontSize={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              {formatTime(item.startTime)}
            </Typography>
          )}
          {item.venue && (
            <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.82rem' }}>
              <Icon icon='tabler:map-pin' fontSize={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              {item.venue}
            </Typography>
          )}
        </Box>

        {/* Price + Quantity + Subtotal */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500, fontSize: '0.85rem' }}>
              {formatCurrency(item.ticketPrice)} each
            </Typography>
            <QuantityControl
              quantity={item.quantity}
              max={item.maxAvailable}
              onDecrease={() => dispatch(updateQuantity({ eventId: item.eventId, quantity: item.quantity - 1 }))}
              onIncrease={() => dispatch(updateQuantity({ eventId: item.eventId, quantity: item.quantity + 1 }))}
              accent={accent}
            />
            {typeof item.maxAvailable === 'number' && (
              <Typography variant='caption' sx={{ color: item.quantity >= item.maxAvailable ? c.error : c.textDisabled, fontWeight: 600 }}>
                {item.maxAvailable <= 0 ? 'Sold out' : `${item.maxAvailable} available`}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: c.textPrimary
            }}
          >
            {formatCurrency(subtotal)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

/* ── Empty Cart State ──────────────────────────────────────────────────────── */

function EmptyCart() {
  const c = useAppPalette()
  const router = useRouter()

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 10, md: 16 },
        px: 3
      }}
    >
      <Icon
        icon='tabler:shopping-cart-off'
        fontSize={64}
        style={{ color: alpha(c.primary, 0.25), marginBottom: 16 }}
      />
      <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
        Your cart is empty
      </Typography>
      <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
        Browse our events and add tickets to your cart to get started.
      </Typography>
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
        Browse Events
      </Button>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Cart Page View
 * ═════════════════════════════════════════════════════════════════════════ */

export default function CartView() {
  const c = useAppPalette()
  const router = useRouter()
  const dispatch = useDispatch()
  const accent = c.primary

  const items = useSelector(selectCartItems)
  const itemCount = useSelector(selectCartItemCount)
  const subtotal = useSelector(selectCartSubtotal)
  const { validating, hydrated, validationRemovedCount } = useSelector(state => state.cart)

  // Validate on every cart page visit.
  // - Initial load: fires when hydrated flips false→true (after CartHydrator dispatches hydrateCart).
  // - Subsequent visits: fires on fresh component mount because useEffect always runs on mount,
  //   even when the dep value (hydrated) hasn't changed since last unmount.
  // validateCart reads items from getState() at dispatch time, not the closure.
  useEffect(() => {
    if (hydrated && items.length > 0) {
      dispatch(validateCart())
    }
  }, [dispatch, hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Notify user when items were removed due to being sold out / unpublished
  useEffect(() => {
    if (validationRemovedCount > 0) {
      toast.error(
        `${validationRemovedCount} sold-out event${validationRemovedCount > 1 ? 's were' : ' was'} removed from your cart.`,
        { duration: 5000, id: 'cart-removal' }
      )
    }
  }, [validationRemovedCount])

  if (!hydrated) {
    return (
      <Container maxWidth='lg' sx={{ py: { xs: 4, md: 8 } }}>
        <Skeleton width={200} height={40} sx={{ mb: 4 }} />
        {[1, 2].map(i => (
          <Skeleton key={i} variant='rectangular' height={120} sx={{ borderRadius: '12px', mb: 2 }} />
        ))}
      </Container>
    )
  }

  if (items.length === 0) return <EmptyCart />

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 3, md: 5 } }}>
        <Box>
          <Typography
            variant='h4'
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: c.textPrimary, mb: 0.5 }}
          >
            Your Cart
          </Typography>
          <Typography variant='body2' sx={{ color: c.textSecondary }}>
            {itemCount} ticket{itemCount !== 1 ? 's' : ''} across {items.length} event{items.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant='text'
          size='small'
          onClick={() => dispatch(clearCart())}
          startIcon={<Icon icon='tabler:trash' fontSize={16} />}
          sx={{
            color: c.textSecondary,
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'none',
            '&:hover': { color: c.error, bgcolor: alpha(c.error, 0.06) }
          }}
        >
          Clear All
        </Button>
      </Box>

      {/* Main Grid: Items + Summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          gap: { xs: 3, md: 4 },
          alignItems: 'start'
        }}
      >
        {/* ── Items Column ─────────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: '16px',
            border: `1.5px solid ${alpha(accent, 0.15)}`,
            overflow: 'hidden'
          }}
        >
          {validating && (
            <Box sx={{ px: 3, py: 1, bgcolor: alpha(c.info, 0.06), borderBottom: `1px solid ${alpha(c.info, 0.12)}` }}>
              <Typography variant='caption' sx={{ color: c.info, fontWeight: 600 }}>
                Verifying prices with database…
              </Typography>
            </Box>
          )}

          {items.map((item, i) => (
            <Box key={item.eventId}>
              <Box sx={{ px: { xs: 2, md: 3 } }}>
                <CartItem item={item} accent={accent} />
              </Box>
              {i < items.length - 1 && (
                <Divider sx={{ borderColor: c.dividerA30 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* ── Summary Column ───────────────────────────────────────── */}
        <Box
          sx={{
            position: { md: 'sticky' },
            top: { md: 100 },
            borderRadius: '16px',
            border: `1.5px solid ${alpha(accent, 0.15)}`,
            p: { xs: 3, md: 3.5 }
          }}
        >
          <Typography
            variant='h6'
            sx={{ fontWeight: 800, mb: 3, color: c.textPrimary, letterSpacing: '-0.01em' }}
          >
            Order Summary
          </Typography>

          {/* Line items */}
          {items.map(item => (
            <Box
              key={item.eventId}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1.5,
                gap: 2
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  color: c.textSecondary,
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  flex: 1,
                  minWidth: 0
                }}
              >
                {item.title}
                <Typography
                  component='span'
                  sx={{ color: c.textDisabled, fontWeight: 400, ml: 0.5, fontSize: '0.78rem' }}
                >
                  × {item.quantity}
                </Typography>
              </Typography>
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, color: c.textPrimary, whiteSpace: 'nowrap', fontSize: '0.85rem' }}
              >
                {formatCurrency(item.ticketPrice * item.quantity)}
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
              {formatCurrency(subtotal)}
            </Typography>
          </Box>

          {/* Platform fee placeholder */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500 }}>
              Platform Fee
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, color: c.success || c.textPrimary }}>
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
              {formatCurrency(subtotal)}
            </Typography>
          </Box>

          {/* Checkout CTA */}
          <Button
            variant='contained'
            size='large'
            fullWidth
            disabled={validating}
            endIcon={<Icon icon='tabler:arrow-right' />}
            onClick={async () => {
              // Re-validate prices and availability immediately before checkout
              const result = await dispatch(validateCart())
              if (result.meta.requestStatus !== 'fulfilled') {
                toast.error('Could not verify your cart. Please try again.')
                return
              }
              const validEvents = result.payload ?? []
              if (validEvents.length === 0) {
                // All events removed (sold out / unpublished) — EmptyCart will render
                return
              }
              // Set checkout items (eventId + quantity only) and navigate
              const currentItems = store.getState().cart.items
              dispatch(setCheckoutItems({
                items: currentItems.map(i => ({ eventId: i.eventId, quantity: i.quantity })),
                source: 'cart'
              }))
              dispatch(openStudentDialog())
            }}
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
              transition: 'all 0.25s ease'
            }}
          >
            Proceed to Checkout
          </Button>

          {/* Continue shopping */}
          <Button
            variant='text'
            fullWidth
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={16} />}
            sx={{
              mt: 1.5,
              py: 1,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              color: c.textSecondary,
              '&:hover': { color: accent }
            }}
          >
            Continue Browsing
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
