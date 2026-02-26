import { useRef, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion, useInView } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── Animated counter hook ──────────────────────────────────────────────── */
function useCounter(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])
  return count
}

/* ── Bento-grid tile layout map ─────────────────────────────────────────── */
// Defines grid placement for each of the 6 cards in the bento grid
// Layout mirrors the Nassummit reference: mixed sizes, asymmetric, dynamic
const BENTO_LAYOUT = [
  // Card 0 — tall left (Events)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: { xs: 'auto', md: 'span 2' },
    featured: true
  },
  // Card 1 — top center (Participants)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: 'auto',
    featured: false
  },
  // Card 2 — top right (Departments)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: { xs: 'auto', md: 'span 2' },
    featured: true
  },
  // Card 3 — mid center (Prize Pool)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: 'auto',
    featured: false
  },
  // Card 4 — bottom left (Workshops)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: 'auto',
    featured: false
  },
  // Card 5 — bottom right (Sponsors)
  {
    gridColumn: { xs: 'span 6', md: 'span 4' },
    gridRow: 'auto',
    featured: false
  }
]

/* ── Single stat card ───────────────────────────────────────────────────── */
function StatCard({ stat, index, started, layout }) {
  const c = useAppPalette()
  const count = useCounter(stat.value, 1600 + index * 100, started)
  const color = c.theme.palette[stat.paletteKey]?.main || c.primary
  const isFeatured = layout?.featured

  return (
    <MotionBox
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: 'relative',
        p: { xs: 3, md: isFeatured ? 5 : 3.5 },
        borderRadius: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        // Glass background with theme-aware tint
        background: isFeatured
          ? `linear-gradient(145deg, ${alpha(color, 0.12)}, ${alpha(color, 0.04)})`
          : alpha(c.bgPaper, c.isDark ? 0.06 : 0.85),
        border: `1px solid ${alpha(color, isFeatured ? 0.2 : 0.1)}`,
        backdropFilter: 'blur(20px)',
        '&:hover': {
          transform: 'translateY(-6px)',
          border: `1px solid ${alpha(color, 0.35)}`,
          boxShadow: `0 24px 64px ${alpha(color, 0.12)}, 0 0 0 1px ${alpha(color, 0.05)} inset`
        }
      }}
    >
      {/* Decorative radial glow — only on featured */}
      {isFeatured && (
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.1)}, transparent 70%)`,
            top: -60,
            right: -60,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Icon */}
      <Box
        sx={{
          width: isFeatured ? 64 : 52,
          height: isFeatured ? 64 : 52,
          borderRadius: '16px',
          background: alpha(color, 0.12),
          border: `1px solid ${alpha(color, 0.18)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: isFeatured ? 3 : 2,
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.08) rotate(-3deg)' }
        }}
      >
        <Icon icon={stat.icon} fontSize={isFeatured ? 30 : 24} style={{ color }} />
      </Box>

      {/* Value */}
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: isFeatured
            ? { xs: '2.4rem', md: '3.2rem' }
            : { xs: '1.8rem', md: '2.2rem' },
          lineHeight: 1.1,
          mb: 0.5,
          color: c.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-1px'
        }}
      >
        {count.toLocaleString()}
        <Box component='span' sx={{ color, fontSize: '0.65em', ml: 0.25 }}>
          {stat.suffix}
        </Box>
      </Typography>

      {/* Label */}
      <Typography
        sx={{
          color: c.textSecondary,
          fontWeight: 600,
          fontSize: isFeatured ? '0.95rem' : '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: 1.5
        }}
      >
        {stat.label}
      </Typography>
    </MotionBox>
  )
}

/* ── Stats Section ──────────────────────────────────────────────────────── *//**
 * Bento-grid stats section showing animated KPI tiles.
 * Starts counter animations when the section scrolls into view.
 * @param {object} props
 * @param {Array} [props.stats=[]] - Array of stat objects from the home API
 */export default function StatsSection({ stats: STATS = [] }) {
  const c = useAppPalette()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  // Guard against null — default param only protects against undefined
  const safeStats = STATS ?? []

  return (
    <Box
      id='stats'
      ref={ref}
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth='xl'>
        {/* ── Heading ────────────────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 0.75,
              borderRadius: '100px',
              background: c.primaryA8,
              border: `1px solid ${c.primaryA15}`,
              mb: 3
            }}
          >
            <Icon icon='tabler:chart-dots-3' fontSize={14} style={{ color: c.primary }} />
            <Typography
              variant='caption'
              sx={{ color: c.primary, fontWeight: 700, letterSpacing: 2, fontSize: '0.7rem' }}
            >
              BY THE NUMBERS
            </Typography>
          </Box>

          <Typography
            component='h2'
            sx={{
              fontWeight: 400,
              mb: 1,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              color: c.textSecondary
            }}
          >
            The Biggest Tech Fest
          </Typography>

          <Typography
            component='h3'
            sx={{
              fontWeight: 900,
              mb: 2.5,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              lineHeight: 1.05,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem', lg: '4.5rem' }
            }}
          >
            <Box component='span' sx={{ fontWeight: 900, display: 'block' }}>
              Citronics
            </Box>
            <Box
              component='span'
              sx={{
                fontWeight: 900,
                color: c.primary,
                display: 'block'
              }}
            >
              At a Glance
            </Box>
          </Typography>

          <Typography
            variant='body1'
            sx={{
              color: c.textSecondary,
              maxWidth: 540,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '0.95rem', md: '1.1rem' }
            }}
          >
            Three days of knowledge, competition, and celebration.{' '}
            Built by students, for students.
          </Typography>
        </MotionBox>

        {/* ── Bento grid ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(6, 1fr)', md: 'repeat(12, 1fr)' },
            gap: { xs: 2, md: 2.5 },
            gridAutoRows: { xs: 'auto', md: 'minmax(160px, auto)' }
          }}
        >
          {safeStats.map((stat, i) => (
            <Box
              key={stat.label}
              sx={{
                gridColumn: BENTO_LAYOUT[i]?.gridColumn || 'span 6',
                gridRow: BENTO_LAYOUT[i]?.gridRow || 'auto'
              }}
            >
              <StatCard stat={stat} index={i} started={inView} layout={BENTO_LAYOUT[i]} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
