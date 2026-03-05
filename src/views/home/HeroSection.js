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
export default function HeroSection() {
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
      const targetDate = new Date('2026-04-07T09:00:00')
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
        /* xs: reduced from 24 — no top navbar on mobile any more */
        pt: { xs: 4, md: 16 },
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

          {/* ── Logo ────────────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
            <Box
              component='img'
              src='/logo/citronics2.png'
              alt='Citronics Logo'
              sx={{
                width: { xs: '70vw', sm: '50vw', md: '38vw', lg: '32vw' },
                maxWidth: 600,
                minWidth: 220,
                height: 'auto',
                objectFit: 'contain',
                filter: isDark ? 'drop-shadow(0 0 40px rgba(255,255,255,0.08))' : 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.03)' }
              }}
            />
          </MotionBox>

          {/* ── Tagline ──────────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2rem', lg: '2.4rem' },
                lineHeight: 1.3,
                background: c.gradientTriple,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                maxWidth: 800,
                mx: 'auto',
                px: { xs: 2, md: 0 }
              }}
            >
              AI for Sustainable Tomorrow: Where Innovation Meets Sustainable Vision
            </Typography>
          </MotionBox>

          {/* ── Description paragraph ────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              sx={{
                color: heroTextMuted,
                fontWeight: 400,
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                lineHeight: 1.8,
                maxWidth: 680,
                mx: 'auto',
                px: { xs: 2, md: 0 }
              }}
            >
              The flagship annual techno-management fest — where talented minds collide
              across various domain, featuring 35 technical competitions, and 3 electrifying
              days of innovation.
            </Typography>
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
              href='/events'
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
              href='/about/about'
              startIcon={<Icon icon='tabler:info-circle' />}
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
              About Us
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
