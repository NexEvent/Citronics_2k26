import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Chip,
  Grid,
  Divider,
  Alert
} from '@mui/material'
import { useAbility } from '@casl/react'
import toast from 'react-hot-toast'
import axios from 'axios'

import AdminLayout from 'src/layouts/AdminLayout'
import AdminGuard from 'src/components/guards/AdminGuard'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { isAdminRole } from 'src/configs/acl'

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'executive', label: 'Executive' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' }
]

const UserDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const ability = useAbility(AbilityContext)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    verified: false
  })
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await axios.get(`/api/admin/users/${id}`)
      setUser(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        role: response.data.role || 'student',
        verified: response.data.verified || false
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err.response?.data?.error || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!ability.can('update', 'User')) {
      toast.error('You do not have permission to update users')
      return
    }

    try {
      setSaving(true)
      await axios.put(`/api/admin/users/${id}`, formData)
      toast.success('User updated successfully')
      router.push('/admin/users')
    } catch (err) {
      console.error('Error updating user:', err)
      toast.error(err.response?.data?.error || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    try {
      setSaving(true)
      await axios.put(`/api/admin/users/${id}`, { verified: true })
      toast.success('User verified successfully')
      fetchUser()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to verify user')
    } finally {
      setSaving(false)
    }
  }

  const canUpdate = ability.can('update', 'User')
  const canUpdateRole = ability.can('manage', 'Admin') // Only owners can change admin roles

  // Filter role options based on permissions
  const availableRoles = roleOptions.filter((role) => {
    // Executives can't change roles at all
    if (!canUpdate) return false
    // Only owners can assign owner/admin roles
    if (['owner', 'admin'].includes(role.value) && !canUpdateRole) return false
    return true
  })

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity='error'>{error}</Alert>
        <Button sx={{ mt: 2 }} variant='outlined' onClick={() => router.push('/admin/users')}>
          Back to Users
        </Button>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box>
          <Typography variant='h4' fontWeight='bold'>
            User Details
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {canUpdate ? 'Edit user information' : 'View user information'}
          </Typography>
        </Box>
        <Button variant='outlined' onClick={() => router.push('/admin/users')}>
          Back to Users
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!canUpdate}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!canUpdate}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Phone'
                      name='phone'
                      value={formData.phone || ''}
                      onChange={handleChange}
                      disabled={!canUpdate}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label='Role'
                      name='role'
                      value={formData.role}
                      onChange={handleChange}
                      disabled={!canUpdate || (isAdminRole(user?.role) && !canUpdateRole)}
                    >
                      {availableRoles.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {isAdminRole(user?.role) && !canUpdateRole && (
                      <Typography variant='caption' color='warning.main'>
                        Only owners can change admin roles
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label='Verified'
                      name='verified'
                      value={formData.verified ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          verified: e.target.value === 'true'
                        }))
                      }
                      disabled={!canUpdate}
                    >
                      <MenuItem value='true'>Yes</MenuItem>
                      <MenuItem value='false'>No</MenuItem>
                    </TextField>
                  </Grid>

                  {canUpdate && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box display='flex' gap={2}>
                        <Button type='submit' variant='contained' disabled={saving}>
                          {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                        </Button>
                        <Button variant='outlined' onClick={() => router.push('/admin/users')} disabled={saving}>
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Quick Info
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box mb={2}>
                <Typography variant='caption' color='text.secondary'>
                  User ID
                </Typography>
                <Typography variant='body1'>{user?.id}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant='caption' color='text.secondary'>
                  Status
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={user?.verified ? 'Verified' : 'Unverified'}
                    color={user?.verified ? 'success' : 'warning'}
                    size='small'
                  />
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant='caption' color='text.secondary'>
                  Role
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={user?.role?.toUpperCase()}
                    color={isAdminRole(user?.role) ? 'primary' : 'default'}
                    size='small'
                  />
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant='caption' color='text.secondary'>
                  Created At
                </Typography>
                <Typography variant='body2'>
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Box>

              {user?.created_by_name && (
                <Box mb={2}>
                  <Typography variant='caption' color='text.secondary'>
                    Created By
                  </Typography>
                  <Typography variant='body2'>{user.created_by_name}</Typography>
                </Box>
              )}

              {!user?.verified && canUpdate && (
                <Box mt={3}>
                  <Button variant='contained' color='success' fullWidth onClick={handleVerify} disabled={saving}>
                    Verify User
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

UserDetailPage.getLayout = (page) => (
  <AdminGuard>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
UserDetailPage.authGuard = false

UserDetailPage.acl = {
  action: 'read',
  subject: 'User'
}

export default UserDetailPage
