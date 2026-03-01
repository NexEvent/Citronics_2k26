import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Icon from 'src/components/Icon'
import axios from 'axios'
import AdminKpiCard from 'src/components/admin/AdminKpiCard'
import AdminStatusChip from 'src/components/admin/AdminStatusChip'
import CustomDataGrid from 'src/components/admin/CustomDataGrid'

const AnalyticsView = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('30')
  const [data, setData] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/admin/analytics?period=${period}`)
      setData(res.data.data || res.data)
    } catch (e) { setError(e.response?.data?.error || 'Failed to load analytics') }
    finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetch() }, [fetch])

  const ov = data?.overview || {}

  const topEventsCols = [
    { field: 'name', headerName: 'Event', flex: 1, minWidth: 180, renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={600} noWrap>{row.name}</Typography>
    )},
    { field: 'status', headerName: 'Status', width: 120, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.status} type='event' /> },
    { field: 'bookings', headerName: 'Bookings', width: 110, type: 'number', renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={600}>{Number(row.bookings || 0).toLocaleString()}</Typography>
    )},
    { field: 'revenue', headerName: 'Revenue', width: 120, type: 'number', renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={700} color='success.main'>
        ₹{Number(row.revenue || 0).toLocaleString('en-IN')}
      </Typography>
    )}
  ]

  const deptCols = [
    { field: 'name', headerName: 'Department', flex: 1, renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={600}>{row.name}</Typography>
    )},
    { field: 'event_count', headerName: 'Events', width: 90, type: 'number' },
    { field: 'share', headerName: 'Share', flex: 1, minWidth: 150, sortable: false, renderCell: ({ row }) => {
      const max = Math.max(...(data?.departmentStats || []).map(d => d.event_count || 0), 1)
      const pct = Math.round(((row.event_count || 0) / max) * 100)
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress variant='determinate' value={pct} sx={{ flex: 1, borderRadius: 4, height: 6 }} />
          <Typography variant='caption'>{pct}%</Typography>
        </Box>
      )
    }}
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>Analytics</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>Event and booking insights</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Period</InputLabel>
                <Select value={period} label='Period' onChange={e => setPeriod(e.target.value)}>
                  <MenuItem value='7'>Last 7 days</MenuItem>
                  <MenuItem value='30'>Last 30 days</MenuItem>
                  <MenuItem value='90'>Last 90 days</MenuItem>
                  <MenuItem value='365'>Last year</MenuItem>
                </Select>
              </FormControl>
              <Button size='medium' variant='outlined' startIcon={<Icon icon='tabler:refresh' fontSize={18} />}
                onClick={fetch} disabled={loading}>Refresh</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}
        action={<Button size='small' color='inherit' onClick={fetch}>Retry</Button>}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Events', value: ov.totalEvents, icon: 'tabler:calendar-event', color: 'primary' },
          { title: 'Active Events', value: ov.activeEvents, icon: 'tabler:player-play', color: 'success' },
          { title: 'Bookings', value: ov.totalBookings ?? ov.totalRegistrations, icon: 'tabler:ticket', color: 'info' },
          { title: 'Revenue', value: ov.totalRevenue ?? 0, icon: 'tabler:currency-rupee', color: 'warning', prefix: '₹' },
          { title: 'New Users', value: ov.newUsers, icon: 'tabler:user-plus', color: 'primary' }
        ].map(k => (
          <Grid size={{ xs: 12, sm: 6, md: k.title === 'New Users' ? 12 : 3 }} key={k.title}
            sx={k.title === 'New Users' ? { display: { xs: 'block', sm: 'block', md: 'none' } } : {}}>
            <AdminKpiCard {...k} loading={loading} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminKpiCard title='New Users' value={ov.newUsers} icon='tabler:user-plus' color='primary' loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ boxShadow: 1 }}>
            <CardHeader title='Events by Status' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 1 }} />
            <Divider sx={{ mt: 1.5 }} />
            <CardContent sx={{ pt: 2 }}>
              {loading
                ? [1,2,3,4].map(i => <Skeleton key={i} height={36} sx={{ mb: 1 }} />)
                : !(data?.eventsByStatus || []).length
                  ? <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 2 }}>No data</Typography>
                  : (data.eventsByStatus).map(item => (
                    <Box key={item.status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <AdminStatusChip status={item.status} type='event' />
                      <Typography variant='body2' fontWeight={700}>{item.count}</Typography>
                    </Box>
                  ))
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ boxShadow: 1 }}>
            <CardHeader title='Department Stats' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 1 }} />
            <Divider sx={{ mt: 1.5 }} />
            <CustomDataGrid columns={deptCols} rows={data?.departmentStats || []} loading={loading}
              showToolbar={false} paginationMode='client'
              paginationModel={{ page: 0, pageSize: 10 }} rowCount={0} emptyText='No data.' />
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ boxShadow: 1 }}>
        <CardHeader title='Top Events' subheader='By bookings and revenue'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 1 }} />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid columns={topEventsCols} rows={data?.topEvents || []} loading={loading}
          showToolbar={false} paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }} rowCount={0} emptyText='No event data.' />
      </Card>
    </Box>
  )
}

export default AnalyticsView
