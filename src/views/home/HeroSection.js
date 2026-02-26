import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)

/* ── Animated grid background ─────────────────────────────────── */
function GridBackground() {
  const c = useAppPalette()
  const primary = c.primary

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha(primary, 0.06)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(primary, 0.06)} 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '60vw',
          height: '60vw',
          maxWidth: 900,
          maxHeight: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.primaryA12} 0%, transparent 70%)`,
          top: '-20%',
          left: '-10%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />

    </Box>
  )
}

/* ── Floating particle  ───────────────────────────────────────── */
function Particle({ size, x, y, delay, duration, color }) {
  return (
    <MotionBox
      animate={{ y: [0, -40, 0], opacity: [0, 0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        top: y,
        left: x,
        pointerEvents: 'none',
        zIndex: 0,
        filter: `blur(${size > 4 ? 1 : 0}px)`
      }}
    />
  )
}

/* ── 21st.dev-style Countdown Card ────────────────────────────── */
function CountCard({ value, label }) {
  const c = useAppPalette()
  const isDark = c.isDark

  const cardBg = isDark ? c.bgPaperA12 : c.bgPaperA70
  const borderCol = isDark ? c.primaryA20 : c.primaryA15
  const numColor = c.textPrimary
  const labelColor = c.textSecondaryA70

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      {/* Card */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 72, sm: 88, md: 100 },
          height: { xs: 80, sm: 96, md: 108 },
          borderRadius: '20px',
          background: cardBg,
          border: `1px solid ${borderCol}`,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 4px 24px ${isDark ? c.primaryA8 : alpha(c.primary, 0.05)},
                      inset 0 1px 0 ${alpha(c.white, isDark ? 0.05 : 0.6)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${c.primaryA40}, transparent)`
          },
          /* Divider line across middle */
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: c.dividerA40
          }
        }}
      >
        <AnimatePresence mode='popLayout'>
          <MotionTypography
            key={value}
            initial={{ y: 12, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: numColor,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1,
              fontFamily: '"Inter", "SF Mono", monospace',
              position: 'relative',
              zIndex: 1
            }}
          >
            {String(value).padStart(2, '0')}
          </MotionTypography>
        </AnimatePresence>
      </Box>
      {/* Label */}
      <Typography
        sx={{
          color: labelColor,
          textTransform: 'uppercase',
          letterSpacing: 2.5,
          fontWeight: 600,
          fontSize: { xs: '0.6rem', sm: '0.65rem' }
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function CountColon() {
  const c = useAppPalette()

  return (
    <MotionBox
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pt: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 0.5, sm: 1 }
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: c.primary
        }}
      />
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: c.primary
        }}
      />
    </MotionBox>
  )
}

/* ── Rotating word ────────────────────────────────────────────── */
function RotatingWord({ words: HERO_WORDS = [] }) {
  const c = useAppPalette()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (HERO_WORDS.length === 0) return
    setIndex(0)
    const id = setInterval(() => setIndex(prev => (prev + 1) % HERO_WORDS.length), 2800)
    return () => clearInterval(id)
  }, [HERO_WORDS])

  return (
    <Box
      sx={{
        display: 'block',
        position: 'relative',
        width: '100%',
        height: { xs: '6rem', sm: '9rem', md: '12rem', lg: '14rem' },
        overflow: 'hidden'
      }}
    >
      <AnimatePresence mode='wait'>
        <MotionTypography
          key={HERO_WORDS[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          component='span'
          sx={{
            display: 'block',
            fontWeight: 900,
            fontSize: 'inherit',
            lineHeight: 1.15,
            letterSpacing: 'inherit',
            textTransform: 'inherit',
            background: c.gradientTriple,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap'
          }}
        >
          {HERO_WORDS[index]}
        </MotionTypography>
      </AnimatePresence>
    </Box>
  )
}

/* ── Circular starburst badge (NasSummit-style) ───────────────── */
function StarburstBadge({ text, size = 120, color }) {
  const c = useAppPalette()
  const badgeColor = color || c.primary

  return (
    <MotionBox
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      sx={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0
      }}
    >
      {/* Starburst SVG */}
      <Box
        component='svg'
        viewBox='0 0 100 100'
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path
          d={(() => {
            const cx = 50, cy = 50, points = 24, outer = 48, inner = 40
            const pts = []
            for (let i = 0; i < points * 2; i++) {
              const angle = (Math.PI * i) / points - Math.PI / 2
              const r = i % 2 === 0 ? outer : inner
              pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
            }
            return `M${pts.join('L')}Z`
          })()}
          fill={badgeColor}
          opacity='0.85'
        />
      </Box>
      {/* Badge text — counter-rotates to stay readable */}
      <MotionBox
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Typography
          sx={{
            color: c.primaryContrast,
            fontWeight: 800,
            fontSize: size * 0.12,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            px: 1
          }}
        >
          {text}
        </Typography>
      </MotionBox>
    </MotionBox>
  )
}

/* ═══════════ HERO SECTION ═══════════════════════════════════════ */
export default function HeroSection({ heroWords: HERO_WORDS = [], eventStartDate }) {
  const c = useAppPalette()
  const isDark = c.isDark
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [particles, setParticles] = useState([])

  /* ── Theme-aware color helpers ──────────────────────────────── */
  const heroText = c.heroText
  const heroTextMuted = alpha(heroText, 0.5)
  const heroTextSoft = alpha(heroText, 0.8)
  const heroBorder = alpha(heroText, isDark ? 0.08 : 0.1)
  const heroOverlayEnd = c.heroOverlayEnd
  const imageBg = c.heroImageBg

  useEffect(() => {
    const tick = () => {
      const targetDate = eventStartDate ? new Date(eventStartDate) : new Date('2026-03-15T09:00:00')
      const diff = targetDate - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Particles are generated client-side only to avoid SSR/client Math.random() mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        size: Math.random() * 4 + 2,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
        color: alpha(
          i % 3 === 0 ? c.primary : i % 3 === 1 ? c.info : c.warning,
          0.4
        )
      }))
    )
  }, [c.primary, c.info, c.warning])

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }
  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <Box
      component='section'
      id='hero'
      aria-label='Hero'
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        pt: { xs: 24, md: 28 },
        pb: { xs: 6, md: 10 }
      }}
    >
      <GridBackground />
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Top fade */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 120,
          background: `linear-gradient(180deg, ${c.bgDefaultA40} 0%, transparent 100%)`,
          zIndex: 1, pointerEvents: 'none'
        }}
      />

      <Container maxWidth='xl' sx={{ position: 'relative', zIndex: 2 }}>
        <MotionBox variants={stagger} initial='hidden' animate='visible'>

          {/* ── Row 1: "THE" + paragraph ─────────────────────────────── */}
          <MotionBox variants={fadeUp}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'flex-end' },
                gap: { xs: 2, md: 6 },
                mb: { xs: 1, md: 0.5 }
              }}
            >
              <Typography
                variant='h1'
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '9.5rem' },
                  lineHeight: 0.9,
                  letterSpacing: '-4px',
                  color: heroText,
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}
              >
                THE
              </Typography>
              <Typography
                sx={{
                  color: heroTextMuted,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.7,
                  maxWidth: { xs: '100%', md: 340 },
                  pb: { md: 2 }
                }}
              >
                The flagship annual technical festival — where 2000+ minds collide
                across 5 departments, 24+ events, and 3 electrifying days of innovation.
              </Typography>
            </Box>
          </MotionBox>

          {/* ── Row 2: Icon + "CITRONICS" ────────────────────────────── */}
          <MotionBox variants={fadeUp}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, mb: { xs: 0, md: -1 } }}>
              {/* Checkmark icon */}
              <Box
                sx={{
                  width: { xs: 48, sm: 64, md: 80 },
                  height: { xs: 48, sm: 64, md: 80 },
                  borderRadius: '16px',
                  background: c.gradientPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 40px ${c.primaryA40}`
                }}
              >
                <Icon icon='tabler:heart-filled' style={{ color: c.primaryContrast, fontSize: 36 }} />
              </Box>
              <Typography
                variant='h1'
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3.5rem', sm: '5.5rem', md: '8rem', lg: '9.5rem' },
                  lineHeight: 0.95,
                  letterSpacing: '-4px',
                  textTransform: 'uppercase',
                  background: c.gradientTriple,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CITRONICS
              </Typography>
            </Box>
          </MotionBox>

          {/* ── Row 3: Rotating word (massive) ───────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ mb: { xs: 4, md: 5 } }}>
            <Box
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3.8rem', sm: '5.8rem', md: '8rem', lg: '9.5rem' },
                lineHeight: 1.15,
                letterSpacing: '-4px',
                textTransform: 'uppercase',
                color: heroText
              }}
            >
              <RotatingWord words={HERO_WORDS} />
            </Box>
          </MotionBox>

          {/* ── Hero image with starburst badges ─────────────────────── */}
          <MotionBox variants={fadeIn} sx={{ position: 'relative', mb: { xs: 5, md: 7 } }}>


            {/* Image container with rounded corners */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: { xs: 220, sm: 320, md: 420 },
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${heroBorder}`,
                bgcolor: imageBg
              }}
            >
              {/* Placeholder gradient (replace src with actual event image) */}
              <Box
                component='img'
                src='/imagesB.jpg'
                alt='Citronics Technical Fest'
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isDark ? 'brightness(0.7) contrast(1.1)' : 'brightness(0.85) contrast(1.05)',
                  transition: 'transform 0.6s ease',
                  '&:hover': { transform: 'scale(1.03)' }
                }}
              />

              {/* Gradient overlay on image */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, ${c.primaryA10} 0%, transparent 50%)`
                }}
              />
            </Box>

            {/* Starburst badge — bottom-right */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: -20, md: -30 },
                right: { xs: 16, md: 40 },
                zIndex: 3
              }}
            >
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <StarburstBadge text='JOIN THE FEST' size={90} color={c.primary} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <StarburstBadge text='JOIN THE FEST' size={130} color={c.primary} />
              </Box>
            </Box>

            {/* Starburst badge — top-left accent */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: -16, md: -24 },
                left: { xs: 12, md: 32 },
                zIndex: 3,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              <StarburstBadge
                text='2026'
                size={80}
                color={c.info}
              />
            </Box>
          </MotionBox>

          {/* ── CTAs ────────────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: { xs: 6, md: 8 } }}>
            <Button
              variant='contained'
              size='large'
              href='#events'
              onClick={e => {
                e.preventDefault()
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
              }}
              endIcon={<Icon icon='tabler:arrow-right' />}
              sx={{
                px: 4,
                py: 1.8,
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                background: c.gradientPrimary,
                boxShadow: `0 0 40px ${c.primaryA50}, 0 8px 32px ${c.primaryA30}`,
                '&:hover': {
                  boxShadow: `0 0 60px ${c.primaryA60}, 0 12px 40px ${c.primaryA40}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Explore Events
            </Button>
            <Button
              variant='outlined'
              size='large'
              href='#schedule'
              onClick={e => {
                e.preventDefault()
                document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' })
              }}
              startIcon={<Icon icon='tabler:calendar' />}
              sx={{
                px: 4,
                py: 1.8,
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: alpha(heroText, 0.15),
                color: heroTextSoft,
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: c.primaryA50,
                  background: c.primaryA8,
                  color: heroText
                },
                transition: 'all 0.3s ease'
              }}
            >
              View Schedule
            </Button>
          </MotionBox>

          {/* ── Countdown (21st.dev style) ────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant='overline'
              sx={{
                color: c.textSecondaryA60,
                letterSpacing: 4,
                mb: 3,
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              COUNTDOWN TO LAUNCH
            </Typography>
            <Stack
              direction='row'
              justifyContent='center'
              alignItems='flex-start'
              sx={{ gap: { xs: 0.5, sm: 1.5, md: 2 } }}
            >
              <CountCard value={timeLeft.days} label='Days' />
              <CountColon />
              <CountCard value={timeLeft.hours} label='Hours' />
              <CountColon />
              <CountCard value={timeLeft.minutes} label='Min' />
              <CountColon />
              <CountCard value={timeLeft.seconds} label='Sec' />
            </Stack>
          </MotionBox>

        </MotionBox>
      </Container>

      {/* Scroll indicator */}
      <MotionBox
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          bottom: { xs: 20, md: 40 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          zIndex: 2
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 40,
            borderRadius: '12px',
            border: `2px solid ${alpha(heroText, 0.15)}`,
            display: 'flex',
            justifyContent: 'center',
            pt: 1
          }}
        >
          <MotionBox
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            sx={{ width: 3, height: 8, borderRadius: 2, bgcolor: alpha(heroText, 0.4) }}
          />
        </Box>
      </MotionBox>

      {/* Bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 200,
          background: `linear-gradient(0deg, transparent 0%, transparent 100%)`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </Box>
  )
}
