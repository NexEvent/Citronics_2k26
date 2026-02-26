import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useAppPalette } from 'src/components/palette'

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
 */function SiloCard({ event, index, accent }) {
  const c = useAppPalette()
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

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
          mx: 2.5,
          mt: 2.5,
          borderRadius: '15px',
          overflow: 'hidden',
          aspectRatio: '4 / 3',
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
              opacity: hovered ? 0 : 1,
              transform: hovered ? 'scale(1.05)' : 'scale(1)'
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
              opacity: hovered ? 0 : 1
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

        {/* Hover overlay with buttons */}
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
              router.push(`/events`)
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
              router.push(`/events`)
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
        </Box>
      </Box>

      {/* ── Event info below image ────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            color: c.textPrimary,
            mb: 1.5,
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
              py: 0.5,
              verticalAlign: 'top',
              fontSize: '0.82rem',
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
}

/* ── Main Section ───────────────────────────────────────────────────────── */
export default function FeaturedEvents({ events = [] }) {
  const c = useAppPalette()
  const router = useRouter()
  const accent = c.primary

  // Pick first 3 events (preferring featured ones)
  const featured = events.filter(e => e.featured)
  const rest = events.filter(e => !e.featured)
  const display = [...featured, ...rest].slice(0, 3)

  if (display.length === 0) return null

  return (
    <Box
      component='section'
      aria-label='This Week Events'
      sx={{ py: { xs: 8, md: 12 } }}
    >
      <Container maxWidth='xl'>
        {/* ── Header row ────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 4, md: 5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Count badge */}
            <Box
              sx={{
                width: 36,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: accent,
                  lineHeight: 1
                }}
              >
                {display.length}
              </Typography>
            </Box>

            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                color: c.textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.02em'
              }}
            >
              FEATURED
            </Typography>
          </Box>

          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            sx={{
              borderColor: alpha(accent, 0.4),
              color: accent,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              px: 3,
              py: 0.8,
              borderRadius: '8px',
              '&:hover': {
                borderColor: accent,
                bgcolor: alpha(accent, 0.06)
              }
            }}
          >
            View All
          </Button>
        </Box>

        {/* ── Cards grid ────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: { xs: 2.5, md: 3 }
          }}
        >
          {display.map((event, i) => (
            <SiloCard
              key={event.id || i}
              event={event}
              index={i}
              accent={accent}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}
