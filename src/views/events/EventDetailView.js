import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { fetchEventById, clearCurrentEvent } from 'src/store/slices/eventsSlice'
import { fontFamilyHeading } from 'src/theme/typography'

const MotionBox = motion(Box)

/* ═══════════════════════════════════════════════════════════════════════════
 *  Helpers
 * ═════════════════════════════════════════════════════════════════════════ */

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function getEventImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Loading Skeleton
 * ═════════════════════════════════════════════════════════════════════════ */

function DetailSkeleton() {
  const c = useAppPalette()

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 4, md: 8 } }}>
      <Skeleton variant='rectangular' height={360} sx={{ borderRadius: 4, mb: 4 }} />
      <Skeleton width='60%' height={48} sx={{ mb: 2 }} />
      <Skeleton width='40%' height={24} sx={{ mb: 4 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Container>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Info Row — reusable icon + label + value row
 * ═════════════════════════════════════════════════════════════════════════ */

function InfoRow({ icon, label, value, color }) {
  const c = useAppPalette()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          background: alpha(color || c.primary, 0.1),
          border: `1px solid ${alpha(color || c.primary, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon icon={icon} fontSize={20} style={{ color: color || c.primary }} />
      </Box>
      <Box>
        <Typography variant='caption' sx={{ color: c.textDisabled, fontSize: '0.7rem', fontWeight: 600, letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 600, color: c.textPrimary }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Event Detail View
 * ═════════════════════════════════════════════════════════════════════════ */

export default function EventDetailView() {
  const c = useAppPalette()
  const router = useRouter()
  const dispatch = useDispatch()
  const { id } = router.query
  const { currentEvent: event, currentEventLoading: loading, error } = useSelector(state => state.events)

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id))
    }

    return () => {
      dispatch(clearCurrentEvent())
    }
  }, [dispatch, id])

  // Loading state
  if (loading || !event) {
    if (error) {
      return (
        <Container maxWidth='lg' sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
          <Icon icon='tabler:alert-circle' fontSize={56} style={{ color: c.error }} />
          <Typography variant='h5' sx={{ mt: 3, fontWeight: 700 }}>
            Event Not Found
          </Typography>
          <Typography variant='body1' sx={{ color: c.textSecondary, mt: 1, mb: 4 }}>
            The event you are looking for does not exist or has been removed.
          </Typography>
          <Button
            variant='contained'
            onClick={() => router.push('/events')}
            sx={{
              borderRadius: '10px',
              fontFamily: fontFamilyHeading,
              fontWeight: 700,
              textTransform: 'none',
              background: c.gradientPrimary,
              px: 4
            }}
          >
            Back to Events
          </Button>
        </Container>
      )
    }

    return <DetailSkeleton />
  }

  const color = c.primary
  const fillPct = event.seats > 0 ? Math.round((event.registered / event.seats) * 100) : 0
  const almostFull = fillPct >= 80
  const spotsLeft = event.seats - (event.registered || 0)
  const imageUrl = getEventImage(event)
  const fallbackIcon = 'tabler:calendar-event'

  return (
    <Box component='main' aria-label={`Event: ${event.title}`}>
      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 260, sm: 340, md: 420 },
          overflow: 'hidden'
        }}
      >
        {imageUrl ? (
          <Box
            component='img'
            src={imageUrl}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon={fallbackIcon} fontSize={80} style={{ color: alpha(color, 0.3) }} />
          </Box>
        )}

        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 30%, ${c.bgDefaultA92} 100%)`
          }}
        />

        {/* Back button */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 24 },
            left: { xs: 16, md: 32 },
            zIndex: 2
          }}
        >
          <Button
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={18} />}
            sx={{
              borderRadius: '10px',
              fontFamily: fontFamilyHeading,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              backdropFilter: 'blur(12px)',
              background: c.bgPaperA60,
              border: `1px solid ${c.dividerA30}`,
              color: c.textPrimary,
              px: 2,
              '&:hover': {
                background: c.bgPaperA80,
                borderColor: c.dividerA50
              }
            }}
          >
            All Events
          </Button>
        </MotionBox>

        {/* Featured badge */}
        {event.featured && (
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 24 },
              right: { xs: 16, md: 32 },
              zIndex: 2,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: alpha(color, 0.15),
              border: `1px solid ${alpha(color, 0.3)}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <Typography variant='caption' sx={{ color, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 1 }}>
              ★ FEATURED
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <Container maxWidth='lg' sx={{ mt: -6, position: 'relative', zIndex: 2, pb: { xs: 6, md: 10 } }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Department chip */}
          {event.departmentName && (
            <Chip
              icon={<Icon icon='tabler:building' fontSize={14} />}
              label={event.departmentName}
              size='small'
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: '0.75rem',
                background: alpha(color, 0.1),
                color,
                border: `1px solid ${alpha(color, 0.2)}`,
                '& .MuiChip-icon': { color }
              }}
            />
          )}

          {/* Title */}
          <Typography
            variant='h3'
            component='h1'
            sx={{
              fontFamily: fontFamilyHeading,
              fontWeight: 900,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              mb: 1,
              color: c.textPrimary
            }}
          >
            {event.title}
          </Typography>

          {/* Tagline */}
          {event.tagline && (
            <Typography
              variant='h6'
              sx={{
                fontWeight: 400,
                fontStyle: 'italic',
                color: c.textSecondary,
                mb: 4,
                letterSpacing: '0.3px'
              }}
            >
              {event.tagline}
            </Typography>
          )}

          <Grid container spacing={4}>
            {/* ── Left Column: Description + Tags ── */}
            <Grid item xs={12} md={8}>
              {/* Description */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '20px',
                  background: c.bgPaperA60,
                  border: `1px solid ${c.dividerA30}`,
                  backdropFilter: 'blur(12px)',
                  mb: 3
                }}
              >
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: 2, mb: 2, display: 'block' }}
                >
                  About This Event
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: c.textSecondary,
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {event.description || 'No description available for this event.'}
                </Typography>
              </MotionBox>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '20px',
                    background: c.bgPaperA60,
                    border: `1px solid ${c.dividerA30}`,
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <Typography
                    variant='overline'
                    sx={{ color, fontWeight: 700, letterSpacing: 2, mb: 2, display: 'block' }}
                  >
                    Tags & Topics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {event.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size='small'
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          background: alpha(color, 0.08),
                          color,
                          border: `1px solid ${alpha(color, 0.15)}`,
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                    ))}
                  </Box>
                </MotionBox>
              )}
            </Grid>

            {/* ── Right Column: Info Sidebar ── */}
            <Grid item xs={12} md={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '20px',
                  background: c.bgPaperA60,
                  border: `1px solid ${c.dividerA30}`,
                  backdropFilter: 'blur(12px)',
                  position: { md: 'sticky' },
                  top: { md: 100 }
                }}
              >
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
                >
                  Event Details
                </Typography>

                <InfoRow
                  icon='tabler:calendar'
                  label='DATE'
                  value={formatDate(event.start_time)}
                  color={color}
                />
                <InfoRow
                  icon='tabler:clock'
                  label='TIME'
                  value={`${formatTime(event.start_time)} — ${formatTime(event.end_time)}`}
                  color={color}
                />
                <InfoRow
                  icon='tabler:map-pin'
                  label='VENUE'
                  value={event.venue || 'TBA'}
                  color={color}
                />
                {event.prize && (
                  <InfoRow
                    icon='tabler:trophy'
                    label='PRIZE POOL'
                    value={event.prize}
                    color={color}
                  />
                )}
                {event.ticket_price > 0 && (
                  <InfoRow
                    icon='tabler:ticket'
                    label='ENTRY FEE'
                    value={`₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}`}
                    color={color}
                  />
                )}

                <Divider sx={{ my: 2, borderColor: c.dividerA30 }} />

                {/* Registration progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='caption' sx={{ color: c.textDisabled, fontWeight: 600 }}>
                      {event.registered || 0} / {event.seats} registered
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: almostFull ? c.error : color
                      }}
                    >
                      {fillPct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={fillPct}
                    sx={{
                      height: 6,
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
                  {almostFull && (
                    <Typography
                      variant='caption'
                      sx={{ color: c.error, fontWeight: 700, mt: 0.5, display: 'block' }}
                    >
                      {spotsLeft <= 0 ? 'Sold Out!' : `Only ${spotsLeft} spots left!`}
                    </Typography>
                  )}
                </Box>

                {/* Register CTA */}
                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  disabled={spotsLeft <= 0}
                  sx={{
                    borderRadius: '12px',
                    fontFamily: fontFamilyHeading,
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    py: 1.5,
                    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                    boxShadow: `0 6px 24px ${alpha(color, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 8px 32px ${alpha(color, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    '&.Mui-disabled': {
                      background: c.dividerA30,
                      color: c.textDisabled
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {spotsLeft <= 0 ? 'Sold Out' : 'Register Now'}
                </Button>
              </MotionBox>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  )
}
