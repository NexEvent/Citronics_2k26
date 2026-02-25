import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { fetchEvents, fetchCategories } from 'src/store/slices/eventsSlice'
import { fontFamilyHeading } from 'src/theme/typography'

const MotionBox = motion(Box)

/* ═══════════════════════════════════════════════════════════════════════════
 *  Constants
 * ═════════════════════════════════════════════════════════════════════════ */

const HERO_IMAGES = [
  '/images/image1.jpg',
  '/images/image2.jpg',
  '/images/image3.jpg'
]

const EVENTS_PER_PAGE = 5

/* ═══════════════════════════════════════════════════════════════════════════
 *  Hero Image Carousel
 * ═════════════════════════════════════════════════════════════════════════ */

function HeroCarousel() {
  const c = useAppPalette()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 280, sm: 380, md: 480 },
        overflow: 'hidden',
        borderRadius: { xs: 0, md: '0 0 24px 24px' }
      }}
    >
      {/* Images */}
      <AnimatePresence mode='wait'>
        <MotionBox
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HERO_IMAGES[current]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, ${c.bgDefaultA92} 100%)`,
          zIndex: 1
        }}
      />

      {/* Title overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          px: { xs: 3, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Typography
            variant='h2'
            sx={{
              fontFamily: fontFamilyHeading,
              fontWeight: 900,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              background: `linear-gradient(135deg, ${c.primaryLight}, ${c.info})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Events
          </Typography>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'text.disabled',
              letterSpacing: '0.5px'
            }}
          >
            Innovation & Technology at Citronics 2026
          </Typography>
        </MotionBox>
      </Box>

      {/* Dots indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 12, md: 20 },
          right: { xs: 16, md: 32 },
          zIndex: 3,
          display: 'flex',
          gap: 1
        }}
      >
        {HERO_IMAGES.map((_, i) => (
          <Box
            key={i}
            role='button'
            tabIndex={0}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrent(i) } }}
            sx={{
              width: i === current ? 28 : 10,
              height: 10,
              borderRadius: '100px',
              background:
                i === current
                  ? `linear-gradient(90deg, ${c.primary}, ${c.info})`
                  : c.whiteA25,
              cursor: 'pointer',
              transition: 'all 0.4s ease'
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Event Row Card (list style — with image placeholder)
 * ═════════════════════════════════════════════════════════════════════════ */

function EventRow({ event, index }) {
  const c = useAppPalette()
  const router = useRouter()
  const color = c.primary
  const fillPct = event.seats > 0 ? Math.round(((event.registered || 0) / event.seats) * 100) : 0
  const almostFull = fillPct >= 80
  const imageUrl = getEventImage(event)
  const fallbackIcon = 'tabler:calendar-event'

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: '14px',
        background: c.bgPaperA60,
        border: `1px solid ${c.dividerA30}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.25)}`,
          boxShadow: `0 8px 32px ${alpha(color, 0.08)}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Date block */}
      <Box sx={{ minWidth: 68, textAlign: 'center', flexShrink: 0, py: 0.5 }}>
        <Typography
          variant='caption'
          sx={{
            fontFamily: fontFamilyHeading,
            color: 'text.primary',
            fontWeight: 700,
            display: 'block',
            fontSize: '0.78rem'
          }}
        >
          {event.date.split(',')[0]}
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          {event.date.split(',')[1]?.trim()}
        </Typography>
      </Box>

      {/* Event image placeholder */}
      <Box
        sx={{
          width: { xs: '100%', sm: 100 },
          height: { xs: 140, sm: 72 },
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          background: alpha(color, 0.08),
          border: `1px solid ${alpha(color, 0.12)}`
        }}
      >
        {imageUrl ? (
          <Box
            component='img'
            src={imageUrl}
            alt={event.name || event.title}
            onError={e => {
              e.target.style.display = 'none'
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
            }}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
        {/* Fallback icon — shown when no image */}
        <Box
          sx={{
            display: imageUrl ? 'none' : 'flex',
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon={fallbackIcon} fontSize={28} style={{ color: alpha(color, 0.5) }} />
        </Box>
      </Box>

      {/* Event info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {almostFull && (
          <Chip
            label={fillPct >= 95 ? 'Almost Full!' : `${event.seats - (event.registered || 0)} Spots Left`}
            size='small'
            sx={{
              mb: 0.5,
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 700,
              background: c.errorA15,
              color: c.error,
              border: `1px solid ${c.errorA20}`
            }}
          />
        )}
        <Typography
          variant='subtitle1'
          sx={{
            fontFamily: fontFamilyHeading,
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.3,
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}
        >
          {event.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Icon icon='tabler:map-pin' fontSize={14} style={{ color: c.textSecondary }} />
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {event.venue}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>•</Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {event.time}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        <Button
          variant='contained'
          size='small'
          sx={{
            minWidth: 110,
            borderRadius: '8px',
            fontFamily: fontFamilyHeading,
            fontWeight: 700,
            fontSize: '0.78rem',
            textTransform: 'none',
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
            boxShadow: `0 4px 16px ${alpha(color, 0.25)}`,
            '&:hover': {
              boxShadow: `0 6px 24px ${alpha(color, 0.35)}`,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Register
        </Button>
        <Button
          variant='outlined'
          size='small'
          onClick={() => router.push(`/events/${event.id}`)}
          sx={{
            minWidth: 110,
            borderRadius: '8px',
            fontFamily: fontFamilyHeading,
            fontWeight: 600,
            fontSize: '0.78rem',
            textTransform: 'none',
            borderColor: c.dividerA30,
            color: 'text.secondary',
            '&:hover': {
              borderColor: alpha(color, 0.4),
              background: alpha(color, 0.06),
              color: 'text.primary'
            }
          }}
        >
          More Info
        </Button>
      </Box>
    </MotionBox>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Helpers
 * ═════════════════════════════════════════════════════════════════════════ */

function formatEventDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-IN', { weekday: 'short' })
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  return `${day}, ${dateStr}`
}

function formatEventTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
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

function EventRowSkeleton() {
  const c = useAppPalette()

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: '14px',
        background: c.bgPaperA60,
        border: `1px solid ${c.dividerA30}`
      }}
    >
      <Skeleton width={68} height={60} sx={{ borderRadius: '10px' }} />
      <Skeleton width={100} height={72} sx={{ borderRadius: '10px', display: { xs: 'none', sm: 'block' } }} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton width='60%' height={20} sx={{ mb: 1 }} />
        <Skeleton width='40%' height={16} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Skeleton width={110} height={34} sx={{ borderRadius: '8px' }} />
        <Skeleton width={110} height={34} sx={{ borderRadius: '8px' }} />
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Main View — EventsPageView
 * ═════════════════════════════════════════════════════════════════════════ */

export default function EventsPageView() {
  const c = useAppPalette()
  const dispatch = useDispatch()
  const { events, pagination, eventsLoading, categories } = useSelector(state => state.events)

  const [activeDept, setActiveDept] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch events when filters/page changes
  useEffect(() => {
    dispatch(
      fetchEvents({
        categorySlug: activeDept === 'all' ? undefined : activeDept,
        search: debouncedSearch,
        sort: sortOrder,
        page,
        limit: EVENTS_PER_PAGE
      })
    )
  }, [dispatch, activeDept, debouncedSearch, sortOrder, page])

  // Fetch categories on mount
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories())
    }
  }, [dispatch, categories])

  const handleDeptChange = useCallback(e => {
    setActiveDept(e.target.value)
    setPage(1)
  }, [])

  const handleSearch = useCallback(e => {
    setSearchQuery(e.target.value)
  }, [])

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: c.bgPaperA70,
      backdropFilter: 'blur(8px)',
      color: 'text.primary',
      fontFamily: fontFamilyHeading,
      fontSize: '0.88rem',
      '& fieldset': { borderColor: c.dividerA30 },
      '&:hover fieldset': { borderColor: c.dividerA60 },
      '&.Mui-focused fieldset': { borderColor: c.primaryA50 }
    },
    '& .MuiInputAdornment-root': { color: 'text.secondary' },
    '& .MuiSelect-icon': { color: 'text.secondary' }
  }

  const totalPages = pagination?.totalPages || 1

  return (
    <Box component='section' aria-label='Events'>
      {/* ── Hero carousel ──────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Filter bar: search + category dropdown + sort ──────────── */}
      <Container maxWidth='lg' sx={{ mt: { xs: 3, md: 5 }, mb: { xs: 2, md: 3 } }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}
        >
          {/* Search bar */}
          <TextField
            placeholder='Search Events'
            value={searchQuery}
            onChange={handleSearch}
            size='small'
            aria-label='Search events'
            sx={{ ...inputSx, flexGrow: 1, maxWidth: { sm: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:search' fontSize={18} />
                </InputAdornment>
              )
            }}
          />

          {/* Category dropdown */}
          <FormControl size='small' sx={{ minWidth: 180, ...inputSx }}>
            <Select
              value={activeDept}
              onChange={handleDeptChange}
              displayEmpty
              aria-label='Filter by category'
              sx={{ color: 'text.primary', '& .MuiSelect-select': { py: 1 } }}
            >
              <MenuItem value='all'>All Categories</MenuItem>
              {categories.filter(cat => cat.slug !== 'all').map(cat => (
                <MenuItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {/* Sort dropdown */}
          <FormControl size='small' sx={{ minWidth: 130, ...inputSx }}>
            <Select
              value={sortOrder}
              onChange={e => { setSortOrder(e.target.value); setPage(1) }}
              aria-label='Sort order'
              sx={{ color: 'text.primary', '& .MuiSelect-select': { py: 1 } }}
            >
              <MenuItem value='newest'>Newest</MenuItem>
              <MenuItem value='oldest'>Oldest</MenuItem>
              <MenuItem value='popular'>Most Popular</MenuItem>
            </Select>
          </FormControl>
        </MotionBox>
      </Container>

      {/* ── Events list ────────────────────────────────────────────── */}
      <Container maxWidth='lg' sx={{ py: { xs: 2, md: 4 } }}>
        {/* Results count */}
        {!eventsLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontFamily: fontFamilyHeading,
                '& strong': { color: 'text.primary' }
              }}
            >
              Showing <strong>{events.length}</strong> of <strong>{pagination?.total || 0}</strong> events
            </Typography>
          </Box>
        )}

        {/* Event rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatePresence mode='wait'>
            {eventsLoading ? (
              // Loading state — show skeletons
              Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
                <EventRowSkeleton key={`skeleton-${i}`} />
              ))
            ) : events.length > 0 ? (
              // Events loaded
              events.map((event, i) => (
                <EventRow
                  key={event.id}
                  event={{
                    ...event,
                    date: formatEventDate(event.start_time),
                    time: formatEventTime(event.start_time)
                  }}
                  index={i}
                />
              ))
            ) : (
              // No events found
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ textAlign: 'center', py: 10 }}
              >
                <Icon icon='tabler:mood-empty' fontSize={48} style={{ color: c.textDisabled }} />
                <Typography
                  variant='body1'
                  sx={{ color: 'text.secondary', mt: 2, fontFamily: fontFamilyHeading }}
                >
                  No events found. Try a different search or category.
                </Typography>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              shape='rounded'
              disabled={eventsLoading}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontFamily: fontFamilyHeading,
                  fontWeight: 600,
                  borderRadius: '50%',
                  color: 'text.secondary',
                  border: `1px solid ${c.dividerA30}`,
                  '&:hover': { background: 'action.hover' },
                  '&.Mui-selected': {
                    background: c.gradientPrimary,
                    color: 'primary.contrastText',
                    border: 'none',
                    boxShadow: `0 4px 16px ${c.primaryA30}`
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  )
}
