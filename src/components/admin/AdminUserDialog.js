/**
 * AdminUserDialog — Create / Edit admin portal user
 * Props: open, onClose, onSuccess(user), user(null=create), currentUserRole
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
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/components/Icon'

const ROLES = {
  owner:     [{ value: 'admin', label: 'Admin' }, { value: 'executive', label: 'Executive' }],
  admin:     [{ value: 'executive', label: 'Executive' }],
  executive: []
}

export default function AdminUserDialog({ open = false, onClose, onSuccess, user = null, currentUserRole = 'admin' }) {
  const isEdit = Boolean(user)
  const roles = ROLES[currentUserRole?.toLowerCase()] || []
  const defaultRole = roles[0]?.value || 'executive'

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: defaultRole })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError(''); setShowPwd(false)
    setForm(user
      ? { name: user.name || '', email: user.email || '', password: '', phone: user.phone || '', role: user.role || defaultRole }
      : { name: '', email: '', password: '', phone: '', role: defaultRole }
    )
  }, [open, user])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required.'
    if (!isEdit && !form.password) return 'Password is required.'
    if (form.password && form.password.length < 8) return 'Password must be at least 8 characters.'
    if (!form.role) return 'Role is required.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate(); if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const payload = {
        name: form.name.trim(), email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null, role: form.role,
        ...(form.password ? { password: form.password } : {})
      }
      const res = isEdit
        ? await axios.put(`/api/admin/users/${user.id}`, payload)
        : await axios.post('/api/admin/users', payload)
      toast.success(isEdit ? 'User updated' : 'User created')
      onSuccess?.(res.data.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`)
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth
      PaperProps={{ sx: { borderRadius: 2, m: { xs: 1, sm: 2 } } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ py: 2, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon={isEdit ? 'tabler:user-edit' : 'tabler:user-plus'} fontSize={20} />
              <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1 }}>
                {isEdit ? 'Edit User' : 'New User'}
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
              <TextField fullWidth label='Full Name *' value={form.name}
                onChange={e => set('name', e.target.value)} autoFocus={!isEdit} disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:user' fontSize={16} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label='Phone' value={form.phone}
                onChange={e => set('phone', e.target.value)} disabled={loading}
                InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:phone' fontSize={16} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type='email' label='Email *' value={form.email}
                onChange={e => set('email', e.target.value)} disabled={loading || isEdit}
                helperText={isEdit ? 'Email cannot be changed' : ''}
                InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:mail' fontSize={16} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type={showPwd ? 'text' : 'password'}
                label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
                value={form.password} onChange={e => set('password', e.target.value)} disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Icon icon='tabler:lock' fontSize={16} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setShowPwd(p => !p)} edge='end'>
                        <Icon icon={showPwd ? 'tabler:eye-off' : 'tabler:eye'} fontSize={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loading || roles.length === 0}>
                <InputLabel>Role *</InputLabel>
                <Select value={form.role} label='Role *' onChange={e => set('role', e.target.value)}>
                  {roles.length === 0
                    ? <MenuItem value={form.role} sx={{ textTransform: 'capitalize' }}>{form.role}</MenuItem>
                    : roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)
                  }
                </Select>
                {roles.length === 0 && (
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, px: 1.5 }}>
                    You do not have permission to change this role.
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} variant='outlined' size='medium'>Cancel</Button>
          <Button type='submit' variant='contained' size='medium' disabled={loading}
            startIcon={loading ? <CircularProgress size={14} color='inherit' /> : <Icon icon={isEdit ? 'tabler:device-floppy' : 'tabler:user-plus'} fontSize={16} />}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
