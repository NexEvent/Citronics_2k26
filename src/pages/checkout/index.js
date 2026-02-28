import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import CheckoutView from 'src/views/checkout/CheckoutView'

/**
 * Checkout Page — Citronics 2026
 * Secure checkout with backend-validated pricing.
 * Visible to all visitors. No authentication required.
 */
const CheckoutPage = () => {
  return (
    <Box
      component='main'
      sx={{
        overflowX: 'hidden',
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 }
      }}
    >
      <PublicNavbar />
      <Box sx={{ pt: { xs: 2, md: 12 }, pb: { xs: 4, md: 6 } }}>
        <CheckoutView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
CheckoutPage.authGuard = false
CheckoutPage.guestGuard = false
CheckoutPage.getLayout = page => page

export default CheckoutPage
