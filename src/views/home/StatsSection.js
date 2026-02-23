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
      sx={{
        position: 'relative',
        p: 4,
        borderRadius: '24px',
        background: alpha(theme.palette.background.paper, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        backdropFilter: 'blur(16px)',
        textAlign: 'center',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.3)}`,
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 60px ${alpha(color, 0.1)}`
        }
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.06)}, transparent)`,
          top: -40,
          right: -40,
          pointerEvents: 'none'
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          background: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5
        }}
      >
        <Icon icon={stat.icon} fontSize={26} style={{ color }} />
      </Box>

      {/* Value */}
      <Typography
        variant='h3'
        sx={{
          fontWeight: 900,
          fontSize: { xs: '2.2rem', md: '2.8rem' },
          lineHeight: 1,
          mb: 0.5,
          color: theme.palette.text.primary,
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {count}
        <Box component='span' sx={{ color, fontSize: '0.7em' }}>{stat.suffix}</Box>
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
        background: theme.palette.background.default
      }}
    >
      <Container maxWidth='lg'>
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
              mb: 2.5
            }}
          >
            <Icon icon='tabler:chart-dots-3' fontSize={14} style={{ color: theme.palette.primary.main }} />
            <Typography variant='caption' sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1.5 }}>
              BY THE NUMBERS
            </Typography>
          </Box>
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Citronics at a Glance
          </Typography>
          <Typography variant='body1' sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
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
