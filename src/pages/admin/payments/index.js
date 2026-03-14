import PaymentAnalysisView from 'src/views/admin/payments'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin Payments Page
 * Protected route for Owner and Admin roles
 *
 * Permissions:
 * - Owner: Full access to payment analytics
 * - Admin: View-only access to payment analytics
 */
const AdminPaymentsPage = () => {
  return <PaymentAnalysisView />
}

AdminPaymentsPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AdminPaymentsPage.authGuard = false

AdminPaymentsPage.acl = {
  action: 'read',
  subject: 'payment'
}

export default AdminPaymentsPage
