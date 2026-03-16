/**
 * CheckoutSEO — SEO for /checkout (noindex — transactional page)
 */
import SEOHead from '../SEOHead'

const CheckoutSEO = () => (
  <SEOHead
    title='Checkout | Citronics 2026'
    description='Complete your registration and ticket purchase for Citronics 2026 events at CDGI, Indore.'
    canonicalPath='/checkout'
    noIndex
  />
)

export default CheckoutSEO
