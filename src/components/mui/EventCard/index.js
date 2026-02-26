import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import Icon from 'src/components/Icon'
import StatusChip from 'src/components/mui/StatusChip'
import { useAppPalette } from 'src/components/palette'

/**
 * EventCard
 *
 * Reusable card for displaying an event in a grid or list.
 *
 * @prop {object}   event            - event object from the database / Redux store
 * @prop {string}   event.id
 * @prop {string}   event.title
 * @prop {string}   [event.banner]   - URL for the banner image
 * @prop {string}   event.event_date - ISO date string
 * @prop {string}   [event.venue_name]
 * @prop {number}   [event.capacity]
 * @prop {number}   [event.registrations_count]
 * @prop {string}   [event.status]   - 'published' | 'draft' | 'cancelled' | 'completed'
 * @prop {string}   [event.category]
 * @prop {function} [onClick]        - card click handler; defaults to no-op
 * @prop {object}   [sx]             - extra sx on the outer Card
 *
 * @example
 * <EventCard event={event} onClick={() => router.push(`/events/${event.id}`)} />
 */
const EventCard = ({ event = {}, onClick, sx }) => {
  const c = useAppPalette()

  const {
    title = 'Untitled Event',
    banner,
    event_date,
    venue_name,
    capacity = 0,
    registrations_count = 0,
    status = 'draft',
    category
  } = event

  const fillPct = capacity > 0 ? Math.min((registrations_count / capacity) * 100, 100) : 0
  const isSoldOut = fillPct >= 100

  const formattedDate = event_date
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(new Date(event_date))
    : null

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${c.divider}`,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: c.theme.shadows[8],
          transform: 'translateY(-2px)'
        },
        ...sx
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* ── Banner ── */}
        <Box
          sx={{
            height: 200,
            backgroundImage: banner ? `url(${banner})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: banner ? 'transparent' : c.primaryA12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {!banner && (
            <Icon
              icon='tabler:calendar-event'
              style={{ fontSize: 56, color: c.primary, opacity: 0.5 }}
            />
          )}

          {/* Status badge top-right */}
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <StatusChip type='event' status={status} />
          </Box>

          {/* Category badge top-left */}
          {category && (
            <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
              <StatusChip
                type='event'
                status='published'
                sx={{ bgcolor: c.blackA50, color: c.white }}
                label={category}
              />
            </Box>
          )}
        </Box>

        {/* ── Content ── */}
        <CardContent sx={{ flexGrow: 1, p: 3, '&:last-child': { pb: 3 } }}>
          <Typography
            variant='h6'
            fontWeight={600}
            sx={{
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </Typography>

          {/* Date */}
          {formattedDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Icon icon='tabler:calendar' style={{ fontSize: 16 }} />
              <Typography variant='body2'>{formattedDate}</Typography>
            </Box>
          )}

          {/* Venue */}
          {venue_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
              <Icon icon='tabler:map-pin' style={{ fontSize: 16 }} />
              <Typography variant='body2' noWrap>
                {venue_name}
              </Typography>
            </Box>
          )}

          {/* Capacity bar */}
          {capacity > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  {isSoldOut ? 'Sold Out' : `${registrations_count} / ${capacity} seats`}
                </Typography>
                <Typography
                  variant='caption'
                  fontWeight={600}
                  color={isSoldOut ? 'error.main' : fillPct > 80 ? 'warning.main' : 'success.main'}
                >
                  {Math.round(fillPct)}%
                </Typography>
              </Box>
              <Tooltip title={`${registrations_count} registered out of ${capacity}`}>
                <LinearProgress
                  variant='determinate'
                  value={fillPct}
                  color={isSoldOut ? 'error' : fillPct > 80 ? 'warning' : 'success'}
                  sx={{ borderRadius: 4, height: 6 }}
                />
              </Tooltip>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default EventCard
