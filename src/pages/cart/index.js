import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import CartView from 'src/views/cart/CartView'

/**
 * Cart Page — Citronics 2026
 * Displays cart items with quantity controls and order summary.
 * Visible to all visitors. No authentication required.
 */
const CartPage = () => {
  return (
    <Box component='main' sx={{ overflowX: 'hidden', bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <Box sx={{ pt: { xs: 2, md: 12 }, pb: { xs: 4, md: 6 } }}>
        <CartView />
      </Box>
      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
CartPage.authGuard = false
CartPage.guestGuard = false
CartPage.getLayout = page => page

export default CartPage
