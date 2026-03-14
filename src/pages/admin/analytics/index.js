import AdminLayout from 'src/layouts/AdminLayout'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AnalyticsDashboard from 'src/views/admin/analytics'

const AnalyticsPage = () => {
  return <AnalyticsDashboard />
}

AnalyticsPage.getLayout = (page) => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
AnalyticsPage.authGuard = false

AnalyticsPage.acl = {
  action: 'read',
  subject: 'analytics'
}

export default AnalyticsPage
