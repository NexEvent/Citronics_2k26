import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
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
import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import Icon from 'src/components/Icon'
import axios from 'axios'
import { KPICard as AdminKpiCard, CustomChip, CustomDataGrid } from 'src/components/customComponent'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const fmtCurrency = v => `₹${Number(v || 0).toLocaleString('en-IN')}`
const fmtDateShort = d => { try { return format(new Date(d), 'dd MMM') } catch { return d } }

const AnalyticsView = () => {
  const theme = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('30')
  const [data, setData] = useState(null)
  const [paymentStats, setPaymentStats] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [analyticsRes, paymentRes] = await Promise.all([
        axios.get(`/api/admin/analytics?period=${period}`),
        axios.get('/api/admin/payments?limit=1').catch(() => ({ data: { data: { stats: null } } }))
      ])
      setData(analyticsRes.data.data || analyticsRes.data)
      setPaymentStats(paymentRes.data?.data?.stats || null)
    } catch (e) { setError(e.response?.data?.error || 'Failed to load analytics') }
    finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetchAll() }, [fetchAll])

  const ov = data?.overview || {}
  const bookingTrend = data?.bookingTrend || []
  const revenueTrend = data?.revenueTrend || []
  const eventsByStatus = data?.eventsByStatus || []
  const topEvents = data?.topEvents || []
  const recentTxns = data?.recentTransactions || []

  // Calculated insights
  const totalRevenue = parseFloat(ov.totalRevenue) || 0
  const totalBookings = ov.totalBookings || 0
  const avgOrderValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0
  const totalTickets = paymentStats?.totalTickets || totalBookings
  const checkedInTickets = paymentStats?.checkedInTickets || 0
  const checkedInRate = totalTickets > 0 ? Math.round((checkedInTickets / totalTickets) * 100) : 0

  // Revenue per event
  const revenuePerEvent = topEvents.map(e => ({ name: e.name, revenue: parseFloat(e.revenue || 0), bookings: e.bookings || 0 }))
  const totalTopRevenue = revenuePerEvent.reduce((s, e) => s + e.revenue, 0)

  const periodLabel = period === '7' ? 'Last 7 days' : period === '30' ? 'Last 30 days' : period === '90' ? 'Last 90 days' : 'Last year'

  const topEventsCols = [
    {
      field: 'name', headerName: 'Event', flex: 1, minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: row.status === 'active' ? 'success.main' : row.status === 'published' ? 'info.main' : 'warning.main'
          }} />
          <Typography variant='body2' fontWeight={600} noWrap>{row.name}</Typography>
        </Box>
      )
    },
    { field: 'status', headerName: 'Status', width: 120, sortable: false, renderCell: ({ row }) => <CustomChip label={row.status} /> },
    {
      field: 'bookings', headerName: 'Tickets Sold', width: 120, type: 'number',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon='tabler:ticket' fontSize={14} style={{ color: theme.palette.primary.main }} />
          <Typography variant='body2' fontWeight={600}>{Number(row.bookings || 0).toLocaleString()}</Typography>
        </Box>
      )
    },
    {
      field: 'revenue', headerName: 'Revenue', width: 130, type: 'number',
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={700} color='success.main'>
          {fmtCurrency(row.revenue)}
        </Typography>
      )
    },
    {
      field: 'share', headerName: 'Rev. Share', width: 160, sortable: false,
      renderCell: ({ row }) => {
        const pct = totalTopRevenue > 0 ? Math.round((parseFloat(row.revenue || 0) / totalTopRevenue) * 100) : 0
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <LinearProgress
              variant='determinate'
              value={pct}
              sx={{
                flex: 1, borderRadius: 4, height: 7,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': { borderRadius: 4 }
              }}
            />
            <Typography variant='caption' fontWeight={600} sx={{ minWidth: 32 }}>{pct}%</Typography>
          </Box>
        )
      }
    }
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{
        mb: 3, boxShadow: 3,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.15)}, ${alpha(theme.palette.background.paper, 0.95)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.12)}, #fff)`
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: -0.5 }}>Analytics & Insights</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Ticket sales, revenue performance, and event insights
              </Typography>
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
              <Button size='small' variant='outlined' startIcon={<Icon icon='tabler:refresh' fontSize={18} />}
                onClick={fetchAll} disabled={loading} sx={{ borderRadius: 2 }}>Refresh</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}
        action={<Button size='small' color='inherit' onClick={fetchAll}>Retry</Button>}>{error}</Alert>}

      {/* Primary KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <AdminKpiCard title='Total Revenue' value={totalRevenue} icon='tabler:currency-rupee' color='success' prefix='₹' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <AdminKpiCard title='Tickets Sold' value={totalBookings} icon='tabler:ticket' color='primary' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <AdminKpiCard title='Avg. Order' value={avgOrderValue} icon='tabler:receipt' color='info' prefix='₹' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <AdminKpiCard title='Check-in Rate' value={`${checkedInRate}%`} icon='tabler:scan' color='warning' loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <AdminKpiCard title='New Users' value={ov.newUsers || 0} icon='tabler:user-plus' color='secondary' loading={loading} />
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Revenue & Ticket Sales Trend */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 2, height: '100%' }}>
            <CardHeader
              title='Revenue & Ticket Sales'
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={<Chip label={periodLabel} size='small' variant='outlined' sx={{ fontSize: 11 }} />}
              sx={{ pb: 0 }}
            />
            <Divider sx={{ mt: 1.5 }} />
            <CardContent>
              {bookingTrend.length > 0 ? (
                <ApexChart
                  type='line'
                  height={340}
                  options={{
                    chart: { toolbar: { show: false }, zoom: { enabled: false } },
                    xaxis: {
                      categories: bookingTrend.map(d => fmtDateShort(d.date)),
                      labels: { rotate: -45, style: { fontSize: '10px' }, rotateAlways: bookingTrend.length > 14 }
                    },
                    yaxis: [
                      { title: { text: 'Tickets Sold', style: { fontSize: '11px' } }, labels: { style: { fontSize: '10px' } } },
                      { opposite: true, title: { text: 'Revenue (₹)', style: { fontSize: '11px' } }, labels: { formatter: v => fmtCurrency(v), style: { fontSize: '10px' } } }
                    ],
                    stroke: { curve: 'smooth', width: [0, 3] },
                    colors: [theme.palette.primary.main, theme.palette.success.main],
                    fill: { type: ['solid', 'gradient'], opacity: [0.85, 1], gradient: { type: 'vertical', opacityFrom: 0.5, opacityTo: 0.05 } },
                    tooltip: {
                      theme: theme.palette.mode, shared: true,
                      y: { formatter: (v, { seriesIndex }) => seriesIndex === 1 ? fmtCurrency(v) : `${v} tickets` }
                    },
                    legend: { position: 'top', horizontalAlign: 'right' },
                    grid: { borderColor: alpha(theme.palette.divider, 0.5), strokeDashArray: 4 },
                    dataLabels: { enabled: false },
                    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } }
                  }}
                  series={[
                    { name: 'Tickets Sold', type: 'column', data: bookingTrend.map(d => d.count) },
                    { name: 'Revenue', type: 'area', data: revenueTrend.map(d => parseFloat(d.amount || 0)) }
                  ]}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 340 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Icon icon='tabler:chart-line' fontSize={48} style={{ color: theme.palette.text.disabled }} />
                    <Typography color='text.secondary' sx={{ mt: 1 }}>No trend data for this period</Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Distribution by Event */}
      {revenuePerEvent.length > 0 && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardHeader title='Revenue Distribution'
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                subheader='By event'
                sx={{ pb: 0 }} />
              <Divider sx={{ mt: 1.5 }} />
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApexChart
                  type='pie'
                  height={300}
                  width='100%'
                  options={{
                    labels: revenuePerEvent.filter(e => e.revenue > 0).map(e => e.name),
                    colors: [
                      theme.palette.primary.main, theme.palette.success.main,
                      theme.palette.info.main, theme.palette.warning.main,
                      theme.palette.secondary.main, theme.palette.error.light,
                      alpha(theme.palette.primary.main, 0.5), alpha(theme.palette.success.main, 0.5)
                    ],
                    legend: { position: 'bottom', fontSize: '11px' },
                    tooltip: { theme: theme.palette.mode, y: { formatter: v => fmtCurrency(v) } },
                    dataLabels: { enabled: true, formatter: (v) => `${Math.round(v)}%`, style: { fontSize: '11px' } },
                    stroke: { width: 2, colors: [theme.palette.background.paper] },
                    responsive: [{ breakpoint: 480, options: { chart: { height: 260 }, legend: { position: 'bottom' } } }]
                  }}
                  series={revenuePerEvent.filter(e => e.revenue > 0).map(e => e.revenue)}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardHeader title='Tickets Sold by Event'
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                sx={{ pb: 0 }} />
              <Divider sx={{ mt: 1.5 }} />
              <CardContent>
                <ApexChart
                  type='bar'
                  height={300}
                  options={{
                    chart: { toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '55%', distributed: true } },
                    xaxis: {
                      categories: revenuePerEvent.slice(0, 8).map(e => e.name),
                      labels: { rotate: -45, style: { fontSize: '10px' }, trim: true, maxHeight: 80 }
                    },
                    yaxis: { title: { text: 'Tickets', style: { fontSize: '11px' } }, labels: { style: { fontSize: '10px' } } },
                    colors: [
                      theme.palette.primary.main, theme.palette.success.main,
                      theme.palette.info.main, theme.palette.warning.main,
                      theme.palette.secondary.main, theme.palette.error.light,
                      alpha(theme.palette.primary.main, 0.5), alpha(theme.palette.success.main, 0.5)
                    ],
                    tooltip: { theme: theme.palette.mode, y: { formatter: v => `${v} tickets` } },
                    grid: { borderColor: alpha(theme.palette.divider, 0.3), strokeDashArray: 4 },
                    dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
                    legend: { show: false }
                  }}
                  series={[{ name: 'Tickets', data: revenuePerEvent.slice(0, 8).map(e => e.bookings) }]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Key Findings */}
      {!loading && totalRevenue > 0 && (
        <Card sx={{ mb: 3, boxShadow: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
          <CardHeader
            title='Key Findings'
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            avatar={<Icon icon='tabler:bulb' fontSize={22} style={{ color: theme.palette.info.main }} />}
            sx={{ pb: 0 }}
          />
          <Divider sx={{ mt: 1.5 }} />
          <CardContent>
            <Grid container spacing={2}>
              {[
                {
                  icon: 'tabler:trophy',
                  color: 'warning',
                  label: 'Top Event',
                  value: topEvents[0]?.name || '—',
                  sub: topEvents[0] ? `${fmtCurrency(topEvents[0].revenue)} · ${topEvents[0].bookings} tickets` : ''
                },
                {
                  icon: 'tabler:chart-arrows-vertical',
                  color: 'success',
                  label: 'Avg. Revenue / Event',
                  value: ov.totalEvents > 0 ? fmtCurrency(Math.round(totalRevenue / ov.totalEvents)) : '—',
                  sub: `Across ${ov.totalEvents || 0} events`
                },
                {
                  icon: 'tabler:ticket',
                  color: 'primary',
                  label: 'Avg. Tickets / Event',
                  value: ov.totalEvents > 0 ? Math.round(totalBookings / ov.totalEvents) : '—',
                  sub: `${totalBookings} total bookings`
                },
                {
                  icon: 'tabler:percentage',
                  color: 'info',
                  label: 'Conversion Rate',
                  value: ov.newUsers > 0 ? `${Math.round((totalBookings / ov.newUsers) * 100)}%` : '—',
                  sub: `${ov.newUsers || 0} new users → ${totalBookings} bookings`
                }
              ].map(item => (
                <Grid item xs={12} sm={6} md={3} key={item.label}>
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.1)}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icon icon={item.icon} fontSize={18} style={{ color: theme.palette[item.color]?.main }} />
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>{item.label}</Typography>
                    </Box>
                    <Typography variant='subtitle1' fontWeight={800} noWrap>{item.value}</Typography>
                    {item.sub && <Typography variant='caption' color='text.secondary'>{item.sub}</Typography>}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Top Events Table */}
      {/* <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader title='Top Events'
          subheader='Ranked by revenue and ticket sales'
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          action={<Button size='small' onClick={() => router.push('/admin/events')}>View All Events</Button>}
          sx={{ pb: 0 }} />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid
          columns={topEventsCols}
          rows={topEvents}
          loading={loading}
          showToolbar={false}
          paginationMode='client'
          paginationModel={{ page: 0, pageSize: 10 }}
          rowCount={topEvents.length}
          emptyText='No event data available.'
          onRowClick={params => router.push(`/admin/events/${params.id}`)}
        />
      </Card> */}

      {/* Recent Transactions */}
      {recentTxns.length > 0 && (
        <Card sx={{ boxShadow: 2 }}>
          <CardHeader title='Recent Transactions'
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            action={<Button size='small' onClick={() => router.push('/admin/payments')}>View All</Button>}
            sx={{ pb: 0 }} />
          <Divider sx={{ mt: 1.5 }} />
          <CustomDataGrid
            columns={[
              {
                field: 'user_name', headerName: 'User', flex: 1, minWidth: 180,
                renderCell: ({ row }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'primary.main'
                    }}>{row.user_name?.[0]?.toUpperCase() ?? 'U'}</Box>
                      <Typography variant='body2' fontWeight={600} noWrap>{row.user_name}</Typography>
                      <Typography variant='caption' color='text.secondary' noWrap>{row.user_email}</Typography>
                  </Box>
                )
              },
              {
                field: 'event_name', headerName: 'Event', flex: 1, minWidth: 160,
                renderCell: ({ row }) => <Typography variant='body2' noWrap>{row.event_name}</Typography>
              },
              {
                field: 'total_amount', headerName: 'Amount', width: 120,
                renderCell: ({ row }) => (
                  <Typography variant='body2' fontWeight={700} color='success.main'>
                    {fmtCurrency(row.total_amount)}
                  </Typography>
                )
              },
              { field: 'status', headerName: 'Status', width: 120, renderCell: ({ row }) => <CustomChip label={row.status} type='payment' /> },
              {
                field: 'created_at', headerName: 'Date', width: 110,
                renderCell: ({ row }) => <Typography variant='caption'>{fmtDateShort(row.created_at)}</Typography>
              }
            ]}
            rows={recentTxns}
            loading={loading}
            showToolbar={false}
            paginationMode='client'
            paginationModel={{ page: 0, pageSize: 10 }}
            rowCount={recentTxns.length}
            emptyText='No transactions yet.'
          />
        </Card>
      )}
    </Box>
  )
}

export default AnalyticsView
