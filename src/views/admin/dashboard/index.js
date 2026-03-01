import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
import { useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { isOwner } from 'src/configs/acl'
import axios from 'axios'
import AdminKpiCard from 'src/components/admin/AdminKpiCard'
import AdminStatusChip from 'src/components/admin/AdminStatusChip'
import CustomDataGrid from 'src/components/admin/CustomDataGrid'
import AdminEventDialog from 'src/components/admin/AdminEventDialog'
import AdminUserDialog from 'src/components/admin/AdminUserDialog'

const fmtDate = d => { try { return format(new Date(d), 'dd MMM yy') } catch { return '—' } }

const QuickAction = ({ icon, label, desc, color = 'primary', onClick }) => {
  const theme = useTheme()
  const pal = theme.palette[color] || theme.palette.primary
  return (
    <Box onClick={onClick} sx={{
      p: 2, borderRadius: 2, cursor: 'pointer', border: `1px solid ${theme.palette.divider}`,
      display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.15s',
      '&:hover': { borderColor: pal.main, bgcolor: `${pal.main}12`, transform: 'translateY(-1px)' }
    }}>
      <Avatar sx={{ bgcolor: `${pal.main}18`, width: 40, height: 40 }}>
        <Icon icon={icon} fontSize={20} style={{ color: pal.main }} />
      </Avatar>
      <Box>
        <Typography variant='body2' fontWeight={700}>{label}</Typography>
        <Typography variant='caption' color='text.secondary'>{desc}</Typography>
      </Box>
    </Box>
  )
}

const AdminDashboardView = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventDialog, setEventDialog] = useState(false)
  const [userDialog, setUserDialog] = useState(false)

  const userRole = session?.user?.role?.toLowerCase() || ''
  const firstName = session?.user?.name?.split(' ')[0] || 'Admin'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const fetchDashboard = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [sRes, eRes, uRes, dRes] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/events?limit=8'),
        axios.get('/api/admin/users?limit=6'),
        axios.get('/api/departments').catch(() => ({ data: { data: [] } }))
      ])
      setStats(sRes.data.data)
      setRecentEvents(eRes.data.data || [])
      setRecentUsers(uRes.data.data || [])
      setDepartments(dRes.data.data || [])
    } catch { setError('Failed to load dashboard data.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const eventCols = [
    { field: 'name', headerName: 'Event', flex: 1, minWidth: 180, renderCell: ({ row }) => (
      <Box>
        <Typography variant='body2' fontWeight={600} noWrap>{row.name}</Typography>
        {row.venue && <Typography variant='caption' color='text.secondary' noWrap>{row.venue}</Typography>}
      </Box>
    )},
    { field: 'status', headerName: 'Status', width: 130, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.status} type='event' /> },
    { field: 'start_time', headerName: 'Date', width: 110, renderCell: ({ row }) => <Typography variant='caption'>{fmtDate(row.start_time)}</Typography> },
    { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: ({ row }) => (
      <Button size='small' onClick={() => router.push(`/admin/events/${row.id}`)}>View</Button>
    )}
  ]

  const userCols = [
    { field: 'name', headerName: 'User', flex: 1, minWidth: 180, renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 12, fontWeight: 700 }}>
          {row.name?.[0]?.toUpperCase() ?? 'U'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='body2' fontWeight={600} noWrap>{row.name}</Typography>
          <Typography variant='caption' color='text.secondary' noWrap>{row.email}</Typography>
        </Box>
      </Box>
    )},
    { field: 'role', headerName: 'Role', width: 120, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.role} type='role' /> },
    { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: ({ row }) => (
      <Button size='small' onClick={() => router.push(`/admin/users/${row.id}`)}>View</Button>
    )}
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 2,
        background: theme => theme.palette.mode === 'dark' ? undefined : 'linear-gradient(135deg,#EEF2FF,#fff)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant='h5' fontWeight={800}>{greeting}, {firstName} 👋</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <AdminStatusChip status={userRole} type='role' />
              <Typography variant='caption' color='text.secondary'>
                · {format(new Date(), 'EEEE, dd MMMM yyyy')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Can I='create' a='event'>
              <Button variant='contained' size='small' startIcon={<Icon icon='tabler:calendar-plus' fontSize={16} />}
                onClick={() => setEventDialog(true)}>New Event</Button>
            </Can>
            <Can I='create' a='user'>
              <Button variant='outlined' size='small' startIcon={<Icon icon='tabler:user-plus' fontSize={16} />}
                onClick={() => setUserDialog(true)}>Add User</Button>
            </Can>
          </Box>
        </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}
        action={<Button size='small' color='inherit' onClick={fetchDashboard}>Retry</Button>}>{error}</Alert>}

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { title: 'Total Events', value: stats?.totalEvents, icon: 'tabler:calendar-event', color: 'primary' },
          { title: 'Active Events', value: stats?.activeEvents, icon: 'tabler:player-play', color: 'success' },
          { title: 'Total Users', value: stats?.totalUsers, icon: 'tabler:users', color: 'info' },
          { title: 'Revenue', value: stats?.totalRevenue ?? 0, icon: 'tabler:currency-rupee', color: 'warning', prefix: '₹' }
        ].map(k => (
          <Grid item xs={12} sm={6} md={3} key={k.title}>
            <AdminKpiCard {...k} loading={loading} onClick={() => router.push(k.color === 'warning' ? '/admin/analytics' : k.color === 'info' ? '/admin/users' : '/admin/events')} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader title='Quick Actions' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 1 }} />
        <Divider sx={{ mt: 1 }} />
        <CardContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            {[
              { icon: 'tabler:calendar-plus', label: 'Create Event', desc: 'Add a new event', color: 'primary', fn: () => setEventDialog(true), acl: 'event' },
              { icon: 'tabler:user-plus', label: 'Add User', desc: 'Create a staff user', color: 'success', fn: () => setUserDialog(true), acl: 'user' },
              { icon: 'tabler:chart-bar', label: 'Analytics', desc: 'View stats & revenue', color: 'info', fn: () => router.push('/admin/analytics') },
              { icon: 'tabler:calendar-event', label: 'All Events', desc: 'Browse & manage', color: 'warning', fn: () => router.push('/admin/events') }
            ].map(a => (
              <Grid item xs={12} sm={6} md={3} key={a.label}>
                <QuickAction icon={a.icon} label={a.label} desc={a.desc} color={a.color} onClick={a.fn} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tables */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ boxShadow: 1 }}>
            <CardHeader title='Recent Events' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={<Button size='small' onClick={() => router.push('/admin/events')}>See all</Button>} sx={{ pb: 1 }} />
            <Divider sx={{ mt: 1 }} />
            <CustomDataGrid columns={eventCols} rows={recentEvents} loading={loading}
              showToolbar={false} paginationMode='client'
              paginationModel={{ page: 0, pageSize: 8 }} rowCount={recentEvents.length} emptyText='No events yet.' />
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ boxShadow: 1 }}>
            <CardHeader title='Recent Users' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={<Button size='small' onClick={() => router.push('/admin/users')}>See all</Button>} sx={{ pb: 1 }} />
            <Divider sx={{ mt: 1 }} />
            <CustomDataGrid columns={userCols} rows={recentUsers} loading={loading}
              showToolbar={false} paginationMode='client'
              paginationModel={{ page: 0, pageSize: 6 }} rowCount={recentUsers.length} emptyText='No users found.' />
          </Card>
        </Grid>
      </Grid>

      <AdminEventDialog open={eventDialog} onClose={() => setEventDialog(false)}
        onSuccess={() => { setEventDialog(false); fetchDashboard() }} departments={departments} />
      <AdminUserDialog open={userDialog} onClose={() => setUserDialog(false)}
        onSuccess={() => { setUserDialog(false); fetchDashboard() }} currentUserRole={userRole} />
    </Box>
  )
}

export default AdminDashboardView
