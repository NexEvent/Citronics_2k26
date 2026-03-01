import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
import Avatar from '@mui/material/Avatar'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { isOwner } from 'src/configs/acl'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminStatusChip from 'src/components/admin/AdminStatusChip'
import CustomDataGrid from 'src/components/admin/CustomDataGrid'
import AdminUserDialog from 'src/components/admin/AdminUserDialog'
import AdminConfirmDialog from 'src/components/admin/AdminConfirmDialog'

const AdminUsersView = () => {
  const { data: session } = useSession()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 })
  const [total, setTotal] = useState(0)
  const [userDialog, setUserDialog] = useState({ open: false, user: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null })
  const [menu, setMenu] = useState({ anchor: null, row: null })

  const userRole = session?.user?.role?.toLowerCase() || ''
  const ownerView = isOwner(userRole)

  const fetch = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams({ page: pagination.page + 1, limit: pagination.pageSize })
      if (search) p.set('search', search)
      if (roleFilter) p.set('role', roleFilter)
      const res = await axios.get(`/api/admin/users?${p}`)
      setRows(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { setError('Failed to load users.') }
    finally { setLoading(false) }
  }, [pagination, search, roleFilter])

  useEffect(() => { const t = setTimeout(fetch, search ? 350 : 0); return () => clearTimeout(t) }, [fetch, search])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/users/${confirmDialog.user?.id}`)
      toast.success('User deleted')
      setConfirmDialog({ open: false, user: null }); fetch()
    } catch (e) { toast.error(e.response?.data?.error || 'Delete failed') }
  }

  const columns = [
    { field: 'name', headerName: 'User', flex: 1, minWidth: 220, renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
          {row.name?.[0]?.toUpperCase() ?? 'U'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='body2' fontWeight={700} noWrap>{row.name}</Typography>
          <Typography variant='caption' color='text.secondary' noWrap>{row.email}</Typography>
        </Box>
      </Box>
    )},
    { field: 'role', headerName: 'Role', width: 130, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.role} type='role' /> },
    { field: 'verified', headerName: 'Status', width: 120, sortable: false, renderCell: ({ row }) => <AdminStatusChip status={row.email_verified ?? row.verified} type='verified' /> },
    { field: 'department_name', headerName: 'Dept', width: 120, renderCell: ({ row }) => (
      <Typography variant='caption' color='text.secondary'>{row.department_name || '—'}</Typography>
    )},
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: ({ row }) => (
      <Tooltip title='Actions'>
        <IconButton size='small' onClick={e => setMenu({ anchor: e.currentTarget, row })}>
          <Icon icon='tabler:dots-vertical' fontSize={16} />
        </IconButton>
      </Tooltip>
    )}
  ]

  const roleFilters = ownerView
    ? ['owner','admin','executive','organizer','student']
    : ['executive','organizer','student']

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>Users</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {loading ? '...' : `${total.toLocaleString()} ${total === 1 ? 'user' : 'users'}`}
              </Typography>
            </Box>
            <Can I='create' a='user'>
              <Button variant='contained' size='small' startIcon={<Icon icon='tabler:user-plus' fontSize={18} />}
                onClick={() => setUserDialog({ open: true, user: null })}>Add User</Button>
            </Can>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ boxShadow: 1 }}>
        <CardHeader sx={{ pb: 1 }}
          title={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size='small' placeholder='Search users…' value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}
                sx={{ flex: 1, minWidth: 180 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Icon icon='tabler:search' fontSize={16} /></InputAdornment>,
                  endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><Icon icon='tabler:x' fontSize={14} /></IconButton></InputAdornment> : null
                }} />
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Role</InputLabel>
                <Select value={roleFilter} label='Role' onChange={e => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}>
                  <MenuItem value=''>All</MenuItem>
                  {roleFilters.map(r => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
                </Select>
              </FormControl>
              {(search || roleFilter) && <Button size='small' onClick={() => { setSearch(''); setRoleFilter('') }}>Clear</Button>}
            </Box>
          }
        />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid columns={columns} rows={rows} loading={loading} showToolbar={false}
          paginationModel={pagination} onPaginationModelChange={setPagination}
          paginationMode='server' rowCount={total} emptyText='No users found.' />
      </Card>

      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, row: null })}
        PaperProps={{ sx: { minWidth: 150, boxShadow: 3 } }}>
        <Can I='update' a='user'>
          <MenuItem onClick={() => { setUserDialog({ open: true, user: menu.row }); setMenu({ anchor: null, row: null }) }}>
            <Icon icon='tabler:edit' fontSize={16} style={{ marginRight: 8 }} />Edit
          </MenuItem>
        </Can>
        <Can I='delete' a='user'>
          <Divider />
          <MenuItem onClick={() => { setConfirmDialog({ open: true, user: menu.row }); setMenu({ anchor: null, row: null }) }}
            sx={{ color: 'error.main' }}>
            <Icon icon='tabler:trash' fontSize={16} style={{ marginRight: 8 }} />Delete
          </MenuItem>
        </Can>
      </Menu>

      <AdminUserDialog open={userDialog.open} onClose={() => setUserDialog({ open: false, user: null })}
        onSuccess={() => { setUserDialog({ open: false, user: null }); fetch() }}
        user={userDialog.user} currentUserRole={userRole} />

      <AdminConfirmDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null })}
        onConfirm={handleDelete} title='Delete User'
        message={`Permanently delete "${confirmDialog.user?.name}"?`}
        confirmText='Delete' confirmColor='error' />
    </Box>
  )
}

export default AdminUsersView
