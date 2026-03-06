import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import PublicNavbar from 'src/views/home/PublicNavbar'
import HeroSection from 'src/views/home/HeroSection'
//import AboutSection from 'src/views/home/AboutSection'

import StatsSection from 'src/views/home/StatsSection'
import FeaturedEvents from 'src/views/home/FeaturedEvents'
//import TestimonialsSection from 'src/views/home/TestimonialsSection'
//import SponsorsSection from 'src/views/home/SponsorsSection'
import PublicFooter from 'src/views/home/PublicFooter'
import { fetchHomeData } from 'src/store/slices/eventsSlice'

/**
 * Public Home Page — Citronics 2026
 * Visible to all visitors. No authentication required.
 * Data fetched client-side via Redux → /api/home on mount.
 */
const Home = () => {
  const dispatch = useDispatch()
  const { homeData, homeLoading, homeError } = useSelector(state => state.events)

  useEffect(() => {
    dispatch(fetchHomeData())
  }, [dispatch])

  // Full-page loader on first load
  if (homeLoading && !homeData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color='primary' />
      </Box>
    )
  }

  // Error state
  if (homeError && !homeData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, px: 3 }}>
        <Typography variant='h6' color='error' sx={{ fontWeight: 600, textAlign: 'center' }}>
          Something went wrong
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', maxWidth: 420 }}>
          {typeof homeError === 'string' ? homeError : 'Failed to load page data. Please try again.'}
        </Typography>
        <Button variant='outlined' color='primary' onClick={() => dispatch(fetchHomeData())} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Box>
    )
  }

  const { featuredEvents = [], upcomingEvents = [] } = homeData || {}

  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <HeroSection />
     
      {/*<AboutSection />*/}
      <StatsSection />
      <FeaturedEvents events={featuredEvents} />
      {/*<TestimonialsSection />
      <SponsorsSection />*/}
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
Home.authGuard = false
Home.guestGuard = false
Home.getLayout = page => page

export default Home