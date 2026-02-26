import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/**
 * Renders a single event card in the home page events grid.
 * Shows fill percentage, department tag, and links to the event detail page.
 * @param {object} props
 * @param {object} props.event - Event data object from the home API
 * @param {number} props.index - Card index for staggered entrance animation
 */
function EventCard({ event, index }) {
  const c = useAppPalette()
  const color = c.theme.palette[event.paletteKey]?.main || c.primary
  const rawPct = (Number(event.seats) > 0) ? (Number(event.registered) / Number(event.seats)) * 100 : 0
  const fillPct = Math.min(100, Math.max(0, Math.round(rawPct) || 0))
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
        background: c.bgPaperA60,
        border: `1px solid ${c.dividerA50}`,
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
            <Typography variant='caption' sx={{ color: c.textSecondary }}>
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
              <Icon icon={icon} fontSize={14} style={{ color: c.textDisabled }} />
              <Typography variant='caption' sx={{ color: c.textSecondary }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Registration bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant='caption' sx={{ color: c.textDisabled, fontSize: '0.7rem' }}>
              {event.registered}/{event.seats} registered
            </Typography>
            {almostFull && (
              <Typography variant='caption' sx={{ fontWeight: 700, color: c.warning, fontSize: '0.65rem' }}>
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
              bgcolor: c.dividerA30,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: almostFull
                  ? `linear-gradient(90deg, ${c.warning}, ${c.error})`
                  : `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`
              }
            }}
          />
        </Box>
      </Box>
    </MotionBox>
  )
}

/**
 * Events grid section on the home page.
 * Supports department filtering with animated card transitions.
 * @param {object} props
 * @param {Array} [props.events=[]] - Array of event objects from the home API
 * @param {Array} [props.departments=[]] - Array of department objects for filter tabs
 */
export default function EventsSection({ events: EVENTS = [], departments: DEPARTMENTS = [] }) {
  const c = useAppPalette()
  const [activeDept, setActiveDept] = useState('all')

  const filtered = activeDept === 'all' ? EVENTS : EVENTS.filter(e => e.departmentId === activeDept)
  const activeDeptData = DEPARTMENTS.find(d => d.id === activeDept)
  const activeColor = c.primary

  return (
    <Box
      component='section'
      id='events'
      aria-label='Events'
      sx={{
        py: { xs: 10, md: 16 }
      }}
    >
      <Container maxWidth='xl'>
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
              background: c.primaryA8,
              border: `1px solid ${c.primaryA15}`,
              mb: 2.5
            }}
          >
            <Icon icon='tabler:calendar-event' fontSize={14} style={{ color: c.primary }} />
            <Typography variant='caption' sx={{ color: c.primary, fontWeight: 600, letterSpacing: 1.5 }}>
              EVENTS 2026
            </Typography>
          </Box>
          <Typography variant='h2' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Explore All Events
          </Typography>
          <Typography variant='body1' sx={{ color: c.textSecondary, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
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
            {/* "All" button */}
            <Button
              onClick={() => setActiveDept('all')}
              startIcon={<Icon icon='tabler:apps' fontSize={16} />}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: '12px',
                fontWeight: activeDept === 'all' ? 600 : 400,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                color: activeDept === 'all' ? c.primary : c.textSecondary,
                background: activeDept === 'all' ? alpha(c.primary, 0.1) : 'transparent',
                border: `1px solid ${activeDept === 'all' ? alpha(c.primary, 0.3) : c.dividerA50}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: alpha(c.primary, 0.08),
                  color: c.primary,
                  borderColor: alpha(c.primary, 0.3)
                }
              }}
            >
              All Events
            </Button>
            {DEPARTMENTS.map(dept => {
              const isActive = activeDept === dept.id

              return (
                <Button
                  key={dept.id}
                  onClick={() => setActiveDept(dept.id)}
                  startIcon={<Icon icon='tabler:building' fontSize={16} />}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: '12px',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    color: isActive ? c.primary : c.textSecondary,
                    background: isActive ? alpha(c.primary, 0.1) : 'transparent',
                    border: `1px solid ${isActive ? alpha(c.primary, 0.3) : c.dividerA50}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: alpha(c.primary, 0.08),
                      color: c.primary,
                      borderColor: alpha(c.primary, 0.3)
                    }
                  }}
                >
                  {dept.name}
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
                    <Icon icon='tabler:calendar-off' fontSize={48} style={{ color: c.textDisabled }} />
                    <Typography variant='body1' sx={{ color: c.textDisabled, mt: 2 }}>
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
          <Typography variant='body2' sx={{ color: c.textSecondary }}>
            Showing <strong style={{ color: activeColor }}>{filtered.length}</strong> event{filtered.length !== 1 ? 's' : ''}
            {activeDept !== 'all' && ` in ${activeDeptData?.name}`}
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  )
}
