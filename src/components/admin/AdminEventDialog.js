/**
 * AdminEventDialog — Create / Edit event
 * Props: open, onClose, onSuccess(event), event(null=create), departments[]
 */
import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/components/Icon'

const toDT = d => { try { return new Date(d || Date.now()).toISOString().slice(0, 16) } catch { return '' } }
const EMPTY = {
  name: '', description: '', startTime: toDT(new Date()), endTime: toDT(new Date(Date.now() + 7200000)),
  venue: '', maxTickets: 100, ticketPrice: 0, departmentId: '', status: 'draft', visibility: 'public'
}

export default function AdminEventDialog({ open = false, onClose, onSuccess, event = null, departments = [] }) {
  const isEdit = Boolean(event)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(event ? {
      name: event.name || '', description: event.description || '',
      startTime: toDT(event.start_time), endTime: toDT(event.end_time),
      venue: event.venue || '', maxTickets: event.max_tickets ?? 100,
      ticketPrice: event.ticket_price ?? 0, departmentId: event.department_id || '',
      status: event.status || 'draft', visibility: event.visibility || 'public'
    } : { ...EMPTY, startTime: toDT(new Date()), endTime: toDT(new Date(Date.now() + 7200000)) })
  }, [open, event])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    if (!form.name.trim()) return 'Event name is required.'
    if (!form.startTime) return 'Start time is required.'
    if (!form.endTime) return 'End time is required.'
    if (new Date(form.endTime) <= new Date(form.startTime)) return 'End time must be after start time.'
    if (!form.maxTickets || Number(form.maxTickets) < 1) return 'Max tickets must be at least 1.'
    if (Number(form.ticketPrice) < 0) return 'Price cannot be negative.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate(); if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const payload = {
        name: form.name.trim(), description: form.description.trim() || null,
        startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(),
        venue: form.venue.trim() || null, maxTickets: Number(form.maxTickets),
        ticketPrice: Number(form.ticketPrice), departmentId: form.departmentId || null,
        status: form.status, visibility: form.visibility
      }
      const res = isEdit
        ? await axios.put(`/api/admin/events/${event.id}`, payload)
        : await axios.post('/api/admin/events', payload)
      toast.success(isEdit ? 'Event updated' : 'Event created')
      onSuccess?.(res.data.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} event`)
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='md' fullWidth
      PaperProps={{ sx: { borderRadius: 2, m: { xs: 1, sm: 2 } } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ py: 2, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon={isEdit ? 'tabler:pencil' : 'tabler:calendar-plus'} fontSize={20} />
              <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1 }}>
                {isEdit ? 'Edit Event' : 'New Event'}
              </Typography>
            </Box>
            <IconButton onClick={onClose} disabled={loading} size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='tabler:x' fontSize={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label='Event Name *' value={form.name}
                onChange={e => set('name', e.target.value)} disabled={loading} autoFocus={!isEdit} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} maxRows={5} label='Description'
                value={form.description} onChange={e => set('description', e.target.value)} disabled={loading} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type='datetime-local' label='Start Time *' value={form.startTime}
                onChange={e => set('startTime', e.target.value)} InputLabelProps={{ shrink: true }} disabled={loading} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type='datetime-local' label='End Time *' value={form.endTime}
                onChange={e => set('endTime', e.target.value)} InputLabelProps={{ shrink: true }} disabled={loading} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Venue' value={form.venue}
                onChange={e => set('venue', e.target.value)} disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:map-pin' fontSize={16} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth type='number' label='Max Tickets *' value={form.maxTickets}
                onChange={e => set('maxTickets', e.target.value)} inputProps={{ min: 1 }} disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:ticket' fontSize={16} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth type='number' label='Price (₹)' value={form.ticketPrice}
                onChange={e => set('ticketPrice', e.target.value)} inputProps={{ min: 0, step: '0.01' }}
                helperText='0 = free' disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position='start'>₹</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={isEdit ? 4 : 6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Department</InputLabel>
                <Select value={form.departmentId} label='Department' onChange={e => set('departmentId', e.target.value)}>
                  <MenuItem value=''>None</MenuItem>
                  {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={isEdit ? 4 : 6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Visibility</InputLabel>
                <Select value={form.visibility} label='Visibility' onChange={e => set('visibility', e.target.value)}>
                  <MenuItem value='public'>Public</MenuItem>
                  <MenuItem value='private'>Private</MenuItem>
                  <MenuItem value='college_only'>College Only</MenuItem>
                  <MenuItem value='invite_only'>Invite Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {isEdit && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label='Status' onChange={e => set('status', e.target.value)}>
                    {['draft','published','active','cancelled','completed'].map(s =>
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} variant='outlined' size='medium'>Cancel</Button>
          <Button type='submit' variant='contained' size='medium' disabled={loading}
            startIcon={loading ? <CircularProgress size={14} color='inherit' /> : <Icon icon={isEdit ? 'tabler:device-floppy' : 'tabler:plus'} fontSize={16} />}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
