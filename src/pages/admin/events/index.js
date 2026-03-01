import EventsManagementView from 'src/views/admin/events'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin Events Management Page
 * Protected route for Owner, Admin, and Executive roles
 * 
 * Permissions:
 * - Owner: Full CRUD
 * - Admin: Full CRUD
 * - Executive: Read-only access
 */
const AdminEventsPage = () => {
  return <EventsManagementView />
}

AdminEventsPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AdminEventsPage.authGuard = false // AdminGuard handles auth

// ACL configuration
AdminEventsPage.acl = {
  action: 'read',
  subject: 'event'
}

export default AdminEventsPage
