import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import EventDetailView from 'src/views/events/EventDetailView'
import { EventDetailSEO } from 'src/components/SEO'

/**
 * Dynamic Event Detail Page — Citronics 2026
 * Displays full details for a single event fetched by ID.
 * Visible to all visitors. No authentication required.
 *
 * getServerSideProps fetches event data server-side so search engines
 * receive correct title, description, and JSON-LD on first request.
 */
const EventDetailPage = ({ seoEvent }) => {
  return (
    <Box component='main' sx={{ overflowX: 'hidden', bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <EventDetailSEO event={seoEvent} />
      <PublicNavbar />
      <Box sx={{ pt: { xs: 4, md: 14 } }}>
        <EventDetailView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

// ── Server-side data for SEO ───────────────────────────────────────────────────
export async function getServerSideProps({ params }) {
  try {
    const { id } = params
    if (!id || isNaN(parseInt(id))) return { props: { seoEvent: null } }

    // Import server-side service directly — avoids an extra HTTP round-trip
    const eventService = (await import('src/services/event-service')).default
    const event        = await eventService.getEventById(parseInt(id))

    // Serialize only the fields needed for SEO (keeps payload small)
    if (!event) return { props: { seoEvent: null } }

    const seoEvent = {
      id:              event.id                ?? null,
      name:            event.name              ?? null,
      tagline:         event.tagline           ?? null,
      description:     event.description       ?? null,
      venue:           event.venue             ?? null,
      ticket_price:    event.ticket_price      ?? null,
      banner_url:      event.banner_url        ?? null,
      start_time:      event.start_time        ? String(event.start_time) : null,
      end_time:        event.end_time          ? String(event.end_time)   : null,
      department_name: event.department_name   ?? null,
    }

    return { props: { seoEvent } }
  } catch {
    return { props: { seoEvent: null } }
  }
}

// ── Page-level config ─────────────────────────────────────────────────────────
EventDetailPage.authGuard  = false
EventDetailPage.guestGuard = false
EventDetailPage.getLayout  = page => page

export default EventDetailPage
