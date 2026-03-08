import { useState, useEffect, useCallback, useRef, memo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'
import { addToCart, selectCartItems } from 'src/store/slices/cartSlice'

const MotionBox = motion(Box)

/* ── Helpers ────────────────────────────────────────────────────────────── */
function parseDate(raw) {
  if (!raw) return { dayOfWeek: '—', full: '—', time: '—' }
  const d = new Date(raw)
  const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' })
  const full = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return { dayOfWeek, full, time }
}

/**
 * Extracts the first image from an event's images array.
 * @param {object} event - Event data object
 * @returns {string|null} Image URL or null
 */
function getImage(event) {
  if (event.images && Array.isArray(event.images) && event.images.length > 0) {
    return event.images[0]
  }
  return null
}

/* ── Single Event Card (SILO Dallas style) ──────────────────────────────── *//**
 * Renders a single event card in the "This Week" section.
 * @param {object} props
 * @param {object} props.event - Event data object
 * @param {number} props.index - Card index for staggered animation
 * @param {string} props.accent - Accent color from the theme
 */const SiloCard = memo(function SiloCard({ event, index, accent }) {
  const c = useAppPalette()
  const router = useRouter()
  const dispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const [hovered, setHovered] = useState(false)
  const isMobile = useMediaQuery(c.theme.breakpoints.down('md'))

  const isInCart = cartItems.some(item => item.eventId === event.id)

  const { full: dateStr, time: timeStr } = parseDate(event.start_time)
  const image = getImage(event)

  const details = [
    { label: 'Date:', value: dateStr },
    { label: 'Time:', value: timeStr },
    { label: 'Venue:', value: event.venue || '—' }
  ]

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '15px',
        border: `1.5px solid ${alpha(accent, 0.35)}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        bgcolor: 'transparent',
        '&:hover': {
          borderColor: alpha(accent, 0.65),
          boxShadow: `0 0 28px ${alpha(accent, 0.12)}`
        }
      }}
    >
      {/* ── Image area ────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          mx: { xs: 1.5, md: 2.5 },
          mt: { xs: 1.5, md: 2.5 },
          borderRadius: '15px',
          overflow: 'hidden',
          aspectRatio: { xs: '16 / 10', md: '4 / 3' },
          bgcolor: c.isDark
            ? alpha(c.bgPaper, 0.15)
            : alpha(c.grey[200], 0.6)
        }}
      >
        {/* Image */}
        {image ? (
          <Box
            component='img'
            src={image}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              opacity: !isMobile && hovered ? 0 : 1,
              transform: !isMobile && hovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          /* Gradient fallback when no image */
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(accent, 0.15)} 0%, ${alpha(c.primary, 0.08)} 50%, ${alpha(c.info || accent, 0.12)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.4s ease',
              opacity: !isMobile && hovered ? 0 : 1
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.6rem',
                color: alpha(accent, 0.25),
                letterSpacing: 2,
                textTransform: 'uppercase',
                userSelect: 'none'
              }}
            >
              {event.title?.charAt(0) || 'E'}
            </Typography>
          </Box>
        )}

        {/* Hover overlay with buttons — desktop only */}
        {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            bgcolor: c.isDark
              ? alpha(c.bgDefault, 0.88)
              : alpha(c.white, 0.92),
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: hovered ? 'auto' : 'none'
          }}
        >
          <Button
            variant='contained'
            onClick={e => {
              e.stopPropagation()
              router.push(`/events/${event.id}`)
            }}
            sx={{
              bgcolor: accent,
              color: c.isDark ? c.black : c.white,
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              px: 3.5,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: alpha(accent, 0.85)
              }
            }}
          >
            Book Tickets
          </Button>
          <Button
            variant='outlined'
            onClick={e => {
              e.stopPropagation()
              router.push(`/events/${event.id}`)
            }}
            sx={{
              borderColor: alpha(accent, 0.5),
              color: accent,
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              px: 3.5,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                borderColor: accent,
                bgcolor: alpha(accent, 0.08)
              }
            }}
          >
            View Details
          </Button>
          <Button
            variant='outlined'
            disabled={isInCart}
            onClick={e => {
              e.stopPropagation()
              dispatch(addToCart({
                eventId: event.id,
                title: event.title,
                ticketPrice: event.ticket_price || 0,
                quantity: 1,
                image: getImage(event),
                startTime: event.start_time,
                venue: event.venue,
                maxAvailable: event.seats > 0 ? Math.max(0, event.seats - (event.registered || 0)) : null
              }))
            }}
            sx={{
              borderColor: alpha(accent, 0.5),
              color: accent,
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              px: 3.5,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                borderColor: accent,
                bgcolor: alpha(accent, 0.08)
              }
            }}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </Box>
        )}
      </Box>

      {/* ── Mobile action buttons below image ───────────────────────── */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 1.5,
            pt: 1.25
          }}
        >
          <Button
            variant='contained'
            onClick={e => {
              e.stopPropagation()
              router.push(`/events/${event.id}`)
            }}
            sx={{
              flex: 1,
              bgcolor: accent,
              color: c.isDark ? c.black : c.white,
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              py: 0.9,
              borderRadius: '8px',
              '&:hover': { bgcolor: alpha(accent, 0.85) }
            }}
          >
            View Details
          </Button>
          <Button
            variant='outlined'
            disabled={isInCart}
            onClick={e => {
              e.stopPropagation()
              dispatch(addToCart({
                eventId: event.id,
                title: event.title,
                ticketPrice: event.ticket_price || 0,
                quantity: 1,
                image: getImage(event),
                startTime: event.start_time,
                venue: event.venue,
                maxAvailable: event.seats > 0 ? Math.max(0, event.seats - (event.registered || 0)) : null
              }))
            }}
            sx={{
              flex: 1,
              borderColor: alpha(accent, 0.5),
              color: accent,
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              py: 0.9,
              borderRadius: '8px',
              '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.08) }
            }}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </Box>
      )}

      {/* ── Event info below image ────────────────────────────────────── */}
      <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: { xs: 1.5, md: 2 }, pb: { xs: 2.5, md: 2.5 } }}>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            color: c.textPrimary,
            mb: { xs: 1, md: 1.5 },
            lineHeight: 1.25,
            fontSize: { xs: '1rem', md: '1.05rem' }
          }}
        >
          {event.title}
        </Typography>

        {/* Details table */}
        <Box
          component='table'
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& td': {
              py: { xs: 0.55, md: 0.5 },
              verticalAlign: 'top',
              fontSize: { xs: '0.88rem', md: '0.82rem' },
              lineHeight: 1.5
            }
          }}
        >
          <tbody>
            {details.map(({ label, value }) => (
              <tr key={label}>
                <Box
                  component='td'
                  sx={{
                    color: c.textSecondary,
                    fontWeight: 500,
                    pr: 2,
                    whiteSpace: 'nowrap',
                    width: '1%'
                  }}
                >
                  {label}
                </Box>
                <Box
                  component='td'
                  sx={{
                    color: c.textPrimary,
                    fontWeight: 600
                  }}
                >
                  {value}
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </MotionBox>
  )
})

/* ── Slide variants ─────────────────────────────────────────────────────── */
const slideVariants = {
  enter: direction => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: direction => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0
  })
}

/* ── Pagination Dot ─────────────────────────────────────────────────────── */
function PaginationDot({ active, accent, onClick }) {
  const c = useAppPalette()

  return (
    <Box
      onClick={onClick}
      sx={{
        width: active ? 28 : 10,
        height: 10,
        borderRadius: '100px',
        bgcolor: active ? accent : alpha(c.textDisabled, 0.25),
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: active ? accent : alpha(c.textDisabled, 0.45)
        }
      }}
    />
  )
}

/* ── Main Section — Category Event Showcase ─────────────────────────────── */
export default function FeaturedEvents({ categoryEvents = [] }) {
  const c = useAppPalette()
  const router = useRouter()
  const accent = c.primary

  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const pausedRef = useRef(false)

  const totalCategories = categoryEvents.length

  // Always-running interval — reads pausedRef each tick so it never gets "stuck"
  useEffect(() => {
    if (totalCategories <= 1) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      setDirection(1)
      setActiveIndex(prev => (prev + 1) % totalCategories)
    }, 3900)
    return () => clearInterval(id)
  }, [totalCategories])

  const goTo = useCallback(idx => {
    setDirection(idx > activeIndex ? 1 : -1)
    setActiveIndex(idx)
  }, [activeIndex])

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveIndex(prev => (prev + 1) % totalCategories)
  }, [totalCategories])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveIndex(prev => (prev - 1 + totalCategories) % totalCategories)
  }, [totalCategories])

  if (totalCategories === 0) return null

  const current = categoryEvents[activeIndex]

  return (
    <Box
      component='section'
      aria-label='Event Showcase by Category'
      sx={{ py: { xs: 8, md: 12 } }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <Container maxWidth='xl'>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <Box sx={{ mb: { xs: 3, md: 5 } }}>
          {/* Top row: badge + category name + arrows (desktop) + View All (desktop) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, md: 2 }, minWidth: 0, flex: 1 }}>
              {/* Category count badge */}
              <Box
                sx={{
                  flexShrink: 0,
                  width: { xs: 30, md: 36 },
                  height: { xs: 34, md: 40 },
                  borderRadius: '50%',
                  border: `2px solid ${accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.75rem', md: '0.85rem' }, color: accent, lineHeight: 1 }}>
                  {current.events.length}
                </Typography>
              </Box>

              {/* Dynamic category heading */}
              <Box sx={{ overflow: 'hidden', position: 'relative', minHeight: { xs: 32, md: 42 }, flex: 1 }}>
                <AnimatePresence mode='wait' custom={direction}>
                  <MotionBox
                    key={current.categoryId}
                    custom={direction}
                    initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Typography
                      variant='h4'
                      sx={{
                        fontWeight: 800,
                        color: c.textPrimary,
                        fontSize: { xs: '1.2rem', md: '2rem' },
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        whiteSpace: { xs: 'normal', md: 'nowrap' },
                        lineHeight: 1.2,
                        textAlign: { xs: 'center', md: 'left' }
                      }}
                    >
                      {current.categoryName}
                    </Typography>
                  </MotionBox>
                </AnimatePresence>
              </Box>
            </Box>

            {/* Desktop: arrows + View All */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              {totalCategories > 1 && (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Box
                    onClick={goPrev}
                    sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: `1.5px solid ${alpha(accent, 0.35)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: accent,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.08) }
                    }}
                  >
                    <Icon icon='tabler:chevron-left' fontSize={18} />
                  </Box>
                  <Box
                    onClick={goNext}
                    sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: `1.5px solid ${alpha(accent, 0.35)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: accent,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.08) }
                    }}
                  >
                    <Icon icon='tabler:chevron-right' fontSize={18} />
                  </Box>
                </Box>
              )}
              <Button
                variant='outlined'
                onClick={() => router.push('/events')}
                sx={{
                  borderColor: alpha(accent, 0.4), color: accent,
                  fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.5,
                  textTransform: 'uppercase', px: 3, py: 0.8, borderRadius: '8px',
                  '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) }
                }}
              >
                View All
              </Button>
            </Box>
          </Box>

          {/* Mobile: arrows + View All below category name */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1.5
            }}
          >
            {totalCategories > 1 && (
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Box
                  onClick={goPrev}
                  sx={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: `1.5px solid ${alpha(accent, 0.35)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: accent
                  }}
                >
                  <Icon icon='tabler:chevron-left' fontSize={15} />
                </Box>
                <Box
                  onClick={goNext}
                  sx={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: `1.5px solid ${alpha(accent, 0.35)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: accent
                  }}
                >
                  <Icon icon='tabler:chevron-right' fontSize={15} />
                </Box>
              </Box>
            )}
            <Button
              variant='outlined'
              size='small'
              onClick={() => router.push('/events')}
              sx={{
                borderColor: alpha(accent, 0.4), color: accent,
                fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1,
                textTransform: 'uppercase', px: 1.5, py: 0.4, borderRadius: '6px',
                '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) }
              }}
            >
              View All
            </Button>
          </Box>
        </Box>

        {/* ── Cards carousel ─────────────────────────────────────────── */}
        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: { xs: 430, md: 480 } }}>
          <AnimatePresence mode='wait' custom={direction}>
            <MotionBox
              key={current.categoryId}
              custom={direction}
              variants={slideVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                },
                gap: { xs: 1.5, md: 3 },
                mx: { xs: 1.5, sm: 0 }
              }}
            >
              {current.events.map((event, i) => (
                <SiloCard
                  key={event.id}
                  event={event}
                  index={i}
                  accent={accent}
                />
              ))}
            </MotionBox>
          </AnimatePresence>
        </Box>

        {/* ── Pagination dots ────────────────────────────────────────── */}
        {totalCategories > 1 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: { xs: 4, md: 5 }
            }}
          >
            {categoryEvents.map((cat, i) => (
              <PaginationDot
                key={cat.categoryId}
                active={i === activeIndex}
                accent={accent}
                onClick={() => goTo(i)}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
