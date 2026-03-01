import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { format } from 'date-fns'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { canModify } from 'src/configs/acl'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminStatusChip from 'src/components/admin/AdminStatusChip'
import CustomDataGrid from 'src/components/admin/CustomDataGrid'
import AdminEventDialog from 'src/components/admin/AdminEventDialog'
import AdminConfirmDialog from 'src/components/admin/AdminConfirmDialog'

const fmtDate = d => { try { return format(new Date(d), 'dd MMM yyyy') } catch { return '—' } }

const AdminEventsView = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 })
  const [total, setTotal] = useState(0)
  const [eventDialog, setEventDialog] = useState({ open: false, event: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, event: null })
  const [menu, setMenu] = useState({ anchor: null, row: null })

  const userRole = session?.user?.role?.toLowerCase() || ''

  const fetch = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams({ page: pagination.page + 1, limit: pagination.pageSize })
      if (search) p.set('search', search)
      if (statusFilter) p.set('status', statusFilter)
      const res = await axios.get(`/api/admin/events?${p}`)
      setRows(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { setError('Failed to load events.') }
    finally { setLoading(false) }
  }, [pagination, search, statusFilter])

  useEffect(() => { const t = setTimeout(fetch, search ? 350 : 0); return () => clearTimeout(t) }, [fetch, search])
  useEffect(() => { axios.get('/api/departments').then(r => setDepartments(r.data.data || [])).catch(() => {}) }, [])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/events/${confirmDialog.event?.id}`)
      toast.success('Event deleted')
      setConfirmDialog({ open: false, event: null }); fetch()
    } catch (e) { toast.error(e.response?.data?.error || 'Delete failed') }
  }

  const columns = [
    { field: 'name', headerName: 'Event', flex: 1, minWidth: 220, renderCell: ({ row }) => (
      <Box>
        <Typography variant='body2' fontWeight={700} noWrap>{row.name}</Typography>
        {row.venue && (
          <Typography variant='caption' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Icon icon='tabler:map-pin' fontSize={11} />{row.venue}
          </Typography>
        )}
      </Box>
    )},
    { field: 'status', headerName: 'Status', width: 130, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.status} type='event' /> },
    { field: 'start_time', headerName: 'Date', width: 130, renderCell: ({ row }) => (
      <Box>
        <Typography variant='caption'>{fmtDate(row.start_time)}</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>{fmtDate(row.end_time)}</Typography>
      </Box>
    )},
    { field: 'max_tickets', headerName: 'Capacity', width: 100, type: 'number', renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={600}>{Number(row.max_tickets).toLocaleString()}</Typography>
    )},
    { field: 'ticket_price', headerName: 'Price', width: 100, renderCell: ({ row }) => (
      <Typography variant='body2' fontWeight={600}>
        {Number(row.ticket_price) === 0 ? 'Free' : `₹${Number(row.ticket_price).toLocaleString('en-IN')}`}
      </Typography>
    )},
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: ({ row }) => (
      <Tooltip title='Actions'>
        <IconButton size='small' onClick={e => setMenu({ anchor: e.currentTarget, row })}>
          <Icon icon='tabler:dots-vertical' fontSize={16} />
        </IconButton>
      </Tooltip>
    )}
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>Events</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {loading ? '...' : `${total.toLocaleString()} ${total === 1 ? 'event' : 'events'}`}
              </Typography>
            </Box>
            <Can I='create' a='event'>
              <Button variant='contained' size='small' startIcon={<Icon icon='tabler:calendar-plus' fontSize={18} />}
                onClick={() => setEventDialog({ open: true, event: null })}>New Event</Button>
            </Can>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ boxShadow: 1 }}>
        <CardHeader sx={{ pb: 1 }}
          title={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size='small' placeholder='Search events…' value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}
                sx={{ flex: 1, minWidth: 180 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Icon icon='tabler:search' fontSize={16} /></InputAdornment>,
                  endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><Icon icon='tabler:x' fontSize={14} /></IconButton></InputAdornment> : null
                }} />
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label='Status' onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}>
                  <MenuItem value=''>All</MenuItem>
                  {['draft','published','active','cancelled','completed'].map(s => (
                    <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(search || statusFilter) && <Button size='small' onClick={() => { setSearch(''); setStatusFilter('') }}>Clear</Button>}
            </Box>
          }
        />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid columns={columns} rows={rows} loading={loading} showToolbar={false}
          paginationModel={pagination} onPaginationModelChange={setPagination}
          paginationMode='server' rowCount={total} emptyText='No events found. Try adjusting filters.' />
      </Card>

      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, row: null })}
        PaperProps={{ sx: { minWidth: 150, boxShadow: 3 } }}>
        <MenuItem onClick={() => { router.push(`/admin/events/${menu.row?.id}`); setMenu({ anchor: null, row: null }) }}>
          <Icon icon='tabler:eye' fontSize={16} style={{ marginRight: 8 }} />View
        </MenuItem>
        <Can I='update' a='event'>
          <MenuItem onClick={() => { setEventDialog({ open: true, event: menu.row }); setMenu({ anchor: null, row: null }) }}>
            <Icon icon='tabler:edit' fontSize={16} style={{ marginRight: 8 }} />Edit
          </MenuItem>
        </Can>
        <Can I='delete' a='event'>
          <Divider />
          <MenuItem onClick={() => { setConfirmDialog({ open: true, event: menu.row }); setMenu({ anchor: null, row: null }) }}
            sx={{ color: 'error.main' }}>
            <Icon icon='tabler:trash' fontSize={16} style={{ marginRight: 8 }} />Delete
          </MenuItem>
        </Can>
      </Menu>

      <AdminEventDialog open={eventDialog.open} onClose={() => setEventDialog({ open: false, event: null })}
        onSuccess={() => { setEventDialog({ open: false, event: null }); fetch() }}
        event={eventDialog.event} departments={departments} />

      <AdminConfirmDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, event: null })}
        onConfirm={handleDelete} title='Delete Event'
        message={`Permanently delete "${confirmDialog.event?.name}"? This cannot be undone.`}
        confirmText='Delete' confirmColor='error' />
    </Box>
  )
}

export default AdminEventsView
