import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from 'src/components/Icon'
import { canModify } from 'src/configs/acl'
import AdminGuard from 'src/components/guards/AdminGuard'
import AdminLayout from 'src/layouts/AdminLayout'
import axios from 'axios'
import toast from 'react-hot-toast'

const toLocalInput = dateStr => {
  if (!dateStr) return ''
  try { return new Date(dateStr).toISOString().slice(0, 16) } catch { return '' }
}

const EditEventPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query

  const [event, setEvent] = useState(null)
  const [departments, setDepartments] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', description: '', venue: '',
    startTime: '', endTime: '',
    maxTickets: '', ticketPrice: '',
    departmentId: '', status: 'draft', visibility: 'public'
  })
  const [formErrors, setFormErrors] = useState({})

  const userRole = session?.user?.role?.toLowerCase() || ''
  const canEdit = canModify(userRole)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setPageLoading(true)
      try {
        const [evRes, deptRes] = await Promise.all([
          axios.get(`/api/admin/events/${id}`),
          axios.get('/api/departments').catch(() => ({ data: { data: [] } }))
        ])
        const ev = evRes.data.data || evRes.data
        setEvent(ev)
        setDepartments(deptRes.data.data || [])
        setForm({
          name: ev.name || '',
          description: ev.description || '',
          venue: ev.venue || '',
          startTime: toLocalInput(ev.start_time),
          endTime: toLocalInput(ev.end_time),
          maxTickets: ev.max_tickets ?? '',
          ticketPrice: ev.ticket_price ?? '',
          departmentId: ev.department_id || '',
          status: ev.status || 'draft',
          visibility: ev.visibility || 'public'
        })
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load event.')
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [id])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Event name is required'
    if (!form.startTime) errs.startTime = 'Start date/time is required'
    if (!form.endTime) errs.endTime = 'End date/time is required'
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      errs.endTime = 'End must be after start'
    }
    if (!form.maxTickets || isNaN(form.maxTickets) || Number(form.maxTickets) < 1) {
      errs.maxTickets = 'Enter a valid ticket capacity (min 1)'
    }
    if (form.ticketPrice === '' || isNaN(form.ticketPrice) || Number(form.ticketPrice) < 0) {
      errs.ticketPrice = 'Enter a valid price (0 for free)'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true); setError('')
    try {
      await axios.put(`/api/admin/events/${id}`, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        venue: form.venue.trim() || null,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        maxTickets: parseInt(form.maxTickets, 10),
        ticketPrice: parseFloat(form.ticketPrice) || 0,
        departmentId: form.departmentId || null,
        status: form.status,
        visibility: form.visibility
      })
      toast.success('Event updated successfully!')
      router.push(`/admin/events/${id}`)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update event.')
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) {
    return (
      <Box sx={{ px: 4, py: 3 }}>
        <Alert severity='error'>You do not have permission to edit events.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component='button' variant='body2' onClick={() => router.push('/admin/dashboard')}
          sx={{ cursor: 'pointer', textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
          Dashboard
        </Link>
        <Link component='button' variant='body2' onClick={() => router.push('/admin/events')}
          sx={{ cursor: 'pointer', textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
          Events
        </Link>
        <Typography variant='body2' color='text.primary'>Edit</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h5' fontWeight={800}>Edit Event</Typography>
          {event && <Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: 400 }}>{event.name}</Typography>}
        </Box>
        <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />}
          onClick={() => router.push(`/admin/events/${id}`)}>
          Back
        </Button>
      </Box>

      {error && <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left column – main details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title='Event Details' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth label='Event Name' required value={form.name}
                      onChange={handleChange('name')} error={!!formErrors.name} helperText={formErrors.name}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {pageLoading ? <Skeleton height={96} /> : (
                    <TextField
                      fullWidth multiline rows={3} label='Description (optional)'
                      value={form.description} onChange={handleChange('description')}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth label='Venue / Location (optional)' value={form.venue}
                      onChange={handleChange('venue')}
                      InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:map-pin' fontSize={16} /></InputAdornment> }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <FormControl fullWidth>
                      <InputLabel>Department (optional)</InputLabel>
                      <Select value={form.departmentId} label='Department (optional)' onChange={handleChange('departmentId')}>
                        <MenuItem value=''>None</MenuItem>
                        {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <FormControl fullWidth>
                      <InputLabel>Visibility</InputLabel>
                      <Select value={form.visibility} label='Visibility' onChange={handleChange('visibility')}>
                        <MenuItem value='public'>Public</MenuItem>
                        <MenuItem value='private'>Private</MenuItem>
                        <MenuItem value='unlisted'>Unlisted</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title='Schedule' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth type='datetime-local' label='Start Date & Time' required
                      value={form.startTime} onChange={handleChange('startTime')}
                      error={!!formErrors.startTime} helperText={formErrors.startTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth type='datetime-local' label='End Date & Time' required
                      value={form.endTime} onChange={handleChange('endTime')}
                      error={!!formErrors.endTime} helperText={formErrors.endTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column – tickets & status */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title='Tickets & Pricing' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth type='number' label='Max Tickets' required
                      value={form.maxTickets} onChange={handleChange('maxTickets')}
                      error={!!formErrors.maxTickets} helperText={formErrors.maxTickets}
                      inputProps={{ min: 1 }}
                      InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:ticket' fontSize={16} /></InputAdornment> }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {pageLoading ? <Skeleton height={56} /> : (
                    <TextField
                      fullWidth type='number' label='Ticket Price (₹)'
                      value={form.ticketPrice} onChange={handleChange('ticketPrice')}
                      error={!!formErrors.ticketPrice} helperText={formErrors.ticketPrice || '0 = free event'}
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{ startAdornment: <InputAdornment position='start'>₹</InputAdornment> }}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title='Status' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <Divider />
            <CardContent>
              {pageLoading ? <Skeleton height={56} /> : (
                <FormControl fullWidth>
                  <InputLabel>Event Status</InputLabel>
                  <Select value={form.status} label='Event Status' onChange={handleChange('status')}>
                    {['draft', 'published', 'active', 'cancelled', 'completed'].map(s => (
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </CardContent>
            <Divider />
            <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'flex-end', gap: 1 }}>
              <Button variant='outlined' onClick={() => router.push(`/admin/events/${id}`)} disabled={saving}>
                Cancel
              </Button>
              <Button variant='contained' onClick={handleSubmit} disabled={saving || pageLoading}
                startIcon={saving ? null : <Icon icon='tabler:device-floppy' />}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

EditEventPage.getLayout = page => (
  <AdminGuard>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)

export default EditEventPage
