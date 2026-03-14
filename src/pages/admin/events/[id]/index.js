import EventDetailView from 'src/views/admin/events/eventDetailView'
import AdminGuard from 'src/components/guards/AdminGuard'
import Spinner from 'src/components/Spinner'
import AdminLayout from 'src/layouts/AdminLayout'

/**
 * Admin Event Detail Page
 * Uses the EventDetailView component from views
 */
const EventDetailPage = () => {
  return <EventDetailView />
}

EventDetailPage.getLayout = page => (
  <AdminGuard fallback={<Spinner />}>
    <AdminLayout>{page}</AdminLayout>
  </AdminGuard>
)
EventDetailPage.authGuard = false

EventDetailPage.acl = {
  action: 'read',
  subject: 'event'
}

export default EventDetailPage
