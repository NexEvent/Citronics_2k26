import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'
import Icon from 'src/components/Icon'

const toInputDT = d => new Date(d).toISOString().slice(0, 16)

const AdminCreateEventPage = () => {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    startTime: toInputDT(new Date()),
    endTime: toInputDT(new Date(Date.now() + 2 * 60 * 60 * 1000)),
    venue: '',
    maxTickets: 100,
    ticketPrice: 0,
    departmentId: '',
    visibility: 'public'
  })

  useEffect(() => {
    axios.get('/api/departments').then(r => setDepartments(r.data.data || [])).catch(() => {})
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    if (!form.name.trim()) return 'Event name is required.'
    if (!form.startTime || !form.endTime) return 'Start and end times are required.'
    if (new Date(form.endTime) <= new Date(form.startTime)) return 'End time must be after start time.'
    if (!form.maxTickets || Number(form.maxTickets) < 1) return 'Max tickets must be at least 1.'
    if (Number(form.ticketPrice) < 0) return 'Ticket price cannot be negative.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        venue: form.venue.trim() || null,
        maxTickets: Number(form.maxTickets),
        ticketPrice: Number(form.ticketPrice),
        departmentId: form.departmentId || null,
        visibility: form.visibility
      }

      const res = await axios.post('/api/admin/events', payload)
      toast.success('Event created successfully!')
      router.push(`/admin/events/${res.data.data?.id || ''}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href='/admin/dashboard' underline='hover' color='inherit' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon='tabler:layout-dashboard' fontSize={16} />
          Dashboard
        </Link>
        <Link href='/admin/events' underline='hover' color='inherit'>
          Events
        </Link>
        <Typography color='text.primary'>Create</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h4' fontWeight={700}>
            Create New Event
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Fill in the details below to create and publish a new event.
          </Typography>
        </Box>
        <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => router.push('/admin/events')}>
          Back to Events
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title='Event Details'
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                avatar={<Icon icon='tabler:info-circle' fontSize={20} />}
              />
              <Divider />
              <CardContent>
                {error && (
                  <Alert severity='error' onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Event Name *' value={form.name}
                      onChange={e => set('name', e.target.value)} autoFocus disabled={loading}
                      placeholder='e.g. Annual Technical Symposium 2026'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Description' multiline minRows={4} maxRows={8}
                      value={form.description} onChange={e => set('description', e.target.value)}
                      disabled={loading} placeholder='Describe the event in detail…'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Venue' value={form.venue}
                      onChange={e => set('venue', e.target.value)} disabled={loading}
                      placeholder='e.g. Main Auditorium, Block A'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='tabler:map-pin' fontSize={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Schedule */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title='Schedule'
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                avatar={<Icon icon='tabler:clock' fontSize={20} />}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Start Time *' type='datetime-local'
                      value={form.startTime} onChange={e => set('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }} disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='End Time *' type='datetime-local'
                      value={form.endTime} onChange={e => set('endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }} disabled={loading}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tickets & Settings */}
            <Card>
              <CardHeader
                title='Tickets & Settings'
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                avatar={<Icon icon='tabler:ticket' fontSize={20} />}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Max Tickets *' type='number' value={form.maxTickets}
                      onChange={e => set('maxTickets', e.target.value)} inputProps={{ min: 1 }}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='tabler:ticket' fontSize={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label='Ticket Price' type='number' value={form.ticketPrice}
                      onChange={e => set('ticketPrice', e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }} disabled={loading}
                      helperText='Set to 0 for a free event'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>₹</InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth disabled={loading}>
                      <InputLabel>Department</InputLabel>
                      <Select value={form.departmentId} label='Department' onChange={e => set('departmentId', e.target.value)}>
                        <MenuItem value=''>None / General</MenuItem>
                        {departments.map(d => (
                          <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth disabled={loading}>
                      <InputLabel>Visibility</InputLabel>
                      <Select value={form.visibility} label='Visibility' onChange={e => set('visibility', e.target.value)}>
                        <MenuItem value='public'>Public</MenuItem>
                        <MenuItem value='college_only'>College Only</MenuItem>
                        <MenuItem value='private'>Private</MenuItem>
                        <MenuItem value='invite_only'>Invite Only</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant='outlined' onClick={() => router.push('/admin/events')} disabled={loading}>
                Cancel
              </Button>
              <Button
                type='submit' variant='contained' disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:calendar-plus' />}
                size='large'
              >
                {loading ? 'Creating…' : 'Create Event'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

AdminCreateEventPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AdminCreateEventPage.authGuard = false
AdminCreateEventPage.acl = { action: 'create', subject: 'event' }

export default AdminCreateEventPage
