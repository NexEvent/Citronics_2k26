/**
 * UserDetailView — Shows details for a single user (admin)
 *
 * Displays:
 *  - Events associated with the user
 *  - Registered users for each event
 *  - Payments received
 *  - Tickets generated
 *
 * Admin: View-only + can send tickets
 * Owner: Full CRUD
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { CustomDataGrid, CustomChip, KPICard } from 'src/components/customComponent'
import usePermissions from 'src/hooks/usePermissions'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const fmtDate = d => { try { return format(new Date(d), 'dd MMM yyyy') } catch { return '—' } }

const UserDetailView = () => {
  const router = useRouter()
  const { id } = router.query
  const { canSendTicket } = usePermissions()

  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [payments, setPayments] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingTicket, setSendingTicket] = useState(null)

  const fetchUserDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [userRes, eventsRes, paymentsRes, ticketsRes] = await Promise.all([
        axios.get(`/api/admin/users/${id}`),
        axios.get(`/api/admin/users/${id}/events`),
        axios.get(`/api/admin/users/${id}/payments`),
        axios.get(`/api/admin/users/${id}/tickets`)
      ])
      setUser(userRes.data.data || userRes.data)
      setEvents(eventsRes.data.data || [])
      setPayments(paymentsRes.data.data || [])
      setTickets(ticketsRes.data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load user details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchUserDetail() }, [fetchUserDetail])

  const handleSendTicket = async (ticketId) => {
    setSendingTicket(ticketId)
    try {
      await axios.post(`/api/admin/tickets/${ticketId}/send`)
      toast.success('Ticket sent successfully')
      fetchUserDetail()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send ticket')
    } finally {
      setSendingTicket(null)
    }
  }

  // KPI calculations
  const totalEvents = events.length
  const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const totalTickets = tickets.length

  const eventColumns = [
    {
      field: 'name',
      headerName: 'Event',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' fontWeight={600} noWrap>{row.name}</Typography>
          {row.venue && (
            <Typography variant='caption' color='text.secondary' noWrap>
              <Icon icon='tabler:map-pin' fontSize={11} /> {row.venue}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.status} type='event' />
    },
    {
      field: 'registered',
      headerName: 'Registrations',
      width: 120,
      type: 'number',
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={600}>
          {Number(row.registered || row.registration_count || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'start_time',
      headerName: 'Date',
      width: 120,
      renderCell: ({ row }) => <Typography variant='caption'>{fmtDate(row.start_time)}</Typography>
    }
  ]

  const paymentColumns = [
    {
      field: 'event_name',
      headerName: 'Event',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => <Typography variant='body2' fontWeight={600} noWrap>{row.event_name}</Typography>
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={700} color='success.main'>
          ₹{Number(row.amount || 0).toLocaleString('en-IN')}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.status} type='payment' />
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 120,
      renderCell: ({ row }) => <Typography variant='caption'>{fmtDate(row.created_at || row.paid_at)}</Typography>
    }
  ]

  const ticketColumns = [
    {
      field: 'event_name',
      headerName: 'Event',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => <Typography variant='body2' fontWeight={600} noWrap>{row.event_name}</Typography>
    },
    {
      field: 'ticket_code',
      headerName: 'Ticket Code',
      width: 150,
      renderCell: ({ row }) => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={600}>
          {row.ticket_code || row.code || '—'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.status || (row.check_in_at ? 'used' : 'available')} type='ticket' />
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: ({ row }) =>
        canSendTicket ? (
          <Tooltip title='Send Ticket'>
            <IconButton
              size='small'
              onClick={() => handleSendTicket(row.id)}
              disabled={sendingTicket === row.id}
            >
              <Icon icon='tabler:send' fontSize={16} />
            </IconButton>
          </Tooltip>
        ) : null
    }
  ]

  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Skeleton width={200} height={24} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant='rectangular' height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline='hover'
          color='inherit'
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
          onClick={() => router.push('/admin/users')}
        >
          <Icon icon='tabler:users' fontSize={16} /> Users
        </Link>
        <Typography color='text.primary' fontWeight={600}>
          {user?.name || 'User Detail'}
        </Typography>
      </Breadcrumbs>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* User Info Card */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='h5' fontWeight={800} noWrap>{user?.name}</Typography>
              <Typography variant='body2' color='text.secondary'>{user?.email}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <CustomChip status={user?.role} type='role' />
                <CustomChip status={user?.verified ?? user?.email_verified} type='verified' />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Can I='update' a='user'>
                <Button variant='outlined' size='small' startIcon={<Icon icon='tabler:edit' fontSize={16} />}
                  onClick={() => router.push(`/admin/users/${id}?edit=true`)}>
                  Edit
                </Button>
              </Can>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <KPICard title='Events' value={totalEvents} icon='tabler:calendar-event' color='primary' />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title='Payments Received' value={totalPayments} icon='tabler:currency-rupee' color='success' prefix='₹' />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title='Tickets Generated' value={totalTickets} icon='tabler:ticket' color='info' />
        </Grid>
      </Grid>

      {/* Events Table */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          title='Associated Events'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          sx={{ pb: 1 }}
        />
        <Divider />
        <CustomDataGrid
          columns={eventColumns}
          rows={events}
          loading={false}
          showToolbar={false}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }}
          rowCount={events.length}
          onRowClick={({ row }) => router.push(`/admin/events/${row.id}`)}
          emptyText='No events found for this user.'
        />
      </Card>

      {/* Payments Table */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          title='Payments Received'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          sx={{ pb: 1 }}
        />
        <Divider />
        <CustomDataGrid
          columns={paymentColumns}
          rows={payments}
          loading={false}
          showToolbar={false}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }}
          rowCount={payments.length}
          emptyText='No payments found.'
        />
      </Card>

      {/* Tickets Table */}
      <Card sx={{ boxShadow: 1 }}>
        <CardHeader
          title='Tickets Generated'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          sx={{ pb: 1 }}
        />
        <Divider />
        <CustomDataGrid
          columns={ticketColumns}
          rows={tickets}
          loading={false}
          showToolbar={false}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }}
          rowCount={tickets.length}
          emptyText='No tickets generated.'
        />
      </Card>
    </Box>
  )
}

export default UserDetailView
