/**
 * CartSEO — SEO for /cart (noindex — transactional page)
 */
import SEOHead from '../SEOHead'

const CartSEO = () => (
  <SEOHead
    title='Cart | Citronics 2026'
    description='Review your selected event tickets for Citronics 2026 before proceeding to secure checkout.'
    canonicalPath='/cart'
    noIndex
  />
)

export default CartSEO
