import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { useSettings } from 'src/hooks/useSettings'
import Navbar from 'src/components/Navbar'

/**
 * AppShell — Main Layout
 *
 * Renders the global floating Navbar + main content area.
 * No sidebar in the current scope (admin portal later).
 */
const Layout = ({ children }) => {
  const theme = useTheme()
  const { settings } = useSettings()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Global Navbar */}
      <Navbar />

      {/* Main content */}
      <Box
        component='main'
        sx={{
          pt: settings.appBar !== 'hidden' ? { xs: '16px', md: '88px' } : 0,
          /* Extra bottom padding on mobile for MobileBottomNav */
          pb: { xs: 'calc(72px + env(safe-area-inset-bottom, 0px))', md: 3 },
          maxWidth: settings.contentWidth === 'boxed' ? 1440 : '100%',
          mx: 'auto',
          transition: theme.transitions.create(['padding-top'], { duration: 200 })
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
