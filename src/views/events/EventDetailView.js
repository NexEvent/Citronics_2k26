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
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { fetchEventById, clearCurrentEvent } from 'src/store/slices/eventsSlice'
import { addToCart } from 'src/store/slices/cartSlice'
import { useSession } from 'next-auth/react'
import { setCheckoutItems, setExistingUser, openStudentDialog } from 'src/store/slices/checkoutSlice'
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
  const { data: session } = useSession()
  const { id } = router.query
  const { currentEvent: event, currentEventLoading: loading, currentEventError } = useSelector(state => state.events)
  const timeLeft = useCountdown(event?.start_time)
  const isMobile = useMediaQuery(c.theme.breakpoints.down('md'))

  useEffect(() => {
    if (id) dispatch(fetchEventById(id))
    return () => { dispatch(clearCurrentEvent()) }
  }, [dispatch, id])

  if (loading) return <DetailSkeleton />

  if (currentEventError || !event) {
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

  const color = c.primary
  const seats = Number(event.seats || 0)
  const registered = Number(event.registered || 0)
  const fillPct = seats > 0 ? Math.round((registered / seats) * 100) : 0
  const almostFull = fillPct >= 80
  const spotsLeft = Math.max(0, seats - registered)
  const imageUrl = getEventImage(event)
  const isOver = event.start_time ? new Date(event.start_time).getTime() <= Date.now() : false

  return (
    <Box
      component='main'
      aria-label={`Event: ${event.title}`}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', md: '80px' } }}
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
              /* ~30% shorter on mobile while keeping desktop as-is */
              aspectRatio: { xs: '8 / 7', md: '4 / 5' },
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

          {/* ── Prize Pool (below image, fills left panel space) — desktop only ── */}
          {event.prize && typeof event.prize === 'object' && (
            <MotionBox
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              sx={{ width: '100%', display: { xs: 'none', md: 'block' } }}
            >
              
              <Box
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: alpha(color, 0.2),
                  background: alpha(color, 0.03),
                  overflow: 'hidden',
                  pb: 2.5
                }}
              >
                {event.prize.total != null && (
                  <Box sx={{ textAlign: 'center', pt: 3, pb: 1.5, px: 2 }}>
                    <Typography
                      sx={{
                        fontFamily: fontFamilyHeading,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        fontWeight: 900,
                        lineHeight: 1,
                        color,
                        letterSpacing: '-1px'
                      }}
                    >
                      ₹{Number(event.prize.total).toLocaleString('en-IN')}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        mt: 0.5,
                        display: 'block',
                        fontWeight: 700,
                        fontSize: '0.66rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'text.disabled'
                      }}
                    >
                      Total Prize Pool
                    </Typography>
                  </Box>
                )}
                {Array.isArray(event.prize.breakdown) && event.prize.breakdown.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      px: 2,
                      pt: 1
                    }}
                  >
                    {event.prize.breakdown.map((item, idx) => {
                      const medals = ['🥇', '🥈', '🥉']
                      const medal = medals[idx] || '🏅'
                      return (
                        <Box
                          key={idx}
                          sx={{
                            textAlign: 'center',
                            flex: '1 1 0',
                            minWidth: 72,
                            px: 1.5,
                            py: 1.75,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: alpha(color, 0.12),
                            background: alpha(color, idx === 0 ? 0.07 : 0.02),
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 16px ${alpha(color, 0.12)}`
                            }
                          }}
                        >
                          <Typography sx={{ fontSize: '1.3rem', lineHeight: 1, mb: 0.5 }}>
                            {medal}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: fontFamilyHeading,
                              fontWeight: 800,
                              fontSize: { xs: '1rem', md: '1.15rem' },
                              color: 'text.primary',
                              lineHeight: 1.1
                            }}
                          >
                            ₹{Number(item.amount).toLocaleString('en-IN')}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              mt: 0.4,
                              display: 'block',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: 'text.secondary'
                            }}
                          >
                            {item.position}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            </MotionBox>
          )}
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

            {/* ── Info card (2-column grid) ── */}
            {(() => {
              const cells = []
              if (event.start_time) cells.push({ label: 'Date', value: formatDate(event.start_time), icon: 'tabler:calendar' })
              if (event.start_time || event.end_time) {
                cells.push({
                  label: 'Time',
                  value: event.end_time
                    ? `${formatTime(event.start_time)} — ${formatTime(event.end_time)}`
                    : formatTime(event.start_time),
                  icon: 'tabler:clock'
                })
              }
              if (event.venue) cells.push({ label: 'Venue', value: event.venue, icon: 'tabler:map-pin' })
              if (event.ticket_price > 0) cells.push({ label: 'Entry Fee', value: `₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}`, icon: 'tabler:ticket' })

              if (cells.length === 0) return null

              return (
                <Box
                  sx={{
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: c.dividerA30,
                    background: 'transparent',
                    mb: 2,
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr'
                  }}
                >
                  {cells.map((cell, i) => (
                    <Box
                      key={cell.label}
                      sx={{
                        px: 2.5,
                        py: 2.25,
                        borderRight: i % 2 === 0 ? '1px solid' : 'none',
                        borderBottom: i < cells.length - 2 ? '1px solid' : 'none',
                        borderColor: c.dividerA30,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                        <Icon icon={cell.icon} fontSize={13} style={{ color: alpha(color, 0.55), flexShrink: 0 }} />
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.disabled',
                            fontWeight: 700,
                            fontSize: '0.64rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            lineHeight: 1
                          }}
                        >
                          {cell.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.92rem', md: '0.98rem' },
                          color: 'text.primary',
                          lineHeight: 1.3
                        }}
                      >
                        {cell.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            })()}

            

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

            {/* ── Brief ── */}
            {event.brief && (
              <Box sx={{ mt: 3.5 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}
                >
                  Brief
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
                  {event.brief}
                </Typography>
              </Box>
            )}

            {/* ── Prize Pool — mobile only (shown after Brief) ── */}
            {event.prize && typeof event.prize === 'object' && (
              <Box sx={{ mt: 4, display: { xs: 'block', md: 'none' } }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}
                >
                  Prize Pool
                </Typography>
                <Box
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: alpha(color, 0.2),
                    background: alpha(color, 0.03),
                    overflow: 'hidden',
                    pb: 2.5
                  }}
                >
                  {event.prize.total != null && (
                    <Box sx={{ textAlign: 'center', pt: 3, pb: 1.5, px: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: fontFamilyHeading,
                          fontSize: '2rem',
                          fontWeight: 900,
                          lineHeight: 1,
                          color,
                          letterSpacing: '-1px'
                        }}
                      >
                        ₹{Number(event.prize.total).toLocaleString('en-IN')}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          mt: 0.5,
                          display: 'block',
                          fontWeight: 700,
                          fontSize: '0.66rem',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'text.disabled'
                        }}
                      >
                        Total Prize Pool
                      </Typography>
                    </Box>
                  )}
                  {Array.isArray(event.prize.breakdown) && event.prize.breakdown.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, px: 2, pb: 0.5, pt: 1 }}>
                      {event.prize.breakdown.map((item, idx) => {
                        const medals = ['🥇', '🥈', '🥉']
                        const medal = medals[idx] || '🏅'
                        return (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              px: 2,
                              py: 1.5,
                              borderRadius: '12px',
                              border: '1px solid',
                              borderColor: alpha(color, 0.12),
                              background: alpha(color, idx === 0 ? 0.07 : 0.02)
                            }}
                          >
                            <Typography sx={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>
                              {medal}
                            </Typography>
                            <Typography
                              variant='caption'
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'text.secondary',
                                flex: 1
                              }}
                            >
                              {item.position}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: fontFamilyHeading,
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                color: 'text.primary',
                                lineHeight: 1
                              }}
                            >
                              ₹{Number(item.amount).toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                        )
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Team Size ── */}
            {event.team_size && (
              <Box sx={{ mt: 3.5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 2,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: alpha(color, 0.18),
                    background: alpha(color, 0.04)
                  }}
                >
                  <Icon icon='tabler:users-group' fontSize={22} style={{ color }} />
                  <Box>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.disabled',
                        fontWeight: 700,
                        fontSize: '0.66rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 0.25
                      }}
                    >
                      Team Size
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
                      {event.team_size}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════
                 Rounds — Accordion / Collapsible cards
               ══════════════════════════════════════════════════════════ */}
            {Array.isArray(event.rounds) && event.rounds.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 2, display: 'block' }}
                >
                  Rounds
                </Typography>
                {event.rounds.map((round, idx) => (
                  <Accordion
                    key={idx}
                    defaultExpanded={idx === 0}
                    disableGutters
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      borderRadius: '14px !important',
                      border: '1px solid',
                      borderColor: alpha(color, 0.15),
                      background: 'transparent',
                      overflow: 'hidden',
                      '&::before': { display: 'none' },
                      '&.Mui-expanded': {
                        borderColor: alpha(color, 0.3),
                        background: alpha(color, 0.02)
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<Icon icon='tabler:chevron-down' fontSize={20} style={{ color }} />}
                      sx={{
                        px: 3,
                        py: 0.5,
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 1.5 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: alpha(color, 0.1),
                            flexShrink: 0
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color }}>
                            {idx + 1}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                          {round.title}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                      {Array.isArray(round.points) && round.points.length > 0 && (
                        <Box component='ul' sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}>
                          {round.points.map((point, pIdx) => (
                            <Box
                              component='li'
                              key={pIdx}
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.9rem',
                                lineHeight: 1.8,
                                '&::marker': { color: alpha(color, 0.5) }
                              }}
                            >
                              {point}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════
                 Rules — Clean bullet list
               ══════════════════════════════════════════════════════════ */}
            {Array.isArray(event.rules) && event.rules.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 2, display: 'block' }}
                >
                  Rules & Guidelines
                </Typography>
                <Box
                  sx={{
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: c.dividerA30,
                    px: 3,
                    py: 2.5
                  }}
                >
                  <Box component='ul' sx={{ m: 0, pl: 2, listStyleType: 'none' }}>
                    {event.rules.map((rule, idx) => (
                      <Box
                        component='li'
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          py: 1,
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          lineHeight: 1.75,
                          borderBottom: idx < event.rules.length - 1 ? '1px solid' : 'none',
                          borderColor: c.dividerA30
                        }}
                      >
                        <Box
                          sx={{
                            mt: '3px',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: alpha(color, 0.5),
                            flexShrink: 0
                          }}
                        />
                        <Typography variant='body2' sx={{ lineHeight: 1.75, color: 'text.secondary' }}>
                          {rule}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════
                 View Brochure — Cloudinary PDF
               ══════════════════════════════════════════════════════════ */}
            {event.document_url && (
              <Box sx={{ mt: 4 }}>
                <Button
                  variant='outlined'
                  href={event.document_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  startIcon={<Icon icon='tabler:file-description' fontSize={20} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    px: 3,
                    py: 1.5,
                    borderColor: alpha(color, 0.35),
                    color,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: color,
                      bgcolor: alpha(color, 0.06),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 16px ${alpha(color, 0.15)}`
                    }
                  }}
                >
                  View Full Brochure
                </Button>
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

            {/* ── Mobile inline action buttons ── */}
            {isMobile && (
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant='contained'
                  disableElevation
                  fullWidth
                  disabled={spotsLeft <= 0}
                  onClick={() => {
                    dispatch(setCheckoutItems({
                      items: [{ eventId: event.id, quantity: 1 }],
                      source: 'buyNow'
                    }))
                    if (session?.user?.id) {
                      dispatch(setExistingUser({ userId: session.user.id }))
                      router.push('/checkout')
                    } else {
                      dispatch(openStudentDialog())
                    }
                  }}
                  sx={{
                    bgcolor: color,
                    color: c.white,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { bgcolor: alpha(color, 0.88) },
                    '&.Mui-disabled': { bgcolor: c.dividerA30, color: c.textDisabled }
                  }}
                >
                  {spotsLeft <= 0 ? 'Sold Out' : 'Buy Now'}
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  disabled={spotsLeft <= 0}
                  onClick={() => dispatch(addToCart({
                    eventId: event.id,
                    title: event.title,
                    ticketPrice: event.ticket_price || 0,
                    quantity: 1,
                    image: getEventImage(event),
                    startTime: event.start_time,
                    venue: event.venue,
                    maxAvailable: spotsLeft > 0 ? spotsLeft : 0
                  }))}
                  startIcon={<Icon icon='tabler:shopping-cart-plus' fontSize={18} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    py: 1.35,
                    borderColor: alpha(color, 0.4),
                    color,
                    '&:hover': { borderColor: color, bgcolor: alpha(color, 0.06) },
                    '&.Mui-disabled': { borderColor: c.dividerA30, color: c.textDisabled }
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => router.push('/events')}
                  startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    py: 1.35,
                    borderColor: c.dividerA30,
                    color: c.textSecondary,
                    '&:hover': { borderColor: color, color, bgcolor: alpha(color, 0.04) }
                  }}
                >
                  See All Events
                </Button>
              </Box>
            )}
          </MotionBox>
        </Box>
      </Box>

      {/* ── Bottom Sticky CTA Bar — Desktop only ─────────────────────── */}
      {!isMobile && (
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

          {/* Add to Cart */}
          <Button
            variant='outlined'
            disableElevation
            disabled={spotsLeft <= 0}
            onClick={() => dispatch(addToCart({
              eventId: event.id,
              title: event.title,
              ticketPrice: event.ticket_price || 0,
              quantity: 1,
              image: getEventImage(event),
              startTime: event.start_time,
              venue: event.venue,
              maxAvailable: spotsLeft > 0 ? spotsLeft : 0
            }))}
            startIcon={<Icon icon='tabler:shopping-cart-plus' fontSize={18} />}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2.5,
              height: 44,
              borderColor: c.bgPaper,
              color: c.bgPaper,
              '&:hover': {
                borderColor: c.bgPaper,
                color: c.bgPaper,
                bgcolor: alpha(c.bgPaper, 0.12)
              },
              '&.Mui-disabled': {
                borderColor: c.dividerA30,
                color: c.textDisabled
              }
            }}
          >
            Add to Cart
          </Button>

          {/* Buy Now */}
          <Button
            variant='outlined'
            disableElevation
            disabled={spotsLeft <= 0}
            onClick={() => {
              dispatch(setCheckoutItems({
                items: [{ eventId: event.id, quantity: 1 }],
                source: 'buyNow'
              }))
              if (session?.user?.id) {
                dispatch(setExistingUser({ userId: session.user.id }))
                router.push('/checkout')
              } else {
                dispatch(openStudentDialog())
              }
            }}
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
            {spotsLeft <= 0 ? 'Sold Out' : 'Buy Now'}
          </Button>
        </Box>
      </Box>
      )}
    </Box>
  )
}
