/**
 * EventListView — Admin event management list
 * Uses: CustomDataGrid, CustomChip, AddDialog from customComponent
 *       ConfirmDialog from mui, usePermissions hook
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { CustomDataGrid, CustomChip, AddDialog } from 'src/components/customComponent'
import { ConfirmDialog } from 'src/components/mui'
import usePermissions from 'src/hooks/usePermissions'

const fmtDate = d => {
  try { return format(new Date(d), 'dd MMM yyyy') } catch { return '—' }
}

/** Build fields config for AddDialog */
const getEventFields = (departments = [], isEdit = false) => {
  const fields = [
    { name: 'name', label: 'Event Name', required: true, autoFocus: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'startTime', label: 'Start Time', type: 'datetime-local', required: true, gridSize: 6 },
    { name: 'endTime', label: 'End Time', type: 'datetime-local', required: true, gridSize: 6 },
    { name: 'venue', label: 'Venue', gridSize: 6 },
    { name: 'maxTickets', label: 'Max Tickets', type: 'number', required: true, gridSize: 3 },
    { name: 'ticketPrice', label: 'Price (₹)', type: 'number', gridSize: 3, helperText: '0 = free' },
    {
      name: 'departmentId', label: 'Department', type: 'select', gridSize: isEdit ? 4 : 6,
      options: [{ value: '', label: 'None' }, ...departments.map(d => ({ value: d.id, label: d.name }))]
    },
    {
      name: 'visibility', label: 'Visibility', type: 'select', gridSize: isEdit ? 4 : 6,
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
        { value: 'college_only', label: 'College Only' },
        { value: 'invite_only', label: 'Invite Only' }
      ]
    }
  ]

  if (isEdit) {
    fields.push({
      name: 'status', label: 'Status', type: 'select', gridSize: 4,
      options: ['draft', 'published', 'active', 'cancelled', 'completed'].map(s => ({
        value: s, label: s.charAt(0).toUpperCase() + s.slice(1)
      }))
    })
  }

  return fields
}

/** Build initial form values */
const toDatetimeLocal = d => {
  try { return new Date(d || Date.now()).toISOString().slice(0, 16) } catch { return '' }
}

const buildInitialValues = event => {
  if (!event) {
    return {
      name: '', description: '',
      startTime: toDatetimeLocal(new Date()),
      endTime: toDatetimeLocal(new Date(Date.now() + 7200000)),
      venue: '', maxTickets: 100, ticketPrice: 0,
      departmentId: '', visibility: 'public'
    }
  }

  return {
    name: event.name || '', description: event.description || '',
    startTime: toDatetimeLocal(event.start_time), endTime: toDatetimeLocal(event.end_time),
    venue: event.venue || '', maxTickets: event.max_tickets ?? 100,
    ticketPrice: event.ticket_price ?? 0, departmentId: event.department_id || '',
    status: event.status || 'draft', visibility: event.visibility || 'public'
  }
}

/** Custom validation for event form */
const validateEvent = values => {
  if (!values.name?.trim()) return 'Event name is required.'
  if (!values.startTime) return 'Start time is required.'
  if (!values.endTime) return 'End time is required.'
  if (new Date(values.endTime) <= new Date(values.startTime)) return 'End time must be after start time.'
  if (!values.maxTickets || Number(values.maxTickets) < 1) return 'Max tickets must be at least 1.'
  if (Number(values.ticketPrice) < 0) return 'Price cannot be negative.'

  return null
}

const EventListView = () => {
  const router = useRouter()
  const { canCreate, canEdit, canDelete } = usePermissions()

  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 })
  const [total, setTotal] = useState(0)

  const [eventDialog, setEventDialog] = useState({ open: false, event: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, event: null })
  const [menu, setMenu] = useState({ anchor: null, row: null })

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams({ page: pagination.page + 1, limit: pagination.pageSize })
      if (statusFilter) p.set('status', statusFilter)
      const res = await axios.get(`/api/admin/events?${p}`)
      setRows(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch {
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [pagination, statusFilter])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => {
    axios.get('/api/departments').then(r => setDepartments(r.data.data || [])).catch(() => {})
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/events/${confirmDialog.event?.id}`)
      toast.success('Event deleted')
      setConfirmDialog({ open: false, event: null })
      fetchEvents()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed')
    }
  }

  const handleDialogSubmit = async values => {
    const isEdit = Boolean(eventDialog.event)
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
      venue: values.venue?.trim() || null,
      maxTickets: Number(values.maxTickets),
      ticketPrice: Number(values.ticketPrice) || 0,
      departmentId: values.departmentId || null,
      visibility: values.visibility || 'public',
      ...(isEdit && values.status ? { status: values.status } : {})
    }

    if (isEdit) {
      await axios.put(`/api/admin/events/${eventDialog.event.id}`, payload)
      toast.success('Event updated')
    } else {
      await axios.post('/api/admin/events', payload)
      toast.success('Event created')
    }

    setEventDialog({ open: false, event: null })
    fetchEvents()
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      field: 'name', headerName: 'Event', minWidth: 220,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' fontWeight={700} noWrap>{row.name}</Typography>
          {row.venue && (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Icon icon='tabler:map-pin' fontSize={11} />{row.venue}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 180, sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.status} type='event' />
    },
    {
      field: 'start_time', headerName: 'Date', width: 180,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='caption'>{fmtDate(row.start_time)}</Typography>
        </Box>
      )
    },
    {
      field: 'max_tickets', headerName: 'Capacity', minWidth: 180, type: 'number',
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={600} >
          {Number(row.max_tickets).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'ticket_price', headerName: 'Price', width: 100,
      renderCell: ({ row }) => (
        <Typography variant='body2' fontWeight={600}>
          {Number(row.ticket_price) === 0 ? 'Free' : `₹${Number(row.ticket_price).toLocaleString('en-IN')}`}
        </Typography>
      )
    },
    {
      field: 'actions', headerName: '', width: 120, sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title='View'>
            <IconButton size='small' onClick={() => router.push(`/admin/events/${row.id}`)}>
              <Icon icon='tabler:eye' fontSize={16} />
            </IconButton>
          </Tooltip>
          {canEdit('event') && (
            <Can I='update' a='event'>
              <Tooltip title='Edit'>
                <IconButton size='small' onClick={() => setEventDialog({ open: true, event: row })}>
                  <Icon icon='tabler:edit' fontSize={16} />
                </IconButton>
              </Tooltip>
            </Can>
          )}
          {canDelete('event') && (
            <Can I='delete' a='event'>
              <Tooltip title='Delete'>
                <IconButton size='small' onClick={() => setConfirmDialog({ open: true, event: row })} sx={{ color: 'error.main' }}>
                  <Icon icon='tabler:trash' fontSize={16} />
                </IconButton>
              </Tooltip>
            </Can>
          )}
        </Box>
      )
    }
  ]

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>Events</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {loading ? '...' : `${total.toLocaleString()} ${total === 1 ? 'event' : 'events'}`}
              </Typography>
            </Box>
            {canCreate('event') && (
              <Can I='create' a='event'>
                <Button variant='contained' size='small'
                  startIcon={<Icon icon='tabler:calendar-plus' fontSize={18} />}
                  onClick={() => setEventDialog({ open: true, event: null })}>
                  New Event
                </Button>
              </Can>
            )}
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters + DataGrid */}
      <Card sx={{ boxShadow: 1 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label='Status'
              onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}>
              <MenuItem value=''>All</MenuItem>
              {['draft', 'published', 'active', 'cancelled', 'completed'].map(s => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {statusFilter && (
            <Button size='small' onClick={() => setStatusFilter('')}>Clear</Button>
          )}
        </Box>
        <Divider />
        <CustomDataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          paginationMode='server'
          rowCount={total}
          emptyText='No events found. Try adjusting filters.'
          onRowClick={params => router.push(`/admin/events/${params.id}`)}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <AddDialog
        open={eventDialog.open}
        onClose={() => setEventDialog({ open: false, event: null })}
        title={eventDialog.event ? 'Edit Event' : 'New Event'}
        icon={eventDialog.event ? 'tabler:pencil' : 'tabler:calendar-plus'}
        fields={getEventFields(departments, Boolean(eventDialog.event))}
        initialValues={buildInitialValues(eventDialog.event)}
        validate={validateEvent}
        onSubmit={handleDialogSubmit}
        submitLabel={eventDialog.event ? 'Save Changes' : 'Create Event'}
        maxWidth='md'
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, event: null })}
        onConfirm={handleDelete}
        title='Delete Event'
        message={`Permanently delete "${confirmDialog.event?.name}"? This cannot be undone.`}
        confirmLabel='Delete'
        severity='error'
      />
    </Box>
  )
}

export default EventListView
