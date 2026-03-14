import UserDetailView from 'src/views/admin/users/userDetailView'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin User Detail Page
 * Uses the UserDetailView component from views
 */
const UserDetailPage = () => {
  return <UserDetailView />
}

UserDetailPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
UserDetailPage.authGuard = false

UserDetailPage.acl = {
  action: 'read',
  subject: 'user'
}

export default UserDetailPage
