import { useRef, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion, useInView } from 'framer-motion'
import Icon from 'src/components/Icon'
import { STATS } from './mockData'

const MotionBox = motion(Box)

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])
  return count
}

// ── Single stat card ──────────────────────────────────────────────────────────
function StatCard({ stat, index, started }) {
  const theme = useTheme()
  const count = useCounter(stat.value, 1600 + index * 100, started)
  const color = theme.palette[stat.paletteKey]?.main || theme.palette.primary.main

  return (
    <MotionBox
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      sx={{
        p: 3.5,
        borderRadius: '20px',
        background: alpha(theme.palette.background.paper, 0.7),
        border: `1px solid ${alpha(color, 0.15)}`,
        backdropFilter: 'blur(16px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${alpha(color, 0)}, ${color}, ${alpha(color, 0)})`,
          opacity: 0.8
        }
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha(color, 0.08),
          filter: 'blur(30px)',
          top: -20,
          right: -20,
          pointerEvents: 'none'
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          background: alpha(color, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          border: `1px solid ${alpha(color, 0.2)}`
        }}
      >
        <Icon icon={stat.icon} fontSize={28} style={{ color }} />
      </Box>

      {/* Value */}
      <Typography
        variant='h3'
        sx={{
          fontWeight: 800,
          fontSize: { xs: '2.2rem', md: '2.6rem' },
          lineHeight: 1,
          mb: 0.5,
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {count}
        {stat.suffix}
      </Typography>

      <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
        {stat.label}
      </Typography>
    </MotionBox>
  )
}

export default function StatsSection() {
  const theme = useTheme()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <Box
      id='stats'
      ref={ref}
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.02)} 50%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Container maxWidth='lg'>
        {/* Section header */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              mb: 2
            }}
          >
            <Icon icon='tabler:star' fontSize={14} style={{ color: theme.palette.primary.main }} />
            <Typography variant='caption' sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1.5 }}>
              BY THE NUMBERS
            </Typography>
          </Box>
          <Typography
            variant='h3'
            sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}
          >
            Citronics at a Glance
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto' }}
          >
            Three days of knowledge, competition, and celebration. Built by students, for students.
          </Typography>
        </MotionBox>

        <Grid container spacing={3}>
          {STATS.map((stat, i) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <StatCard stat={stat} index={i} started={inView} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
