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
import { fetchEvents, fetchDepartments } from 'src/store/slices/eventsSlice'

const MotionBox = motion(Box)

const EVENTS_PER_PAGE = 6

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Parses an ISO date string into a human-readable full date string.
 * @param {string|null} iso - ISO 8601 date string
 * @returns {{ full: string }} Object with a formatted `full` date string
 */
function parseEventDate(iso) {
  if (!iso) return { full: '' }
  const d = new Date(iso)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  const month = d.toLocaleDateString('en-US', { month: 'long' })
  return { full: `${weekday}, ${month} ${d.getDate()}, ${d.getFullYear()}` }
}

/**
 * Formats an ISO date string as a 12-hour time string (e.g. "2:30 PM").
 * @param {string|null} iso - ISO 8601 date string
 * @returns {string} Formatted time string, or empty string if input is falsy
 */
function formatEventTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Extracts the first image URL from an event object.
 * Handles both plain string URLs and `{ url }` image objects.
 * @param {object} event - Event data object
 * @returns {string|null} Image URL, or null if none available
 */
function getEventImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

/* ── EventCard ────────────────────────────────────────────────────────────── */

/**
 * Renders a single event card with image, metadata table, and action buttons.
 * Uses framer-motion for staggered entry animation.
 * @param {object} props
 * @param {object} props.event - Event data object from the API
 * @param {number} props.index - Card index used to stagger animation delay
 */
function EventCard({ event, index }) {
  const c = useAppPalette()
  const router = useRouter()
  const accent = c.primary
  const imageUrl = getEventImage(event)
  const spotsLeft = event.seats > 0 ? event.seats - (event.registered || 0) : null
  const almostFull = spotsLeft !== null && spotsLeft <= Math.ceil(event.seats * 0.2)
  const dateParsed = parseEventDate(event.start_time)
  const time = formatEventTime(event.start_time)

  const meta = [
    { label: 'Date', value: dateParsed.full },
    { label: 'Time', value: time },
    event.venue && { label: 'Venue', value: event.venue },
    event.prize && { label: 'Prize', value: event.prize }
  ].filter(Boolean)

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 1, 0.5, 1] }}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: '16px',
        border: `1.5px solid ${alpha(accent, 0.22)}`,
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          borderColor: alpha(accent, 0.48),
          boxShadow: `0 8px 40px ${alpha(accent, 0.08)}`
        }
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: { xs: '100%', md: 200 },
          minHeight: { xs: 180, md: 180 },
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          p: 2.4,
          bgcolor: 'transparent'
        }}
      >
        {imageUrl ? (
          <Box
            component='img'
            src={imageUrl}
            alt={event.title}
            loading='lazy'
            onError={e => {
              e.target.style.display = 'none'
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
            }}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '10px' }}
          />
        ) : null}
        <Box
          sx={{
            display: imageUrl ? 'none' : 'flex',
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon='tabler:calendar-event' fontSize={36} style={{ color: alpha(accent, 0.35) }} />
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          p: { xs: 2.5, md: 3 },
          gap: { xs: 2, sm: 3 }
        }}
      >
        {/* Left: info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', md: '1.1rem' },
              lineHeight: 1.35,
              mb: 0.75,
              letterSpacing: '-0.01em',
              color: 'text.primary'
            }}
          >
            {event.title}
          </Typography>

          {event.tagline && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: '0.82rem',
                lineHeight: 1.55,
                mb: 2,
                maxWidth: 520,
                opacity: 0.85
              }}
            >
              {event.tagline}
            </Typography>
          )}

          {almostFull && spotsLeft !== null && (
            <Chip
              label={spotsLeft <= 0 ? 'Sold Out' : `${spotsLeft} Spot${spotsLeft !== 1 ? 's' : ''} Left`}
              size='small'
              sx={{
                mb: 2,
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: spotsLeft <= 0 ? c.errorA15 : alpha(c.warning, 0.12),
                color: spotsLeft <= 0 ? c.error : c.warning,
                border: `1px solid ${spotsLeft <= 0 ? c.errorA20 : alpha(c.warning, 0.2)}`,
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          )}

          {/* Metadata table */}
          <Box
            component='table'
            sx={{
              borderCollapse: 'collapse',
              '& td': { py: 0.35, verticalAlign: 'top', fontSize: '0.8rem', lineHeight: 1.6 },
              '& td:first-of-type': { color: 'text.disabled', pr: 3, whiteSpace: 'nowrap', fontWeight: 500 },
              '& td:last-of-type': { color: 'text.primary', fontWeight: 600 }
            }}
          >
            <tbody>
              {meta.map(({ label, value }) => (
                <tr key={label}>
                  <td>{label}:</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        {/* Right: actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: { xs: 'stretch', sm: 'flex-end' },
            gap: 1.25,
            flexShrink: 0,
            pt: { xs: 0, sm: 0.5 }
          }}
        >
          <Button
            variant='contained'
            size='small'
            disableElevation
            sx={{
              minWidth: 130,
              height: 38,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              bgcolor: 'transparent',
              color: accent,
              border: `1px solid ${alpha(accent, 0.22)}`,
              '&:hover': { bgcolor: alpha(accent, 0.06), boxShadow: `0 4px 20px ${alpha(accent, 0.08)}` },
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </Button>
          <Button
            variant='text'
            size='small'
            onClick={() => router.push(`/events/${event.id}`)}
            sx={{
              minWidth: 130,
              height: 36,
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.76rem',
              letterSpacing: '0.03em',
              textTransform: 'none',
              color: 'text.secondary',
              border: `1px solid ${alpha(accent, 0.18)}`,
              '&:hover': {
                borderColor: alpha(accent, 0.35),
                color: 'text.primary',
                background: alpha(accent, 0.05)
              }
            }}
          >
            More Info
          </Button>
        </Box>
      </Box>
    </MotionBox>
  )
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  Loading Skeleton
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Placeholder skeleton card shown while events are loading.
 * Mirrors the layout of EventCard to prevent layout shift.
 */
function EventCardSkeleton() {
  const c = useAppPalette()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: '16px',
        border: `1.5px solid ${c.dividerA30}`,
        background: 'transparent',
        overflow: 'hidden'
      }}
    >
      <Skeleton
        variant='rectangular'
        sx={{ width: { xs: '100%', md: 200 }, height: { xs: 160, md: 180 }, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton width='55%' height={24} sx={{ mb: 1 }} />
          <Skeleton width='80%' height={16} sx={{ mb: 2.5 }} />
          <Skeleton width='40%' height={14} sx={{ mb: 0.75 }} />
          <Skeleton width='30%' height={14} sx={{ mb: 0.75 }} />
          <Skeleton width='35%' height={14} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'flex-end' }}>
          <Skeleton width={130} height={38} sx={{ borderRadius: '8px' }} />
          <Skeleton width={130} height={36} sx={{ borderRadius: '8px' }} />
        </Box>
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Main View — EventsPageView
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Full-page events listing view.
 * Fetches published events from the Redux store with department filter,
 * search, sort, and pagination controls.
 * Rendered at /events.
 */
export default function EventsPageView() {
  const c = useAppPalette()
  const dispatch = useDispatch()
  const { events, pagination, eventsLoading, departments, departmentsLoaded, error: eventsError } = useSelector(state => state.events)

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
    const promise = dispatch(
      fetchEvents({
        departmentId: activeDept === 'all' ? undefined : activeDept,
        search: debouncedSearch,
        sort: sortOrder,
        page,
        limit: EVENTS_PER_PAGE
      })
    )
    return () => promise.abort()
  }, [dispatch, activeDept, debouncedSearch, sortOrder, page])

  // Fetch departments once — guarded by departmentsLoaded so an empty result
  // from the DB doesn't trigger an infinite re-fetch loop
  useEffect(() => {
    if (!departmentsLoaded) {
      dispatch(fetchDepartments())
    }
  }, [dispatch, departmentsLoaded])

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
      background: c.isDark ? alpha(c.bgPaper, 0.5) : alpha(c.bgPaper, 0.9),
      backdropFilter: 'blur(8px)',
      fontSize: '0.85rem',
      fontWeight: 500,
      '& fieldset': { borderColor: c.dividerA30 },
      '&:hover fieldset': { borderColor: c.dividerA50 },
      '&.Mui-focused fieldset': { borderColor: alpha(c.primary, 0.5) }
    },
    '& .MuiInputAdornment-root': { color: 'text.disabled' },
    '& .MuiSelect-icon': { color: 'text.disabled' }
  }

  const totalPages = pagination?.totalPages || 1
  const totalCount = pagination?.total || 0

  return (
    <Box component='section' aria-label='Events' sx={{ pt: { xs: 6, md: 8 } }}>
      <Container maxWidth='xl'>

        {/* Page Header */}
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            mb: { xs: 3, md: 4 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!eventsLoading && totalCount > 0 && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `2px solid ${alpha(c.primary, 0.4)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: c.primary }}>
                  {totalCount}
                </Typography>
              </Box>
            )}
            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              Upcoming Events
            </Typography>
          </Box>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', fontSize: '0.82rem', maxWidth: 280, textAlign: { xs: 'left', sm: 'right' }, lineHeight: 1.5, opacity: 0.8 }}
          >
            All upcoming events at Citronics 2026.
          </Typography>
        </MotionBox>

        {/* Filter Bar */}
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.5,
            mb: { xs: 3, md: 4 },
            pb: { xs: 2.5, md: 3 },
            borderBottom: `1px solid ${c.dividerA30}`
          }}
        >
          <TextField
            placeholder='Search events...'
            value={searchQuery}
            onChange={handleSearch}
            size='small'
            aria-label='Search events'
            sx={{ ...inputSx, flexGrow: 1, maxWidth: { sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:search' fontSize={17} />
                </InputAdornment>
              )
            }}
          />

          <FormControl size='small' sx={{ minWidth: 170, ...inputSx }}>
            <Select
              value={activeDept}
              onChange={handleDeptChange}
              displayEmpty
              aria-label='Filter by department'
              sx={{ '& .MuiSelect-select': { py: 1 } }}
            >
              <MenuItem value='all'>All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <FormControl size='small' sx={{ minWidth: 130, ...inputSx }}>
            <Select
              value={sortOrder}
              onChange={e => { setSortOrder(e.target.value); setPage(1) }}
              aria-label='Sort order'
              sx={{ '& .MuiSelect-select': { py: 1 } }}
            >
              <MenuItem value='newest'>Newest</MenuItem>
              <MenuItem value='oldest'>Oldest</MenuItem>
              <MenuItem value='popular'>Popular</MenuItem>
            </Select>
          </FormControl>
        </MotionBox>

        {/* Events List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
          <AnimatePresence mode='wait'>
            {eventsLoading ? (
              Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => <EventCardSkeleton key={`sk-${i}`} />)
            ) : eventsError ? (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ textAlign: 'center', py: 12, borderRadius: '16px', border: `1.5px dashed ${alpha(c.error, 0.3)}` }}
              >
                <Icon icon='tabler:alert-triangle' fontSize={44} style={{ color: c.error }} />
                <Typography variant='body1' sx={{ color: 'error.main', mt: 2, fontWeight: 600 }}>
                  Failed to load events
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5, mb: 2 }}>
                  {typeof eventsError === 'string' ? eventsError : 'An unexpected error occurred. Please try again.'}
                </Typography>
                <Button
                  variant='outlined'
                  size='small'
                  color='primary'
                  onClick={() => dispatch(fetchEvents({ departmentId: activeDept === 'all' ? undefined : activeDept, search: debouncedSearch, sort: sortOrder, page, limit: EVENTS_PER_PAGE }))}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  Retry
                </Button>
              </MotionBox>
            ) : events.length > 0 ? (
              events.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)
            ) : (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ textAlign: 'center', py: 12, borderRadius: '16px', border: `1.5px dashed ${c.dividerA30}` }}
              >
                <Icon icon='tabler:calendar-off' fontSize={44} style={{ color: c.textDisabled }} />
                <Typography variant='body1' sx={{ color: 'text.secondary', mt: 2, fontWeight: 500 }}>
                  No events found. Try a different search or department.
                </Typography>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              shape='rounded'
              disabled={eventsLoading}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  color: 'text.secondary',
                  border: `1px solid ${c.dividerA30}`,
                  minWidth: 38,
                  height: 38,
                  '&:hover': { background: alpha(c.primary, 0.06), borderColor: alpha(c.primary, 0.3) },
                  '&.Mui-selected': {
                    bgcolor: c.primary,
                    color: c.primaryContrast,
                    border: 'none',
                    '&:hover': { bgcolor: c.primaryDark }
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
