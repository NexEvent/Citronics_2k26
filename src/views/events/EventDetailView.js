import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
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
 *  Countdown hook
 * ═════════════════════════════════════════════════════════════════════════ */
function useCountdown(targetIso) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    if (!targetIso) return
    const target = new Date(targetIso).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  return timeLeft
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Loading Skeleton
 * ═════════════════════════════════════════════════════════════════════════ */
function DetailSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '90vh' }}>
      <Box sx={{ width: { xs: '100%', md: '48%' }, p: 3 }}>
        <Skeleton variant='rectangular' sx={{ borderRadius: '20px', height: { xs: 300, md: '80vh' } }} />
      </Box>
      <Box sx={{ flex: 1, p: { xs: 3, md: 6 } }}>
        <Skeleton width='40%' height={20} sx={{ mb: 2 }} />
        <Skeleton width='70%' height={52} sx={{ mb: 1 }} />
        <Skeleton width='55%' height={28} sx={{ mb: 5 }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant='rectangular' height={90} sx={{ borderRadius: '14px', mb: 2 }} />
        ))}
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Info Section Box — label at top, value below (SILO style)
 * ═════════════════════════════════════════════════════════════════════════ */
function InfoSection({ label, value, children }) {
  const c = useAppPalette()
  return (
    <Box
      sx={{
        px: 3,
        py: 2.5,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: c.dividerA30,
        background: 'transparent',
        mb: 2
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: 'text.disabled',
          fontWeight: 700,
          fontSize: '0.68rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'block',
          mb: 0.75
        }}
      >
        {label}
      </Typography>
      {children || (
        <Typography
          variant='h6'
          sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, color: 'text.primary', lineHeight: 1.3 }}
        >
          {value}
        </Typography>
      )}
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Countdown Cell
 * ═════════════════════════════════════════════════════════════════════════ */
function CountCell({ value, label, textColor }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
      <Typography
        sx={{
          fontFamily: fontFamilyHeading,
          fontWeight: 800,
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          lineHeight: 1,
          color: textColor || 'text.primary'
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: textColor ? alpha(textColor, 0.65) : 'text.disabled',
          mt: 0.25
        }}
      >
        {label}
      </Typography>
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
  const { currentEvent: event, currentEventLoading: loading, currentEventError } = useSelector(state => state.events)
  const timeLeft = useCountdown(event?.start_time)

  useEffect(() => {
    if (id) dispatch(fetchEventById(id))
    return () => { dispatch(clearCurrentEvent()) }
  }, [dispatch, id])

  if (loading || !event) {
    if (currentEventError) {
      return (
        <Container maxWidth='xl' sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
          <Icon icon='tabler:alert-circle' fontSize={56} style={{ color: c.error }} />
          <Typography variant='h5' sx={{ mt: 3, fontWeight: 700 }}>Event Not Found</Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>
            The event you are looking for does not exist or has been removed.
          </Typography>
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' />}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
          >
            Back to Events
          </Button>
        </Container>
      )
    }
    return <DetailSkeleton />
  }

  const color = c.primary
  const fillPct = event.seats > 0 ? Math.round(((event.registered || 0) / event.seats) * 100) : 0
  const almostFull = fillPct >= 80
  const spotsLeft = event.seats - (event.registered || 0)
  const imageUrl = getEventImage(event)
  const isOver = event.start_time ? new Date(event.start_time).getTime() <= Date.now() : false

  return (
    <Box
      component='main'
      aria-label={`Event: ${event.title}`}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: { xs: '96px', md: '80px' } }}
    >
      {/* ── Main content ─────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start'
        }}
      >
        {/* ───── LEFT: Sticky Image Panel ───── */}
        <Box
          sx={{
            width: { xs: '100%', md: '38%' },
            position: { md: 'sticky' },
            top: { md: 98 },
            pt: { xs: 2.5, md: 3.5 },
            pb: { xs: 2.5, md: 3.5 },
            pl: { xs: 2.5, md: 2 },
            pr: { xs: 2.5, md: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: { md: 'flex-end' },
            gap: 2
          }}
        >
          {/* Back link (keyboard accessible) */}
          <Button
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
            sx={{
              justifyContent: 'flex-start',
              color: 'text.secondary',
              width: 'fit-content',
              alignSelf: 'flex-start',
              mb: 0.5,
              p: 0,
              minWidth: 0,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              '&:hover': { color: color }
            }}
          >
            All Events
          </Button>

          {/* Image */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: c.dividerA30,
              aspectRatio: '4 / 5',
              maxHeight: { md: '60vh' },
              bgcolor: alpha(color, 0.04)
            }}
          >
            {imageUrl ? (
              <Box
                component='img'
                src={imageUrl}
                alt={event.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon icon='tabler:calendar-event' fontSize={72} style={{ color: alpha(color, 0.25) }} />
              </Box>
            )}

            {/* Featured badge */}
            {event.featured && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  px: 2,
                  py: 0.5,
                  borderRadius: '100px',
                  background: alpha(color, 0.18),
                  border: '1px solid',
                  borderColor: alpha(color, 0.35),
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Typography
                  variant='caption'
                  sx={{ color, fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em' }}
                >
                  ★ FEATURED
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ───── RIGHT: Details Panel ───── */}
        <Box
          sx={{
            flex: 1,
            py: { xs: 3, md: 5 },
            px: { xs: 2.5, md: 4.5 },
            minWidth: 0
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Department chip */}
            {event.departmentName && (
              <Chip
                icon={<Icon icon='tabler:building' fontSize={13} />}
                label={event.departmentName}
                size='small'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  background: alpha(color, 0.08),
                  color,
                  border: '1px solid',
                  borderColor: alpha(color, 0.18),
                  '& .MuiChip-icon': { color }
                }}
              />
            )}

            {/* Title */}
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                fontSize: { xs: '2.2rem', md: '3rem' },
                lineHeight: 1.08,
                mb: 1.5,
                color: 'text.primary'
              }}
            >
              {event.title}
            </Typography>

            {/* Tagline */}
            {event.tagline && (
              <Typography
                variant='body1'
                sx={{
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                {event.tagline}
              </Typography>
            )}

            {/* ── Info card (single box, stacked rows) ── */}
            {(() => {
              const rows = []
              if (event.start_time) rows.push({ label: 'Date', value: formatDate(event.start_time) })
              if (event.start_time || event.end_time) {
                rows.push({
                  label: 'Time',
                  value: event.end_time
                    ? `${formatTime(event.start_time)} — ${formatTime(event.end_time)}`
                    : formatTime(event.start_time)
                })
              }
              if (event.venue) rows.push({ label: 'Venue', value: event.venue })
              if (event.prize) rows.push({ label: 'Prize Pool', value: event.prize })
              if (event.ticket_price > 0) rows.push({ label: 'Entry Fee', value: `₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}` })

              if (rows.length === 0) return null

              return (
                <Box
                  sx={{
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: c.dividerA30,
                    background: 'transparent',
                    mb: 2,
                    overflow: 'hidden',
                    maxWidth: { md: 420 }
                  }}
                >
                  {rows.map((row, i) => (
                    <Box
                      key={row.label}
                      sx={{
                        px: 3,
                        py: 2.25
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.disabled',
                          fontWeight: 700,
                          fontSize: '0.66rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          color: 'text.primary',
                          lineHeight: 1.3
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            })()}

            {/* ── Registration fill ── */}
            {event.seats > 0 && (
              <InfoSection label='Registration'>
                <Box sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {event.registered || 0} / {event.seats} registered
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 800, color: almostFull ? c.error : color }}
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
                          : `linear-gradient(90deg, ${color}, ${alpha(color, 0.55)})`
                      }
                    }}
                  />
                  {almostFull && (
                    <Typography
                      variant='caption'
                      sx={{ color: c.error, fontWeight: 700, mt: 0.75, display: 'block' }}
                    >
                      {spotsLeft <= 0 ? 'Sold Out!' : `Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left!`}
                    </Typography>
                  )}
                </Box>
              </InfoSection>
            )}

            {/* ── Description ── */}
            {event.description && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}
                >
                  About This Event
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.85,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {event.description}
                </Typography>
              </Box>
            )}

            {/* ── Tags ── */}
            {event.tags && event.tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}
                >
                  Tags
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
                        border: '1px solid',
                        borderColor: alpha(color, 0.15),
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </MotionBox>
        </Box>
      </Box>

      {/* ── Bottom Sticky CTA Bar ─────────────────────────────────── */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          bgcolor: color,
          backdropFilter: 'blur(20px)',
          px: { xs: 2, md: 5 },
          py: { xs: 2, md: 2.5 }
        }}
      >
        <Box
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, md: 3 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          {/* Countdown */}
          {!isOver ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
              <CountCell value={timeLeft.d} label='Days' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.h} label='Hrs' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.m} label='Min' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.s} label='Sec' textColor={c.bgPaper} />
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: c.bgPaper }}>
              Event Concluded
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          {/* See All Events */}
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderColor: c.bgPaper,
              color: c.bgPaper,
              px: 2.5,
              height: 44,
              '&:hover': {
                borderColor: c.bgPaper,
                color: c.bgPaper,
                bgcolor: alpha(c.bgPaper, 0.12)
              }
            }}
          >
            See All Events
          </Button>

          {/* Register */}
          <Button
            variant='outlined'
            disableElevation
            disabled={spotsLeft <= 0}
            sx={{
              borderRadius: '10px',
              fontFamily: fontFamilyHeading,
              fontWeight: 800,
              fontSize: '0.9rem',
              textTransform: 'none',
              px: { xs: 3, md: 5 },
              height: 44,
              borderColor: spotsLeft <= 0 ? c.dividerA30 : c.bgPaper,
              color: spotsLeft <= 0 ? c.textDisabled : color,
              bgcolor: spotsLeft <= 0 ? 'transparent' : c.bgPaper,
              '&:hover': {
                bgcolor: alpha(c.bgPaper, 0.88),
                borderColor: c.bgPaper
              },
              '&.Mui-disabled': {
                borderColor: c.dividerA30,
                color: c.textDisabled,
                bgcolor: 'transparent'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {spotsLeft <= 0 ? 'Sold Out' : 'Register Now'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
