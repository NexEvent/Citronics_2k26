import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { SCHEDULE_DAYS } from './mockData'

const MotionBox = motion(Box)

function TimelineEntry({ item, isLast, delay }) {
  const theme = useTheme()
  const color = theme.palette[item.paletteKey]?.main || theme.palette.primary.main

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: 'flex', gap: 2.5, pb: isLast ? 0 : 2.5 }}
    >
      {/* Timeline dot + line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: color,
            border: `3px solid ${alpha(color, 0.2)}`,
            boxShadow: `0 0 12px ${alpha(color, 0.4)}`,
            mt: 0.4,
            flexShrink: 0
          }}
        />
        {!isLast && (
          <Box
            sx={{
              width: 1.5,
              flexGrow: 1,
              background: `linear-gradient(${alpha(color, 0.25)}, ${alpha(theme.palette.divider, 0.1)})`,
              mt: 0.5
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', minWidth: 72, fontSize: '0.75rem' }}
          >
            {item.time}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: item.dept === 'all' ? 600 : 400, color: theme.palette.text.primary }}>
            {item.event}
          </Typography>
          {item.dept !== 'all' && (
            <Chip
              label={item.dept.toUpperCase()}
              size='small'
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: alpha(color, 0.1),
                color,
                border: `1px solid ${alpha(color, 0.15)}`,
                '& .MuiChip-label': { px: 0.8 }
              }}
            />
          )}
        </Box>
      </Box>
    </MotionBox>
  )
}

function DayCard({ day, index, isActive, onClick }) {
  const theme = useTheme()
  const colors = [theme.palette.primary.main, theme.palette.info.main, theme.palette.success.main]
  const color = colors[index % colors.length]

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        cursor: 'pointer',
        border: isActive ? `2px solid ${color}` : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: isActive ? alpha(color, 0.06) : alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(8px)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `2px solid ${alpha(color, 0.5)}`,
          background: alpha(color, 0.04)
        }
      }}
    >
      <Typography variant='overline' sx={{ color: isActive ? color : theme.palette.text.disabled, fontWeight: 700, letterSpacing: 2 }}>
        {day.day}
      </Typography>
      <Typography variant='h6' sx={{ fontWeight: 700, color: isActive ? color : theme.palette.text.primary, lineHeight: 1.2 }}>
        {day.date}
      </Typography>
      <Typography variant='caption' sx={{ color: isActive ? color : theme.palette.text.secondary, fontStyle: 'italic' }}>
        {day.theme}
      </Typography>
    </MotionBox>
  )
}

export default function ScheduleSection() {
  const theme = useTheme()
  const [activeDay, setActiveDay] = useState(0)
  const day = SCHEDULE_DAYS[activeDay]

  return (
    <Box
      id='schedule'
      sx={{
        py: { xs: 10, md: 16 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.info.main, 0.015)} 50%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Container maxWidth='lg'>
        {/* Section header */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              mb: 2.5
            }}
          >
            <Icon icon='tabler:clock' fontSize={14} style={{ color: theme.palette.info.main }} />
            <Typography variant='caption' sx={{ color: theme.palette.info.main, fontWeight: 600, letterSpacing: 1.5 }}>
              3-DAY AGENDA
            </Typography>
          </Box>
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Event Schedule
          </Typography>
          <Typography variant='body1' sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Three action-packed days of competitions, workshops, and unforgettable cultural nights.
          </Typography>
        </MotionBox>

        {/* Day selectors */}
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {SCHEDULE_DAYS.map((d, i) => (
            <Grid item xs={4} key={d.day}>
              <DayCard day={d} index={i} isActive={activeDay === i} onClick={() => setActiveDay(i)} />
            </Grid>
          ))}
        </Grid>

        {/* Timeline */}
        <MotionBox key={activeDay} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '24px',
              background: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              backdropFilter: 'blur(16px)',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            {/* Day header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <Icon icon='tabler:calendar-event' fontSize={24} style={{ color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {day.day} — {day.date}
                </Typography>
                <Typography variant='caption' sx={{ color: theme.palette.text.secondary, letterSpacing: 2 }}>
                  THEME: {day.theme.toUpperCase()}
                </Typography>
              </Box>
            </Box>

            {day.highlights.map((item, i) => (
              <TimelineEntry key={i} item={item} isLast={i === day.highlights.length - 1} delay={i * 0.07} />
            ))}
          </Box>
        </MotionBox>
      </Container>
    </Box>
  )
}
