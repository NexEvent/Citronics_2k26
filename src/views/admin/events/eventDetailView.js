/**
 * EventDetailView — Admin event detail page
 * Shows event info, KPI stats, registered users, bookings, tickets
 * Uses: CustomDataGrid, CustomChip, KPICard from customComponent
 *       ConfirmDialog from mui, usePermissions hook
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'
import { format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { CustomDataGrid, CustomChip, KPICard } from 'src/components/customComponent'
import usePermissions from 'src/hooks/usePermissions'

const fmtDate = d => {
  if (!d) return '—'
  try {
    return format(new Date(d), 'dd MMM yyyy, hh:mm a')
  } catch { return '—' }
}

const fmtShortDate = d => {
  try { return format(new Date(d), 'dd MMM yyyy') } catch { return '—' }
}

const EventDetailView = () => {
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()
  const { canEdit, canSendTicket, isOwner, userId } = usePermissions()

  const [event, setEvent] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    setAccessDenied(false)
    try {
      const [evRes, analyticsRes, bookingsRes] = await Promise.all([
        axios.get(`/api/admin/events/${id}`),
        axios.get(`/api/admin/events/${id}/analytics`).catch(() => ({ data: { data: null } })),
        axios.get(`/api/admin/events/${id}/bookings`).catch(() => ({ data: { data: [] } }))
      ])
      const eventData = evRes.data.data || evRes.data
      
      // Access control: Admin can only view events they manage, Owner sees all
      if (!isOwner && Number(eventData.manager_id) !== Number(userId)) {
        setAccessDenied(true)
        setLoading(false)
        return
      }
      
      setEvent(eventData)
      setAnalytics(analyticsRes.data.data || analyticsRes.data)
      // Filter bookings to show only student users
      const allBookings = bookingsRes.data.data || []
      const studentBookings = allBookings.filter(b => b.user_role === 'student')
      setBookings(studentBookings)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }, [id, isOwner, userId])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleStatusChange = async newStatus => {
    try {
      await axios.put(`/api/admin/events/${id}`, { status: newStatus })
      setEvent(prev => ({ ...prev, status: newStatus }))
      toast.success(`Status changed to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleSendTicket = async bookingId => {
    try {
      await axios.post(`/api/admin/bookings/${bookingId}/send-ticket`)
      toast.success('Ticket sent successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send ticket')
    }
  }

  // ── Loading / Error ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Skeleton variant='text' width={200} height={32} sx={{ mb: 1 }} />
        <Skeleton variant='rectangular' height={120} sx={{ borderRadius: 2, mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant='rectangular' height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
      </Box>
    )
  }

  if (error || !event) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {accessDenied ? 'You can only view events you manage' : error || 'Event not found'}
        </Alert>
        <Button variant='outlined' onClick={() => router.push('/admin/events')}>Back to Events</Button>
      </Box>
    )
  }

  // ── Info grid items ─────────────────────────────────────────────────────
  const infoItems = [
    { icon: 'tabler:calendar', label: 'Start', value: fmtDate(event.start_time) },
    { icon: 'tabler:calendar-off', label: 'End', value: fmtDate(event.end_time) },
    { icon: 'tabler:map-pin', label: 'Venue', value: event.venue || '—' },
    { icon: 'tabler:ticket', label: 'Max Tickets', value: Number(event.max_tickets).toLocaleString() },
    { icon: 'tabler:currency-rupee', label: 'Price', value: Number(event.ticket_price) === 0 ? 'Free' : `₹${Number(event.ticket_price).toLocaleString('en-IN')}` },
    { icon: 'tabler:eye', label: 'Visibility', value: event.visibility || '—' }
  ]

  // ── Bookings columns ───────────────────────────────────────────────────
  const bookingCols = [
    {
      field: 'user_name', headerName: 'User', flex: 1, minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 12, fontWeight: 700 }}>
            {row.user_name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='body2' fontWeight={600} noWrap>{row.user_name || '—'}</Typography>
            <Typography variant='caption' color='text.secondary' noWrap>{row.user_email || ''}</Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'quantity', headerName: 'Qty', width: 80, type: 'number',
      renderCell: ({ row }) => <Typography variant='body2' fontWeight={600}>{row.quantity || 1}</Typography>
    },
    {
      field: 'total_amount', headerName: 'Amount', width: 110,
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={600}>
          ₹{Number(row.total_amount || 0).toLocaleString('en-IN')}
        </Typography>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 120, sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.status} type='payment' />
    },
    {
      field: 'created_at', headerName: 'Booked On', width: 120,
      renderCell: ({ row }) => <Typography variant='caption'>{fmtShortDate(row.created_at)}</Typography>
    },
    ...(canSendTicket ? [{
      field: 'actions', headerName: '', width: 100, sortable: false,
      renderCell: ({ row }) => (
        row.status === 'confirmed' ? (
          <Button size='small' variant='outlined' onClick={e => { e.stopPropagation(); handleSendTicket(row.id) }}>
            Send Ticket
          </Button>
        ) : null
      )
    }] : [])
  ]

  // ── Status action buttons ──────────────────────────────────────────────
  const statusActions = {
    draft: [{ label: 'Publish', value: 'published', color: 'success' }],
    published: [
      { label: 'Activate', value: 'active', color: 'primary' },
      { label: 'Cancel', value: 'cancelled', color: 'error' }
    ],
    active: [
      { label: 'Complete', value: 'completed', color: 'success' },
      { label: 'Cancel', value: 'cancelled', color: 'error' }
    ],
    cancelled: [{ label: 'Re-draft', value: 'draft', color: 'warning' }],
    completed: []
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component='button' variant='body2' underline='hover'
          onClick={() => router.push('/admin/dashboard')}>Dashboard</Link>
        <Link component='button' variant='body2' underline='hover'
          onClick={() => router.push('/admin/events')}>Events</Link>
        <Typography variant='body2' color='text.primary'>{event.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>{event.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CustomChip status={event.status} type='event' />
                <Chip label={event.visibility} size='small' variant='outlined' sx={{ textTransform: 'capitalize' }} />
              </Box>
              {event.description && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1.5, maxWidth: 600 }}>
                  {event.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Status Change Buttons */}
              {canEdit('event') && (statusActions[event.status] || []).map(action => (
                <Button key={action.value} variant='outlined' size='small' color={action.color}
                  onClick={() => handleStatusChange(action.value)}>
                  {action.label}
                </Button>
              ))}
              <Can I='update' a='event'>
                <Button variant='contained' size='small'
                  startIcon={<Icon icon='tabler:edit' fontSize={16} />}
                  onClick={() => router.push(`/admin/events/${id}/edit`)}>
                  Edit
                </Button>
              </Can>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard title='Tickets Sold' value={analytics?.ticketsSold ?? 0}
            icon='tabler:ticket' color='primary' />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard title='Revenue' value={analytics?.revenue ?? 0}
            icon='tabler:currency-rupee' color='success' prefix='₹' />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard title='Bookings' value={analytics?.totalBookings ?? 0}
            icon='tabler:shopping-cart' color='info' />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard title='Occupancy' value={`${analytics?.occupancyRate ?? 0}%`}
            icon='tabler:chart-bar' color='warning' />
        </Grid>
      </Grid>

      {/* Event Info */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader title='Event Details'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 1 }} />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {infoItems.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.label}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Icon icon={item.icon} fontSize={18} style={{ color: theme.palette.primary.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
                    <Typography variant='body2' fontWeight={600}>{item.value}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Student Registrations Table */}
      <Card sx={{ boxShadow: 1 }}>
        <CardHeader title='Student Registrations'
          subheader={`${bookings.length} student${bookings.length !== 1 ? 's' : ''}`}
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          sx={{ pb: 1 }} />
        <Divider />
        <CustomDataGrid
          columns={bookingCols}
          rows={bookings}
          loading={false}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }}
          rowCount={bookings.length}
          emptyText='No student registrations yet.'
        />
      </Card>
    </Box>
  )
}

export default EventDetailView
