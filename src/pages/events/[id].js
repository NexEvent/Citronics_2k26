import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import EventDetailView from 'src/views/events/EventDetailView'

/**
 * Dynamic Event Detail Page — Citronics 2026
 * Displays full details for a single event fetched by ID.
 * Visible to all visitors. No authentication required.
 */
const EventDetailPage = () => {
  return (
    <Box component='main' sx={{ overflowX: 'hidden', bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <Box sx={{ pt: { xs: 4, md: 14 } }}>
        <EventDetailView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
EventDetailPage.authGuard = false
EventDetailPage.guestGuard = false
EventDetailPage.getLayout = page => page

export default EventDetailPage
