import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import HeroSection from 'src/views/home/HeroSection'
import AboutSection from 'src/views/home/AboutSection'
import StatsSection from 'src/views/home/StatsSection'
import EventsSection from 'src/views/home/EventsSection'
import ScheduleSection from 'src/views/home/ScheduleSection'
import TestimonialsSection from 'src/views/home/TestimonialsSection'
import SponsorsSection from 'src/views/home/SponsorsSection'
import CTABanner from 'src/views/home/CTABanner'
import PublicFooter from 'src/views/home/PublicFooter'

/**
 * Public Home Page — Citronics 2026
 * Visible to all visitors. No authentication required.
 */
const Home = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <EventsSection />
      <ScheduleSection />
      <TestimonialsSection />
      <SponsorsSection />
      <CTABanner />
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
// Public page — no auth guard, no guest guard, no layout wrapper
Home.authGuard = false
Home.guestGuard = false
Home.getLayout = page => page

export default Home
