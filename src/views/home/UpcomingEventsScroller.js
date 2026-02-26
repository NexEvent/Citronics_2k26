import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── Helpers ──────────────────────────────────────────────────────────────── */
/**
 * Parses an ISO date string into day number, weekday name, and month name.
 * @param {string|null} iso - ISO 8601 date string
 * @returns {{ dayNum: number|string, weekday: string, month: string }}
 */function parseDate(iso) {
  if (!iso) return { dayNum: '', weekday: '', month: '' }
  const d = new Date(iso)
  return {
    dayNum: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    month: d.toLocaleDateString('en-US', { month: 'long' })
  }
}

/**
 * Extracts the first image from an event's images array.
 * @param {object} event - Event data object
 * @returns {string|null} Image URL or null
 */
function getImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

/* ── Single Event Card (image overlay style like SILO) ────────────────── */
/**
 * Single compact card for the auto-scrolling upcoming events ticker.
 * Shows event image, date badge, title, and a quick-link button.
 * @param {object} props
 * @param {object} props.event - Event data object
 */
function ScrollerCard({ event }) {
  const c = useAppPalette()
  const router = useRouter()
  const imageUrl = getImage(event)
  const { dayNum, weekday, month } = parseDate(event.start_time)
  const accent = c.primary
  const title = event.title || event.name || ''

  /* Generate a semi-random gradient for cards without images */
  const gradients = [
    `linear-gradient(135deg, ${alpha(accent, 0.7)} 0%, ${alpha(c.info, 0.5)} 100%)`,
    `linear-gradient(135deg, ${alpha(c.success, 0.6)} 0%, ${alpha(accent, 0.5)} 100%)`,
    `linear-gradient(135deg, ${alpha(c.warning, 0.6)} 0%, ${alpha(c.error, 0.4)} 100%)`,
    `linear-gradient(135deg, ${alpha(c.info, 0.7)} 0%, ${alpha(c.success, 0.4)} 100%)`,
    `linear-gradient(135deg, ${alpha(c.error, 0.6)} 0%, ${alpha(c.warning, 0.4)} 100%)`
  ]
  const numericId = typeof event.id === 'number' ? event.id : (parseInt(event.id, 10) || 0)
  const fallbackBg = gradients[Math.abs(numericId) % gradients.length]

  return (
    <Box
      role='button'
      tabIndex={0}
      aria-label={`View event: ${title}`}
      onClick={() => router.push(`/events/${event.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/events/${event.id}`) } }}
      sx={{
        position: 'relative',
        width: { xs: 260, sm: 290, md: 320 },
        height: { xs: 200, sm: 220, md: 240 },
        borderRadius: '14px',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: `0 12px 40px ${alpha(accent, 0.2)}`
        },
        background: imageUrl ? 'transparent' : fallbackBg
      }}
    >
      {/* Background image */}
      {imageUrl && (
        <Box
          component='img'
          src={imageUrl}
          alt={title}
          loading='lazy'
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}

      {/* Dark overlay for text readability */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: imageUrl
            ? 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 100%)'
        }}
      />

      {/* Date badge — top left */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
          zIndex: 2
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            fontWeight: 800,
            color: accent,
            lineHeight: 1
          }}
        >
          {dayNum}
        </Typography>
        <Box>
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2
            }}
          >
            {weekday}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.2
            }}
          >
            {month}
          </Typography>
        </Box>
      </Box>

      {/* Event title — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 2
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '0.9rem', md: '1rem' },
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  )
}

/* ── Infinite auto-scrolling row ──────────────────────────────────────── */
/**
 * Horizontally auto-scrolling row using CSS transform animation (GPU-composited).
 * Duplicates items for a seamless infinite loop.
 * @param {object} props
 * @param {Array} props.events - Event objects to display
 * @param {'left'|'right'} [props.direction='right'] - Scroll direction
 * @param {number} [props.duration=28] - Full-loop duration in seconds
 */
function ScrollRow({ events, direction = 'right', duration = 18 }) {
  /* Two copies is all we need — animation goes 0 → -50% (or reverse) */
  const items = [...events, ...events]

  const animName = direction === 'right' ? 'marqueeRight' : 'marqueeLeft'

  return (
    <Box sx={{ overflow: 'hidden', py: 1 }}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: '12px', md: '16px' },
          width: 'max-content',
          willChange: 'transform',

          /* Define both keyframes once; only one will be used per row */
          '@keyframes marqueeLeft': {
            '0%':   { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' }
          },
          '@keyframes marqueeRight': {
            '0%':   { transform: 'translateX(-50%)' },
            '100%': { transform: 'translateX(0)' }
          },

          animation: `${animName} ${duration}s linear infinite`,

          /* Pause on hover for accessibility / user interaction */
          '&:hover': { animationPlayState: 'paused' }
        }}
      >
        {items.map((ev, i) => (
          <ScrollerCard key={`${ev.id}-${i}`} event={ev} />
        ))}
      </Box>
    </Box>
  )
}

/* ── Main Section ─────────────────────────────────────────────────────── */
/**
 * Dual-row infinite auto-scrolling ticker of upcoming event cards.
 * Splits events into two rows scrolling in opposite directions.
 * @param {object} props
 * @param {Array} [props.events=[]] - Array of event objects from the home API
 */export default function UpcomingEventsScroller({ events = [] }) {
  const c = useAppPalette()
  const router = useRouter()

  if (events.length === 0) return null

  /* Split events into two rows */
  const mid = Math.ceil(events.length / 2)
  const row1 = events.slice(0, mid)
  const row2 = events.slice(mid)

  /* If row2 is empty, duplicate from row1 */
  const topRow = row1.length > 0 ? row1 : events
  const bottomRow = row2.length > 0 ? row2 : events

  return (
    <Box
      component='section'
      id='upcoming-events'
      aria-label='Upcoming Events'
      sx={{ py: { xs: 8, md: 12 } }}
    >
      {/* Section header */}
      <Container maxWidth='xl'>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: { xs: 4, md: 5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Event count badge */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `2px solid ${alpha(c.primary, 0.4)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: c.primary }}>
                {events.length}
              </Typography>
            </Box>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              Upcoming Events
            </Typography>
          </Box>

          <Button
            variant='outlined'
            size='small'
            onClick={() => router.push('/events')}
            endIcon={<Icon icon='tabler:arrow-right' fontSize={16} />}
            sx={{
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderColor: alpha(c.primary, 0.35),
              color: c.primary,
              px: 2.5,
              '&:hover': {
                borderColor: c.primary,
                background: alpha(c.primary, 0.06)
              }
            }}
          >
            View All
          </Button>
        </MotionBox>
      </Container>

      {/* Scrolling rows — full width, no container constraint */}
      <MotionBox
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}
      >
        <ScrollRow events={topRow} direction='right' duration={18} />
        <ScrollRow events={bottomRow} direction='left' duration={18} />
      </MotionBox>
    </Box>
  )
}
