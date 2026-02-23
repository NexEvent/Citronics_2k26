import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { EVENT_START_DATE, HERO_WORDS } from './mockData'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)

/* ── Animated grid background ─────────────────────────────────── */
function GridBackground() {
  const theme = useTheme()
  const primary = theme.palette.primary.main

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
          background: `radial-gradient(circle, ${alpha(primary, 0.12)} 0%, transparent 70%)`,
          top: '-20%',
          left: '-10%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          maxWidth: 700,
          maxHeight: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%)`,
          bottom: '-15%',
          right: '-10%',
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

/* ── Countdown digit ──────────────────────────────────────────── */
function CountDigit({ value, label }) {
  const theme = useTheme()

  return (
    <Box sx={{ textAlign: 'center', minWidth: { xs: 56, sm: 72 } }}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 56, sm: 72 },
          height: { xs: 56, sm: 72 },
          borderRadius: '16px',
          background: alpha(theme.palette.background.paper, 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          backdropFilter: 'blur(12px)',
          mb: 1
        }}
      >
        <AnimatePresence mode='popLayout'>
          <MotionTypography
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            variant='h4'
            sx={{
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: '#fff',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {String(value).padStart(2, '0')}
          </MotionTypography>
        </AnimatePresence>
      </Box>
      <Typography
        variant='caption'
        sx={{
          color: alpha('#fff', 0.5),
          textTransform: 'uppercase',
          letterSpacing: 2,
          fontWeight: 600,
          fontSize: '0.6rem'
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function CountSeparator() {
  const theme = useTheme()

  return (
    <MotionBox
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, pt: 2.5 }}
    >
      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.6) }} />
      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.6) }} />
    </MotionBox>
  )
}

/* ── Rotating word ────────────────────────────────────────────── */
function RotatingWord() {
  const theme = useTheme()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(prev => (prev + 1) % HERO_WORDS.length), 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <Box
      sx={{
        display: 'inline-block',
        position: 'relative',
        minWidth: { xs: 180, sm: 260, md: 340 },
        height: { xs: '3.2rem', sm: '4.2rem', md: '5.5rem' },
        overflow: 'hidden',
        verticalAlign: 'bottom'
      }}
    >
      <AnimatePresence mode='wait'>
        <MotionTypography
          key={HERO_WORDS[index]}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          component='span'
          sx={{
            position: 'absolute',
            left: 0,
            fontWeight: 900,
            fontSize: 'inherit',
            lineHeight: 'inherit',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, #a78bfa 100%)`,
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

/* ═══════════ HERO SECTION ═══════════════════════════════════════ */
export default function HeroSection() {
  const theme = useTheme()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = EVENT_START_DATE - Date.now()
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

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        size: Math.random() * 4 + 2,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
        color: alpha(
          i % 3 === 0 ? theme.palette.primary.main : i % 3 === 1 ? theme.palette.info.main : theme.palette.warning.main,
          0.4
        )
      })),
    [theme]
  )

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <Box
      id='hero'
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#0a0a12',
        pt: { xs: 10, md: 0 }
      }}
    >
      <GridBackground />
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(180deg, rgba(10,10,18,0.8) 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 2 }}>
        <MotionBox variants={stagger} initial='hidden' animate='visible' sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
          {/* Badge */}
          <MotionBox variants={fadeUp}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                px: 2.5,
                py: 0.8,
                borderRadius: '100px',
                background: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 4,
                backdropFilter: 'blur(8px)'
              }}
            >
              <MotionBox
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  boxShadow: `0 0 12px ${theme.palette.success.main}`
                }}
              />
              <Typography variant='caption' sx={{ color: alpha('#fff', 0.8), fontWeight: 600, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                MARCH 15 — 17, 2026 &nbsp;•&nbsp; GTU CAMPUS
              </Typography>
            </Box>
          </MotionBox>

          {/* Main title */}
          <MotionBox variants={fadeUp}>
            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4.2rem' },
                lineHeight: { xs: 1.15, md: 1.1 },
                letterSpacing: '-2px',
                color: '#fff',
                mb: 1
              }}
            >
              Experience
            </Typography>
          </MotionBox>
          <MotionBox variants={fadeUp}>
            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.8rem', sm: '3.8rem', md: '5.2rem' },
                lineHeight: 1,
                letterSpacing: '-3px',
                mb: 2
              }}
            >
              <Box
                component='span'
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 40%, #a78bfa 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CITRONICS
              </Box>{' '}
              <Box component='span' sx={{ color: alpha('#fff', 0.12), fontWeight: 300 }}>/</Box>{' '}
              <RotatingWord />
            </Typography>
          </MotionBox>

          {/* Subtitle */}
          <MotionBox variants={fadeUp}>
            <Typography
              variant='h6'
              sx={{
                color: alpha('#fff', 0.5),
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                mb: 5,
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              The flagship annual technical festival — where 2000+ minds collide across 5 departments, 24+ events, and 3 electrifying days of innovation.
            </Typography>
          </MotionBox>

          {/* CTAs */}
          <MotionBox variants={fadeUp} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 0 60px ${alpha(theme.palette.primary.main, 0.6)}, 0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                borderColor: alpha('#fff', 0.15),
                color: alpha('#fff', 0.8),
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  background: alpha(theme.palette.primary.main, 0.08),
                  color: '#fff'
                },
                transition: 'all 0.3s ease'
              }}
            >
              View Schedule
            </Button>
          </MotionBox>

          {/* Countdown */}
          <MotionBox variants={fadeUp}>
            <Typography
              variant='overline'
              sx={{ color: alpha('#fff', 0.3), letterSpacing: 3, mb: 2, display: 'block', fontSize: '0.65rem' }}
            >
              COUNTDOWN TO LAUNCH
            </Typography>
            <Stack direction='row' spacing={{ xs: 1, sm: 2 }} justifyContent='center' alignItems='flex-start'>
              <CountDigit value={timeLeft.days} label='Days' />
              <CountSeparator />
              <CountDigit value={timeLeft.hours} label='Hours' />
              <CountSeparator />
              <CountDigit value={timeLeft.minutes} label='Min' />
              <CountSeparator />
              <CountDigit value={timeLeft.seconds} label='Sec' />
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
            border: `2px solid ${alpha('#fff', 0.15)}`,
            display: 'flex',
            justifyContent: 'center',
            pt: 1
          }}
        >
          <MotionBox
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            sx={{ width: 3, height: 8, borderRadius: 2, bgcolor: alpha('#fff', 0.4) }}
          />
        </Box>
      </MotionBox>

      {/* Bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(0deg, ${theme.palette.background.default} 0%, transparent 100%)`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </Box>
  )
}
