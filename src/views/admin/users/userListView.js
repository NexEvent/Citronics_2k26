/**
 * UserListView — Displays users in CustomDataGrid with filter options
 *
 * Clicking a user navigates to UserDetailView.
 * Owner: Full CRUD. Admin: View-only + send tickets.
 */
import { useState, useEffect, useCallback } from 'react'
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
import Avatar from '@mui/material/Avatar'
import Icon from 'src/components/Icon'
import Can from 'src/layouts/components/acl/Can'
import { ConfirmDialog } from 'src/components/mui'
import { CustomDataGrid, CustomChip, AddDialog } from 'src/components/customComponent'
import usePermissions from 'src/hooks/usePermissions'
import axios from 'axios'
import toast from 'react-hot-toast'

const ROLES = {
  owner: [
    { value: 'admin', label: 'Admin' }
  ],
  admin: []
}

const getUserFields = (isEdit, roles) => [
  { name: 'name', label: 'Full Name', required: true, icon: 'tabler:user' },
  { name: 'phone', label: 'Phone', icon: 'tabler:phone' },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    icon: 'tabler:mail',
    disabled: isEdit,
    helperText: isEdit ? 'Email cannot be changed' : ''
  },
  {
    name: 'password',
    label: isEdit ? 'New Password (leave blank to keep)' : 'Password',
    type: 'password',
    required: !isEdit,
    icon: 'tabler:lock',
    minLength: 8
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: roles.length > 0 ? roles : [{ value: 'admin', label: 'Admin' }],
    helperText: roles.length === 0 ? 'You do not have permission to change this role.' : ''
  }
]

const UserListView = () => {
  const router = useRouter()
  const { isOwner, role: userRole } = usePermissions()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 })
  const [total, setTotal] = useState(0)
  const [addDialog, setAddDialog] = useState({ open: false, user: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null })
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const roles = ROLES[userRole] || []

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams({ page: pagination.page + 1, limit: pagination.pageSize })
      if (search) p.set('search', search)
      if (roleFilter) p.set('role', roleFilter)
      const res = await axios.get(`/api/admin/users?${p}`)
      setRows(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [pagination, search, roleFilter])

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 350 : 0)

    return () => clearTimeout(t)
  }, [fetchUsers, search])

  const handleAddSubmit = async (formData) => {
    setAddLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {})
      }

      const isEdit = Boolean(addDialog.user)

      if (isEdit) {
        await axios.put(`/api/admin/users/${addDialog.user.id}`, payload)
        toast.success('User updated')
      } else {
        await axios.post('/api/admin/users', payload)
        toast.success('User created')
      }

      setAddDialog({ open: false, user: null })
      fetchUsers()
    } catch (e) {
      throw e
    } finally {
      setAddLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await axios.delete(`/api/admin/users/${confirmDialog.user?.id}`)
      toast.success('User deleted')
      setConfirmDialog({ open: false, user: null })
      fetchUsers()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const roleFilters = isOwner
    ? ['owner', 'admin', 'organizer', 'student']
    : ['organizer', 'student']

  const columns = [
    {
      field: 'name',
      headerName: 'User',
      minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
            {row.name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
            <Typography variant='body2' fontWeight={700} noWrap>
              {row.name}
            </Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: ({ row }) => (
        <Typography variant='body2' color='text.secondary' noWrap>
          {row.email}
        </Typography>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 180,
      sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.role} type='role' />
    },
    {
      field: 'verified',
      headerName: 'Status',
      width: 230,
      sortable: false,
      renderCell: ({ row }) => <CustomChip status={row.email_verified ?? row.verified} type='verified' />
    },
    {
      field: 'department_name',
      headerName: 'Dept',
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant='caption' color='text.secondary'>
          {row.department_name || '—'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Can I='update' a='user'>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => setAddDialog({ open: true, user: row })}>
                <Icon icon='tabler:edit' fontSize={16} />
              </IconButton>
            </Tooltip>
          </Can>
          <Can I='delete' a='user'>
            <Tooltip title='Delete'>
              <IconButton size='small' onClick={() => setConfirmDialog({ open: true, user: row })} sx={{ color: 'error.main' }}>
                <Icon icon='tabler:trash' fontSize={16} />
              </IconButton>
            </Tooltip>
          </Can>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' fontWeight={800}>
                Users
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {loading ? '...' : `${total.toLocaleString()} ${total === 1 ? 'user' : 'users'}`}
              </Typography>
            </Box>
            <Can I='create' a='user'>
              <Button
                variant='contained'
                size='small'
                startIcon={<Icon icon='tabler:user-plus' fontSize={18} />}
                onClick={() => setAddDialog({ open: true, user: null })}
              >
                Add User
              </Button>
            </Can>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Data Table */}
      <Card sx={{ boxShadow: 1 }}>
        <CardHeader
          sx={{ pb: 1 }}
          title={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                placeholder='Search users…'
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}
                sx={{ flex: 1, minWidth: 180 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:search' fontSize={16} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setSearch('')}>
                        <Icon icon='tabler:x' fontSize={14} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label='Role'
                  onChange={e => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 0 })) }}
                >
                  <MenuItem value=''>All</MenuItem>
                  {roleFilters.map(r => (
                    <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(search || roleFilter) && (
                <Button size='small' onClick={() => { setSearch(''); setRoleFilter('') }}>
                  Clear
                </Button>
              )}
            </Box>
          }
        />
        <Divider sx={{ mt: 1.5 }} />
        <CustomDataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          showToolbar={false}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          paginationMode='server'
          rowCount={total}
          emptyText='No users found.'
        />
      </Card>

      {/* Add/Edit User Dialog */}
      <AddDialog
        open={addDialog.open}
        onClose={() => setAddDialog({ open: false, user: null })}
        onSubmit={handleAddSubmit}
        title={addDialog.user ? 'Edit User' : 'New User'}
        icon={addDialog.user ? 'tabler:user-edit' : 'tabler:user-plus'}
        fields={getUserFields(Boolean(addDialog.user), roles)}
        initialValues={addDialog.user ? {
          name: addDialog.user.name || '',
          email: addDialog.user.email || '',
          phone: addDialog.user.phone || '',
          password: '',
          role: addDialog.user.role || roles[0]?.value || 'executive'
        } : { role: roles[0]?.value || 'admin' }}
        submitLabel={addDialog.user ? 'Save Changes' : 'Create User'}
        loading={addLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, user: null })}
        onConfirm={handleDelete}
        title='Delete User'
        message={`Permanently delete "${confirmDialog.user?.name}"?`}
        confirmLabel='Delete'
        severity='error'
        loading={deleteLoading}
      />
    </Box>
  )
}

export default UserListView
