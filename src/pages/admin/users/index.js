import UsersManagementView from 'src/views/admin/users'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin Users Management Page
 * Protected route for Owner, Admin, and Executive roles
 * 
 * Permissions:
 * - Owner: Can create/edit/delete any user except other owners
 * - Admin: Can create/edit executives only, cannot delete admins
 * - Executive: Read-only access
 */
const AdminUsersPage = () => {
  return <UsersManagementView />
}

AdminUsersPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AdminUsersPage.authGuard = false // AdminGuard handles auth

// ACL configuration
AdminUsersPage.acl = {
  action: 'read',
  subject: 'user'
}

export default AdminUsersPage
