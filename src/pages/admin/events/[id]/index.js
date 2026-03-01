import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { canModify } from 'src/configs/acl'
import AdminGuard from 'src/components/guards/AdminGuard'
import AdminLayout from 'src/layouts/AdminLayout'
import AdminStatusChip from 'src/components/admin/AdminStatusChip'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── Event Detail View ─────────────────────────────────────────────────────────
const EventDetailView = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentUserRole = session?.user?.role?.toLowerCase()
  const canUserModify = canModify(currentUserRole)

  // Fetch event
  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/admin/events/${id}`)
        setEvent(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const formatDate = dateStr => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => router.push(`/admin/events/${id}/edit`)
  const handleBack = () => router.push('/admin/events')

  const handleStatusChange = async newStatus => {
    try {
      await axios.put(`/api/admin/events/${id}`, { status: newStatus })
      setEvent(prev => ({ ...prev, status: newStatus }))
      toast.success(`Event status changed to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant='outlined' onClick={handleBack}>
          Back to Events
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Button
              variant='text'
              startIcon={<Icon icon='tabler:arrow-left' />}
              onClick={handleBack}
              sx={{ ml: -1 }}
            >
              Back
            </Button>
          </Box>
          <Typography variant='h4' fontWeight={700}>
            {event?.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <AdminStatusChip status={event?.status} type='event' />
            <Chip
              label={event?.visibility}
              size='small'
              variant='outlined'
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Can I='update' a='event'>
            <Button
              variant='contained'
              startIcon={<Icon icon='tabler:edit' />}
              onClick={handleEdit}
            >
              Edit Event
            </Button>
          </Can>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Event Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='Event Details' />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Description
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 0.5 }}>
                    {event?.description || 'No description provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Start Time
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 0.5 }}>
                    {formatDate(event?.start_time)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    End Time
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 0.5 }}>
                    {formatDate(event?.end_time)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Venue
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 0.5 }}>
                    {event?.venue || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Ticket Price
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 0.5 }}>
                    {event?.ticket_price > 0 ? `₹${event.ticket_price}` : 'Free'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats & Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title='Ticket Info' />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color='text.secondary'>Max Tickets</Typography>
                <Typography fontWeight={600}>{event?.max_tickets}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary'>Price</Typography>
                <Typography fontWeight={600}>
                  {event?.ticket_price > 0 ? `₹${event.ticket_price}` : 'Free'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {canUserModify && (
            <Card>
              <CardHeader title='Quick Actions' />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {event?.status === 'draft' && (
                    <Button
                      fullWidth
                      variant='outlined'
                      color='success'
                      startIcon={<Icon icon='tabler:check' />}
                      onClick={() => handleStatusChange('published')}
                    >
                      Publish Event
                    </Button>
                  )}
                  {event?.status === 'published' && (
                    <Button
                      fullWidth
                      variant='outlined'
                      color='warning'
                      startIcon={<Icon icon='tabler:clock' />}
                      onClick={() => handleStatusChange('active')}
                    >
                      Mark as Active
                    </Button>
                  )}
                  {(event?.status === 'published' || event?.status === 'active') && (
                    <Button
                      fullWidth
                      variant='outlined'
                      color='error'
                      startIcon={<Icon icon='tabler:x' />}
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      Cancel Event
                    </Button>
                  )}
                  {event?.status === 'active' && (
                    <Button
                      fullWidth
                      variant='outlined'
                      color='info'
                      startIcon={<Icon icon='tabler:flag' />}
                      onClick={() => handleStatusChange('completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Executive notice */}
      {!canUserModify && (
        <Alert severity='info' sx={{ mt: 3 }}>
          You have <strong>read-only</strong> access as an Executive. Contact an Admin or Owner to make changes.
        </Alert>
      )}
    </Box>
  )
}

// ── Page Component ────────────────────────────────────────────────────────────
const EventDetailPage = () => {
  return <EventDetailView />
}

EventDetailPage.getLayout = page => (
  <AdminGuard>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
EventDetailPage.authGuard = false

EventDetailPage.acl = {
  action: 'read',
  subject: 'event'
}

export default EventDetailPage
