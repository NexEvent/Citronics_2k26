import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import EventsPageView from 'src/views/events/EventsPageView'

/**
 * Public Events Page — Citronics 2026
 * Lists all events with hero carousel, category filters, and pagination.
 * Visible to all visitors. No authentication required.
 */
const EventsPage = () => {
  return (
    <Box component='main' sx={{ overflowX: 'hidden', bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <Box sx={{ pt: { xs: 2, md: 12 }, pb: { xs: 4, md: 6 } }}>
        <EventsPageView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
EventsPage.authGuard = false
EventsPage.guestGuard = false
EventsPage.getLayout = page => page

export default EventsPage
