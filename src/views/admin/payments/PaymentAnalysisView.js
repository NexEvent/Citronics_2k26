/**
 * PaymentAnalysisView — Admin payment analytics
 * Shows payment transactions by users, ticket generation status,
 * revenue breakdown charts, and payment status analysis.
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import axios from 'axios'
import Icon from 'src/components/Icon'
import { CustomDataGrid, CustomChip, KPICard } from 'src/components/customComponent'
import usePermissions from 'src/hooks/usePermissions'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const fmtDate = d => {
  try { return format(new Date(d), 'dd MMM yyyy, hh:mm a') } catch { return '—' }
}
const fmtDateShort = d => {
  try { return format(new Date(d), 'dd MMM') } catch { return d }
}
const fmtCurrency = v => `₹${Number(v || 0).toLocaleString('en-IN')}`

const PaymentAnalysisView = () => {
  const router = useRouter()
  const theme = useTheme()
  const { canViewPayments } = usePermissions()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [stats, setStats] = useState(null)
  const [payments, setPayments] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('limit', '100')

      const [paymentRes, analyticsRes] = await Promise.all([
        axios.get(`/api/admin/payments?${params.toString()}`),
        axios.get('/api/admin/analytics?period=30').catch(() => ({ data: { data: null } }))
      ])

      const paymentData = paymentRes.data.data || {}
      setPayments(paymentData.payments || [])
      setStats(paymentData.stats || null)
      setAnalyticsData(analyticsRes.data.data || null)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => setSearch(searchInput.trim())
  const handleSearchKeyDown = e => { if (e.key === 'Enter') handleSearch() }

  if (!canViewPayments) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Alert severity='error'>You do not have permission to view payment data.</Alert>
      </Box>
    )
  }

  // Chart data
  const bookingTrend = analyticsData?.bookingTrend || []
  const revenueTrend = analyticsData?.revenueTrend || []
  const topEvents = analyticsData?.topEvents || []

  // Payment status distribution
  const statusCounts = {
    confirmed: stats?.successfulPayments || 0,
    pending: stats?.pendingPayments || 0,
    cancelled: stats?.failedPayments || 0
  }
  const statusData = Object.entries(statusCounts).filter(([, v]) => v > 0)

  const txnCols = [
    {
      field: 'user_name', headerName: 'User', flex: 1, minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontSize: 13, fontWeight: 700
          }}>
            {row.user_name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
            <Typography variant='body2' fontWeight={600} noWrap>{row.user_name || '—'}</Typography>
            <Typography variant='caption' color='text.secondary' noWrap>{row.user_email || ''}</Typography>
        </Box>
      )
    },
    {
      field: 'event_name', headerName: 'Event', flex: 1, minWidth: 180,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:calendar-event' fontSize={16} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
          <Typography variant='body2' fontWeight={500} noWrap>{row.event_name || '—'}</Typography>
        </Box>
      )
    },
    {
      field: 'total_amount', headerName: 'Amount', width: 120,
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={700} color='success.main'>
          {fmtCurrency(row.total_amount)}
        </Typography>
      )
    },
    {
      field: 'quantity', headerName: 'Qty', width: 70, type: 'number',
      renderCell: ({ row }) => (
        <Chip label={row.quantity || 1} size='small' variant='outlined' sx={{ fontWeight: 600, minWidth: 32 }} />
      )
    },
    {
      field: 'tickets_generated', headerName: 'Tickets', width: 130,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={`${row.tickets_generated || 0} generated, ${row.tickets_checked_in || 0} checked in`}>
            <Chip
              icon={<Icon icon='tabler:ticket' fontSize={14} />}
              label={`${row.tickets_generated || 0}${row.tickets_checked_in > 0 ? ` (${row.tickets_checked_in} in)` : ''}`}
              size='small'
              color={row.tickets_generated > 0 ? 'success' : 'default'}
              variant={row.tickets_generated > 0 ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          </Tooltip>
        </Box>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 120, sortable: false,
      renderCell: ({ row }) => <CustomChip label={row.status} type='payment' />
    },
    {
      field: 'payment_method', headerName: 'Method', width: 110,
      renderCell: ({ row }) => (
        <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'capitalize' }}>
          {row.payment_method || '—'}
        </Typography>
      )
    },
    {
      field: 'booked_at', headerName: 'Date', width: 170,
      renderCell: ({ row }) => <Typography variant='caption'>{fmtDate(row.booked_at)}</Typography>
    }
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{
        mb: 3, boxShadow: 3,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.15)}, ${alpha(theme.palette.background.paper, 0.95)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.12)}, #fff)`
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                Payments & Transactions
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                User payments, ticket generation, and revenue analysis
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size='small'
                placeholder='Search user or event...'
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:search' fontSize={18} />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput && (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => { setSearchInput(''); setSearch('') }}>
                        <Icon icon='tabler:x' fontSize={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControl size='small' sx={{ minWidth: 130 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label='Status' onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value=''>All</MenuItem>
                  <MenuItem value='confirmed'>Confirmed</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button size='medium' variant='outlined'
                startIcon={<Icon icon='tabler:refresh' fontSize={18} />}
                onClick={fetchData} disabled={loading} sx={{ borderRadius: 2 }}>
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}
          action={<Button size='small' color='inherit' onClick={fetchData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KPICard title='Total Revenue' value={stats?.totalRevenue ?? 0}
            icon='tabler:currency-rupee' color='success' prefix='₹' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Total Payments' value={stats?.totalPayments ?? 0}
            icon='tabler:credit-card' color='primary' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Tickets Generated' value={stats?.totalTickets ?? 0}
            icon='tabler:ticket' color='info' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Checked In' value={stats?.checkedInTickets ?? 0}
            icon='tabler:scan' color='warning' loading={loading} />
        </Grid>
      </Grid>

      {/* Secondary KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KPICard title='Successful' value={stats?.successfulPayments ?? 0}
            icon='tabler:circle-check' color='success' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Pending' value={stats?.pendingPayments ?? 0}
            icon='tabler:clock' color='warning' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Failed / Cancelled' value={stats?.failedPayments ?? 0}
            icon='tabler:x' color='error' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPICard title='Avg. Order Value' value={stats?.avgOrderValue ?? 0}
            icon='tabler:receipt' color='secondary' prefix='₹' loading={loading} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, height: '100%' }}>
            <CardHeader title='Revenue & Booking Trend'
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={<Chip label='Last 30 days' size='small' variant='outlined' sx={{ fontSize: 11 }} />}
              sx={{ pb: 0 }} />
            <Divider sx={{ mt: 1.5 }} />
            <CardContent>
              {bookingTrend.length > 0 ? (
                <ApexChart
                  type='line'
                  height={320}
                  options={{
                    chart: { toolbar: { show: false }, zoom: { enabled: false } },
                    xaxis: {
                      categories: revenueTrend.map(d => fmtDateShort(d.date)),
                      labels: { rotate: -45, style: { fontSize: '10px' }, rotateAlways: revenueTrend.length > 14 }
                    },
                    yaxis: [
                      { title: { text: 'Bookings', style: { fontSize: '11px' } }, labels: { style: { fontSize: '10px' } } },
                      { opposite: true, title: { text: 'Revenue (₹)', style: { fontSize: '11px' } }, labels: { formatter: v => fmtCurrency(v), style: { fontSize: '10px' } } }
                    ],
                    stroke: { curve: 'smooth', width: [3, 3] },
                    colors: [theme.palette.primary.main, theme.palette.success.main],
                    markers: { size: [3, 0], hover: { size: 5 } },
                    tooltip: { theme: theme.palette.mode, y: { formatter: (v, { seriesIndex }) => seriesIndex === 1 ? fmtCurrency(v) : `${v} bookings` } },
                    legend: { position: 'top', horizontalAlign: 'right' },
                    grid: { borderColor: alpha(theme.palette.divider, 0.5), strokeDashArray: 4 },
                    dataLabels: { enabled: false }
                  }}
                  series={[
                    { name: 'Bookings', type: 'column', data: bookingTrend.map(d => d.count) },
                    { name: 'Revenue', type: 'line', data: revenueTrend.map(d => parseFloat(d.amount || 0)) }
                  ]}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                  <Typography color='text.secondary'>No trend data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, height: '100%' }}>
            <CardHeader title='Payment Status' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} sx={{ pb: 0 }} />
            <Divider sx={{ mt: 1.5 }} />
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: 320 }}>
              {statusData.length > 0 ? (
                <>
                  <ApexChart
                    type='donut'
                    height={220}
                    width='100%'
                    options={{
                      labels: statusData.map(([s]) => s.charAt(0).toUpperCase() + s.slice(1)),
                      colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main].slice(0, statusData.length),
                      legend: { position: 'bottom', fontSize: '12px' },
                      tooltip: { theme: theme.palette.mode },
                      plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px', fontWeight: 700, formatter: () => stats?.totalPayments || 0 } } } } },
                      dataLabels: { enabled: false },
                      stroke: { width: 2, colors: [theme.palette.background.paper] }
                    }}
                    series={statusData.map(([, v]) => v)}
                  />
                  <Box sx={{ mt: 2, width: '100%' }}>
                    {statusData.map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: status === 'confirmed' ? 'success.main' : status === 'pending' ? 'warning.main' : 'error.main'
                          }} />
                          <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>{status}</Typography>
                        </Box>
                        <Typography variant='body2' fontWeight={700}>{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography color='text.secondary'>No payment data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue by Event - Horizontal Bar */}
      {topEvents.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardHeader title='Revenue by Event'
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            subheader='Top performing events by revenue'
            sx={{ pb: 0 }} />
          <Divider sx={{ mt: 1.5 }} />
          <CardContent>
            <ApexChart
              type='bar'
              height={Math.max(200, topEvents.length * 48)}
              options={{
                chart: { toolbar: { show: false } },
                plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%', distributed: true } },
                xaxis: { labels: { formatter: v => fmtCurrency(v), style: { fontSize: '10px' } } },
                yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600 }, maxWidth: 180 } },
                colors: [
                  theme.palette.primary.main, theme.palette.success.main,
                  theme.palette.info.main, theme.palette.warning.main,
                  theme.palette.secondary.main, theme.palette.error.light,
                  alpha(theme.palette.primary.main, 0.6), alpha(theme.palette.success.main, 0.6)
                ],
                tooltip: { theme: theme.palette.mode, y: { formatter: v => fmtCurrency(v) } },
                grid: { borderColor: alpha(theme.palette.divider, 0.3), strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
                dataLabels: { enabled: true, formatter: v => fmtCurrency(v), style: { fontSize: '11px', fontWeight: 600 }, offsetX: 5 },
                legend: { show: false }
              }}
              series={[{
                name: 'Revenue',
                data: topEvents.slice(0, 8).map(e => ({ x: e.name, y: parseFloat(e.revenue || 0) }))
              }]}
            />
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardHeader
          title='All Transactions'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          subheader={`${payments.length} payment${payments.length !== 1 ? 's' : ''} found`}
          sx={{ pb: 0 }}
        />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid
          columns={txnCols}
          rows={payments}
          loading={loading}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 25 }}
          rowCount={payments.length}
          emptyText='No transactions found.'
          getRowId={row => row.id}
          onRowClick={params => router.push(`/admin/events/${params.row.event_id}`)}
        />
      </Card>
    </Box>
  )
}

export default PaymentAnalysisView
