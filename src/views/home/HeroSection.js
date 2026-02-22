import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { EVENT_START_DATE } from './mockData'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)

// ── Floating shape component ──────────────────────────────────────────────────
function FloatingBlob({ size, color, top, left, delay, duration }) {
  return (
    <MotionBox
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.08, 1],
        opacity: [0.15, 0.25, 0.15]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(60px)',
        top,
        left,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}

// ── Orbiting ring icon ────────────────────────────────────────────────────────
function OrbitIcon({ icon, radius, angle, color, size = 44, duration = 20, delay = 0 }) {
  return (
    <MotionBox
      animate={{ rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      sx={{
        position: 'absolute',
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        top: '50%',
        left: '50%',
        marginTop: -radius,
        marginLeft: -radius,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <MotionBox
        animate={{ rotate: -360 }}
        transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
        sx={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '12px',
          background: alpha(color, 0.15),
          border: `1px solid ${alpha(color, 0.3)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: Math.sin((angle * Math.PI) / 180) * radius + radius - size / 2,
          left: Math.cos((angle * Math.PI) / 180) * radius + radius - size / 2,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Icon icon={icon} fontSize={22} style={{ color }} />
      </MotionBox>
    </MotionBox>
  )
}

// ── Countdown unit ────────────────────────────────────────────────────────────
function CountUnit({ value, label, color }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant='h3'
        sx={{
          fontWeight: 700,
          lineHeight: 1,
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 56,
          display: 'inline-block'
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </Box>
  )
}

// ── Countdown separator ───────────────────────────────────────────────────────
function Sep({ color }) {
  return (
    <Typography variant='h4' sx={{ color: alpha(color, 0.6), fontWeight: 700, mb: 1 }}>
      :
    </Typography>
  )
}

export default function HeroSection() {
  const theme = useTheme()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = EVENT_START_DATE - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
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

  const blobProps = [
    { size: 500, color: `radial-gradient(circle, ${theme.palette.primary.main}, transparent)`, top: '-10%', left: '-5%', delay: 0, duration: 12 },
    { size: 400, color: `radial-gradient(circle, ${theme.palette.info.main}, transparent)`, top: '40%', left: '60%', delay: 2, duration: 15 },
    { size: 350, color: `radial-gradient(circle, ${theme.palette.warning.main}, transparent)`, top: '70%', left: '-8%', delay: 4, duration: 10 }
  ]

  const orbitIcons = [
    { icon: 'tabler:cpu', angle: 0, radius: 190, color: theme.palette.primary.main, delay: 0, duration: 25 },
    { icon: 'tabler:circuit-board', angle: 72, radius: 180, color: theme.palette.info.main, delay: 0, duration: 25 },
    { icon: 'tabler:settings-2', angle: 144, radius: 195, color: theme.palette.warning.main, delay: 0, duration: 25 },
    { icon: 'tabler:building-bridge', angle: 216, radius: 185, color: theme.palette.success.main, delay: 0, duration: 25 },
    { icon: 'tabler:chart-bar', angle: 288, radius: 192, color: theme.palette.error.main, delay: 0, duration: 25 }
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
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
        background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 40%, ${alpha(theme.palette.info.main, 0.04)} 100%)`
      }}
    >
      {/* Background blobs */}
      {blobProps.map((p, i) => (
        <FloatingBlob key={i} {...p} />
      ))}

      {/* Dot grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          zIndex: 0
        }}
      />

      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, md: 0 } }}>
        <Grid container spacing={4} alignItems='center' justifyContent='center'>
          {/* Left content */}
          <Grid item xs={12} md={6}>
            <MotionBox
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              {/* Badge */}
              <MotionBox variants={itemVariants}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    borderRadius: '100px',
                    background: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: theme.palette.success.main,
                      boxShadow: `0 0 6px ${theme.palette.success.main}`
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1 }}
                  >
                    MARCH 15–17, 2026
                  </Typography>
                </Box>
              </MotionBox>

              {/* Title */}
              <MotionTypography
                variants={itemVariants}
                variant='h1'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-1px',
                  mb: 1
                }}
              >
                Welcome to{' '}
              </MotionTypography>
              <MotionTypography
                variants={itemVariants}
                variant='h1'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                  lineHeight: 1,
                  letterSpacing: '-2px',
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 60%, ${theme.palette.primary.light} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CITRONICS
              </MotionTypography>

              <MotionTypography
                variants={itemVariants}
                variant='h5'
                sx={{ color: theme.palette.text.secondary, fontWeight: 400, mb: 4, maxWidth: 440, lineHeight: 1.6 }}
              >
                The Annual Technical Extravaganza — 5 Departments. 24+ Events. Endless Possibilities.
              </MotionTypography>

              {/* CTA Buttons */}
              <MotionBox variants={itemVariants} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
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
                    px: 3.5,
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': { boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.55)}` }
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
                    px: 3.5,
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  View Schedule
                </Button>
              </MotionBox>

              {/* Countdown */}
              <MotionBox variants={itemVariants}>
                <Typography
                  variant='overline'
                  sx={{ color: theme.palette.text.secondary, letterSpacing: 2, mb: 1, display: 'block' }}
                >
                  Event Starts In
                </Typography>
                <Stack direction='row' spacing={1} alignItems='flex-start'>
                  <CountUnit value={timeLeft.days} label='Days' color={theme.palette.primary.main} />
                  <Sep color={theme.palette.primary.main} />
                  <CountUnit value={timeLeft.hours} label='Hrs' color={theme.palette.info.main} />
                  <Sep color={theme.palette.info.main} />
                  <CountUnit value={timeLeft.minutes} label='Min' color={theme.palette.warning.main} />
                  <Sep color={theme.palette.warning.main} />
                  <CountUnit value={timeLeft.seconds} label='Sec' color={theme.palette.success.main} />
                </Stack>
              </MotionBox>
            </MotionBox>
          </Grid>

          {/* Right orb visual */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              sx={{ position: 'relative', width: 440, height: 440 }}
            >
              {/* Outer ring */}
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              />
              {/* Middle ring */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 40,
                  borderRadius: '50%',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              />

              {/* Orbiting icons */}
              {orbitIcons.map((o, i) => (
                <OrbitIcon key={i} {...o} />
              ))}

              {/* Center orb */}
              <MotionBox
                animate={{
                  boxShadow: [
                    `0 0 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                    `0 0 80px ${alpha(theme.palette.primary.main, 0.5)}`,
                    `0 0 40px ${alpha(theme.palette.primary.main, 0.3)}`
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.info.main, 0.9)})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  zIndex: 2
                }}
              >
                <Icon icon='tabler:bolt' fontSize={40} style={{ color: '#fff' }} />
                <Typography
                  variant='caption'
                  sx={{ color: alpha('#fff', 0.9), fontWeight: 700, letterSpacing: 2, fontSize: '0.55rem' }}
                >
                  CITRONICS
                </Typography>
              </MotionBox>
            </MotionBox>
          </Grid>
        </Grid>

        {/* Scroll cue */}
        <MotionBox
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Typography variant='caption' sx={{ color: theme.palette.text.disabled, letterSpacing: 1 }}>
            SCROLL
          </Typography>
          <Icon icon='tabler:chevron-down' style={{ color: theme.palette.text.disabled }} />
        </MotionBox>
      </Container>
    </Box>
  )
}
