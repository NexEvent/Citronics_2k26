import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha, useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { DEPARTMENTS, EVENTS } from './mockData'

const MotionBox = motion(Box)

function EventCard({ event, index }) {
  const theme = useTheme()
  const color = theme.palette[event.paletteKey]?.main || theme.palette.primary.main
  const fillPct = Math.round((event.registered / event.seats) * 100)
  const almostFull = fillPct >= 80

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: '20px',
        background: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: `0 24px 64px ${alpha(color, 0.12)}`,
          transform: 'translateY(-6px)'
        }
      }}
    >
      {/* Accent bar */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
          opacity: 0.8
        }}
      />

      {/* Featured badge */}
      {event.featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            px: 1.5,
            py: 0.4,
            borderRadius: '100px',
            background: alpha(color, 0.12),
            border: `1px solid ${alpha(color, 0.25)}`
          }}
        >
          <Typography variant='caption' sx={{ color, fontWeight: 700, fontSize: '0.6rem', letterSpacing: 0.5 }}>
            FEATURED
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: alpha(color, 0.1),
              border: `1px solid ${alpha(color, 0.15)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon
              icon={
                event.paletteKey === 'primary' ? 'tabler:cpu'
                : event.paletteKey === 'info' ? 'tabler:circuit-board'
                : event.paletteKey === 'warning' ? 'tabler:settings-2'
                : event.paletteKey === 'success' ? 'tabler:building-bridge'
                : 'tabler:chart-bar'
              }
              fontSize={22}
              style={{ color }}
            />
          </Box>
          <Box sx={{ flexGrow: 1, pr: event.featured ? 7 : 0 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.3 }}>
              {event.title}
            </Typography>
            <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
              {event.tagline}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {event.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size='small'
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                background: alpha(color, 0.08),
                color,
                border: `1px solid ${alpha(color, 0.15)}`,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          ))}
        </Box>

        {/* Meta */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2.5, flexGrow: 1 }}>
          {[
            { icon: 'tabler:calendar', text: `${event.date} • ${event.time}` },
            { icon: 'tabler:map-pin', text: event.venue },
            { icon: 'tabler:trophy', text: `Prize: ${event.prize}` }
          ].map(({ icon, text }) => (
            <Box key={icon} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon={icon} fontSize={14} style={{ color: theme.palette.text.disabled }} />
              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Registration bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant='caption' sx={{ color: theme.palette.text.disabled, fontSize: '0.7rem' }}>
              {event.registered}/{event.seats} registered
            </Typography>
            {almostFull && (
              <Typography variant='caption' sx={{ fontWeight: 700, color: theme.palette.warning.main, fontSize: '0.65rem' }}>
                Almost Full
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant='determinate'
            value={fillPct}
            sx={{
              height: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.divider, 0.3),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: almostFull
                  ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`
                  : `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`
              }
            }}
          />
        </Box>
      </Box>
    </MotionBox>
  )
}

export default function EventsSection() {
  const theme = useTheme()
  const [activeDept, setActiveDept] = useState('all')

  const filtered = activeDept === 'all' ? EVENTS : EVENTS.filter(e => e.dept === activeDept)
  const activeDeptData = DEPARTMENTS.find(d => d.id === activeDept)
  const activeColor = activeDeptData ? (theme.palette[activeDeptData.paletteKey]?.main || theme.palette.primary.main) : theme.palette.primary.main

  return (
    <Box
      id='events'
      sx={{
        py: { xs: 10, md: 16 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.015)} 50%, ${theme.palette.background.default} 100%)`
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
              background: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              mb: 2.5
            }}
          >
            <Icon icon='tabler:calendar-event' fontSize={14} style={{ color: theme.palette.primary.main }} />
            <Typography variant='caption' sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1.5 }}>
              EVENTS 2026
            </Typography>
          </Box>
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Explore All Events
          </Typography>
          <Typography variant='body1' sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            From hackathons to robotics battles — there is something for every techie. Filter by department below.
          </Typography>
        </MotionBox>

        {/* Department filters */}
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          sx={{ mb: 5 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {DEPARTMENTS.map(dept => {
              const dColor = theme.palette[dept.paletteKey]?.main || theme.palette.primary.main
              const isActive = activeDept === dept.id

              return (
                <Button
                  key={dept.id}
                  onClick={() => setActiveDept(dept.id)}
                  startIcon={<Icon icon={dept.icon} fontSize={16} />}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: '12px',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    color: isActive ? dColor : theme.palette.text.secondary,
                    background: isActive ? alpha(dColor, 0.1) : 'transparent',
                    border: `1px solid ${isActive ? alpha(dColor, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: alpha(dColor, 0.08),
                      color: dColor,
                      borderColor: alpha(dColor, 0.3)
                    }
                  }}
                >
                  {dept.label}
                </Button>
              )
            })}
          </Box>
        </MotionBox>

        {/* Events grid */}
        <AnimatePresence mode='wait'>
          <MotionBox key={activeDept} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Grid container spacing={3}>
              {filtered.map((event, i) => (
                <Grid item xs={12} sm={6} lg={4} key={event.id}>
                  <EventCard event={event} index={i} />
                </Grid>
              ))}
              {filtered.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Icon icon='tabler:calendar-off' fontSize={48} style={{ color: theme.palette.text.disabled }} />
                    <Typography variant='body1' sx={{ color: theme.palette.text.disabled, mt: 2 }}>
                      No events found for this department.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </MotionBox>
        </AnimatePresence>

        {/* Count */}
        <MotionBox
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{ mt: 5, textAlign: 'center' }}
        >
          <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
            Showing <strong style={{ color: activeColor }}>{filtered.length}</strong> event{filtered.length !== 1 ? 's' : ''}
            {activeDept !== 'all' && ` in ${activeDeptData?.label}`}
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  )
}
