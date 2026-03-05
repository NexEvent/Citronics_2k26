import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)

/* ═══════════════════════════════════════════════════════════════════════════
   Animated visual mini-components for each bento card
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. Events counter — pulsing "30+" that scales ────────────────────── */
function EventsVisual() {
  const c = useAppPalette()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => (prev === 1 ? 1.35 : 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <MotionBox
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        sx={{ textAlign: 'center' }}
      >
        <Typography
          sx={{
            fontFamily: 'serif',
            fontSize: { xs: '3.5rem', md: '5rem' },
            fontWeight: 500,
            color: c.textPrimary,
            lineHeight: 1
          }}
        >
          30+
        </Typography>
      </MotionBox>
    </Box>
  )
}

/* ── 2. Departments — animated layout blocks ──────────────────────────── */
function DepartmentsVisual() {
  const c = useAppPalette()
  const [layout, setLayout] = useState(0)
  const layouts = [2, 3, 5]

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout(prev => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MotionBox
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layouts[layout]}, 1fr)`,
          gap: '6px',
          width: '100%',
          maxWidth: 160
        }}
      >
        {Array.from({ length: layouts[layout] }).map((_, i) => (
          <MotionBox
            key={i}
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              height: 24,
              borderRadius: '6px',
              bgcolor: alpha(c.textPrimary, 0.15)
            }}
          />
        ))}
      </MotionBox>
    </Box>
  )
}

/* ── 3. Participants — speed-indicator style load ─────────────────────── */
function ParticipantsVisual() {
  const c = useAppPalette()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2
      }}
    >
      <Box sx={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', width: '100%' }}>
        <AnimatePresence mode='wait'>
          {loading ? (
            <MotionBox
              key='loader'
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, repeat: Infinity }}
              sx={{ height: 36, width: 100, bgcolor: alpha(c.textPrimary, 0.1), borderRadius: 1 }}
            />
          ) : (
            <MotionTypography
              key='text'
              initial={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 500, color: c.textPrimary }}
            >
              2000+
            </MotionTypography>
          )}
        </AnimatePresence>
      </Box>
      <Typography variant='caption' sx={{ color: c.textSecondary }}>
        Registered
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 120, height: 6, bgcolor: alpha(c.textPrimary, 0.08), borderRadius: 3, overflow: 'hidden' }}>
        <MotionBox
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 1 }}
          sx={{ height: '100%', bgcolor: c.textPrimary, borderRadius: 3 }}
        />
      </Box>
    </Box>
  )
}

/* ── 4. Prize Pool — trophy shields activating ────────────────────────── */
function PrizeVisual() {
  const c = useAppPalette()
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setShields(prev => {
        const nextIndex = prev.findIndex(s => !s.active)
        if (nextIndex === -1) return prev.map(() => ({ id: Math.random(), active: false }))
        return prev.map((s, i) => (i === nextIndex ? { ...s, active: true } : s))
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
      {shields.map(shield => (
        <MotionBox
          key={shield.id}
          animate={{ scale: shield.active ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          sx={{
            width: 48,
            height: 48,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: shield.active ? alpha(c.textPrimary, 0.15) : alpha(c.textPrimary, 0.04)
          }}
        >
          <Icon
            icon='tabler:trophy'
            fontSize={22}
            style={{ color: shield.active ? c.textPrimary : c.textDisabled }}
          />
        </MotionBox>
      ))}
    </Box>
  )
}

/* ── 5. Workshops — expanding pulse rings ─────────────────────────────── */
function WorkshopsVisual() {
  const c = useAppPalette()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
      <Icon icon='tabler:tools' fontSize={48} style={{ color: alpha(c.textPrimary, 0.8), zIndex: 10, position: 'relative' }} />
      {[0, 1, 2, 3, 4].map(pulse => (
        <MotionBox
          key={pulse}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, delay: pulse * 0.8, ease: 'easeOut' }}
          sx={{
            position: 'absolute',
            width: 48,
            height: 48,
            border: `2px solid ${alpha(c.textPrimary, 0.2)}`,
            borderRadius: '50%'
          }}
        />
      ))}
    </Box>
  )
}

/* ── 6. Sponsors — static icon (mobile-ready feel) ───────────────────── */
function SponsorsVisual() {
  const c = useAppPalette()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Icon icon='tabler:heart-handshake' fontSize={64} style={{ color: c.textPrimary }} />
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Card wrapper — shared glass tile used by every bento cell
   ═══════════════════════════════════════════════════════════════════════════ */
function BentoCard({ index, gridColumn, gridRow, title, description, icon, children }) {
  const c = useAppPalette()
  const isTall = typeof gridRow === 'object' || (typeof gridRow === 'string' && gridRow.includes('2'))

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale: isTall ? 1.02 : 0.98,
        ...(isTall && { boxShadow: `0 25px 50px ${alpha(c.textPrimary, 0.08)}` })
      }}
      sx={{
        gridColumn,
        gridRow,
        bgcolor: c.isDark ? alpha(c.bgPaper, 0.06) : alpha(c.bgPaper, 0.85),
        border: `1px solid ${c.dividerA30}`,
        borderRadius: '16px',
        p: { xs: 3, md: isTall ? 4 : 3.5 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease',
        '&:hover': {
          borderColor: c.dividerA50
        }
      }}
    >
      {/* Animated visual */}
      <Box sx={{ flex: 1, minHeight: { xs: 100, md: isTall ? 'auto' : 80 } }}>
        {children}
      </Box>

      {/* Label area */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && <Icon icon={icon} fontSize={20} style={{ color: c.textPrimary }} />}
          <Typography
            sx={{
              fontFamily: 'serif',
              fontSize: '1.15rem',
              fontWeight: 500,
              color: c.textPrimary
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography variant='body2' sx={{ color: c.textSecondary, mt: 0.5, fontSize: '0.82rem' }}>
          {description}
        </Typography>
      </Box>
    </MotionBox>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stats Section — Bento Grid (21st.dev style)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function StatsSection() {
  const c = useAppPalette()

  return (
    <Box
      id='stats'
      component='section'
      sx={{ py: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden' }}
    >
      <Container maxWidth='xl'>
        {/* ── Section heading ────────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              mb: 2,
              borderRadius: '100px',
              bgcolor: alpha(c.primary, 0.08),
              border: `1px solid ${alpha(c.primary, 0.15)}`
            }}
          >
            <Icon icon='tabler:chart-bar' fontSize={14} style={{ color: c.primary }} />
            <Typography variant='caption' sx={{ color: c.primary, fontWeight: 600, letterSpacing: 1.5 }}>
              BY THE NUMBERS
            </Typography>
          </Box>

          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
            }}
          >
            Citronics at a Glance
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: c.textSecondary, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}
          >
            A snapshot of what makes Citronics one of the most anticipated tech fests — the events, the people, and the prizes.
          </Typography>
        </MotionBox>

        {/* ── Bento Grid ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' },
            gap: 2,
            gridAutoRows: { xs: 'auto', md: '200px' }
          }}
        >
          {/* Card 1 — Events (tall 2×2) */}
          <BentoCard
            index={0}
            gridColumn={{ xs: '1', md: 'span 2' }}
            gridRow={{ xs: 'auto', md: 'span 2' }}
            title='Events'
            description='30+ technical and non-technical competitions spanning three action-packed days.'
          >
            <EventsVisual />
          </BentoCard>

          {/* Card 2 — Departments (standard 2×1) */}
          <BentoCard
            index={1}
            gridColumn={{ xs: '1', md: 'span 2' }}
            gridRow='auto'
            title='Departments'
            description='14 departments driving innovation.'
          >
            <DepartmentsVisual />
          </BentoCard>

       

          {/* Card 4 — Participants (standard 2×1) */}
          <BentoCard
            index={3}
            gridColumn={{ xs: '1', md: 'span 2' }}
            gridRow='auto'
            title='Participants'
            description='Students from across the country.'
          >
            <ParticipantsVisual />
          </BentoCard>

          {/* Card 5 — Prize Pool (wide 3×1) */}
          <BentoCard
            index={4}
            gridColumn={{ xs: '1', md: 'span 3' }}
            gridRow='auto'
            title='Prize Pool'
            description='₹2 Lakh+ in prizes, trophies, medals, and certificates for winners.'
            icon='tabler:trophy'
          >
            <PrizeVisual />
          </BentoCard>

          {/* Card 6 — Sponsors (wide 3×1) */}
          <BentoCard
            index={5}
            gridColumn={{ xs: '1', md: 'span 3' }}
            gridRow='auto'
            title='Sponsors & Partners'
            description='Backed by leading tech companies and academic institutions.'
            icon='tabler:heart-handshake'
          >
            <SponsorsVisual />
          </BentoCard>
        </Box>
      </Container>
    </Box>
  )
}
