import AdminDashboardView from 'src/views/admin/dashboard'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin Dashboard Page
 * Protected route for Owner, Admin, and Executive roles
 */
const AdminDashboardPage = () => {
  return <AdminDashboardView />
}

AdminDashboardPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AdminDashboardPage.authGuard = false // AdminGuard handles auth

// ACL configuration for this page
AdminDashboardPage.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default AdminDashboardPage
