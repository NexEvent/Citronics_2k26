import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import {
  fetchDashboardStats,
  fetchUpcomingEvents,
  selectDashboardStats,
  selectUpcomingEvents,
  selectStatsLoading,
  selectEventsLoading
} from 'src/store/slices/dashboardSlice'

// ── KPI Stat Card ─────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, delta, icon, color, prefix = '', suffix = '', loading }) => {
  const theme = useTheme()
  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main
  }
  const bg = colorMap[color] ?? theme.palette.primary.main
  const isPositive = delta >= 0

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" fontWeight={700}>
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </Typography>
            )}
            {delta !== undefined && !loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Icon
                  icon={isPositive ? 'tabler:trending-up' : 'tabler:trending-down'}
                  fontSize={14}
                  style={{ color: isPositive ? theme.palette.success.main : theme.palette.error.main }}
                />
                <Typography variant="caption" sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {Math.abs(delta)}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${bg}22`, width: 44, height: 44 }}>
            <Icon icon={icon} fontSize={22} style={{ color: bg }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

// ── Upcoming Event Row ────────────────────────────────────────────────────────
const EventRow = ({ event, onView }) => {
  const statusColors = { published: 'success', draft: 'default', cancelled: 'error', ongoing: 'warning' }
  const fill = event.registered && event.capacity ? (event.registered / event.capacity) * 100 : 0

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' }
      }}
      onClick={() => onView?.(event)}
    >
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>
        {event.title?.[0]?.toUpperCase() ?? 'E'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{event.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Icon icon="tabler:calendar" fontSize={12} />
          <Typography variant="caption" color="text.secondary">
            {event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}
          </Typography>
          {event.venue && (
            <>
              <Typography variant="caption" color="text.disabled">·</Typography>
              <Icon icon="tabler:map-pin" fontSize={12} />
              <Typography variant="caption" color="text.secondary" noWrap>{event.venue}</Typography>
            </>
          )}
        </Box>
        {event.capacity > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(fill, 100)}
              sx={{ height: 4, borderRadius: 2 }}
              color={fill > 80 ? 'warning' : 'primary'}
            />
            <Typography variant="caption" color="text.secondary">
              {event.registered ?? 0} / {event.capacity} registered
            </Typography>
          </Box>
        )}
      </Box>
      <Chip
        label={event.status ?? 'draft'}
        size="small"
        color={statusColors[event.status] ?? 'default'}
        sx={{ textTransform: 'capitalize' }}
      />
    </Box>
  )
}

// ── Main Dashboard View ───────────────────────────────────────────────────────
const DashboardView = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { data: session, status } = useSession()
  const theme = useTheme()

  const stats           = useSelector(selectDashboardStats)
  const statsLoading    = useSelector(selectStatsLoading)
  const events          = useSelector(selectUpcomingEvents)
  const eventsLoading   = useSelector(selectEventsLoading)

  const [lastRefresh, setLastRefresh] = useState(Date.now())

  useEffect(() => {
    if (session) {
      dispatch(fetchDashboardStats())
      dispatch(fetchUpcomingEvents())
    }
  }, [session, lastRefresh, dispatch])

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome back, {session?.user?.firstName || session?.user?.name || 'Organizer'} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's what's happening with your events today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setLastRefresh(Date.now())} title="Refresh">
            <Icon icon="tabler:refresh" />
          </IconButton>
          <Button variant="contained" startIcon={<Icon icon="tabler:plus" />} onClick={() => router.push('/events/create')}>
            New Event
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        {[
          { title: 'Total Events',      value: stats?.total_events,         icon: 'tabler:calendar-event',    color: 'primary' },
          { title: 'Active Events',     value: stats?.active_events,        icon: 'tabler:calendar-check',    color: 'success' },
          { title: 'Registrations',     value: stats?.total_registrations,  icon: 'tabler:users',             color: 'info' },
          { title: 'Tickets Sold',      value: stats?.tickets_sold,         icon: 'tabler:ticket',            color: 'warning' },
          { title: 'Revenue',           value: stats?.total_revenue,        icon: 'tabler:currency-dollar',   color: 'primary', prefix: '₹' }
        ].map((kpi) => (
          <Grid item xs={12} sm={6} lg={kpi.title === 'Revenue' ? 12 : 3} key={kpi.title}>
            <KpiCard {...kpi} loading={statsLoading} />
          </Grid>
        ))}

        {/* Upcoming Events */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Upcoming Events"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              action={<Button size="small" onClick={() => router.push('/events')}>View all</Button>}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {eventsLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={28} /></Box>
              ) : events.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Icon icon="tabler:calendar-off" fontSize={40} style={{ color: theme.palette.text.disabled }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No upcoming events yet.
                  </Typography>
                  <Button
                    variant="outlined" size="small" sx={{ mt: 2 }}
                    onClick={() => router.push('/events/create')}
                    startIcon={<Icon icon="tabler:plus" />}
                  >
                    Create Event
                  </Button>
                </Box>
              ) : (
                events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={{
                      ...event,
                      startDate: event.event_date,
                      venue: event.venue_name,
                      registered: event.registrations_count
                    }}
                    onView={(e) => router.push(`/events/${e.id}`)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Quick Actions" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {[
                  { label: 'Create Event',   icon: 'tabler:calendar-plus',     href: '/events/create',  color: 'primary.main' },
                  { label: 'Add Speaker',    icon: 'tabler:user-plus',          href: '/speakers',       color: 'success.main' },
                  { label: 'Add Venue',      icon: 'tabler:building-stadium',   href: '/venues',         color: 'warning.main' },
                  { label: 'Schedule',       icon: 'tabler:layout-grid',        href: '/schedule',       color: 'info.main' },
                  { label: 'Registrations',  icon: 'tabler:clipboard-list',     href: '/registrations',  color: 'secondary.main' },
                  { label: 'Analytics',      icon: 'tabler:chart-bar',          href: '/analytics',      color: 'error.main' }
                ].map((action) => (
                  <Grid item xs={6} key={action.href}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        p: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: action.color, transform: 'translateY(-2px)', boxShadow: 2 }
                      }}
                      onClick={() => router.push(action.href)}
                    >
                      <Icon icon={action.icon} fontSize={28} style={{ color: action.color }} />
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {action.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardView