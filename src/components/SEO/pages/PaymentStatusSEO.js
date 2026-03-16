/**
 * PaymentStatusSEO — SEO for /checkout/payment-status (noindex — transactional page)
 */
import SEOHead from '../SEOHead'

const PaymentStatusSEO = () => (
  <SEOHead
    title='Payment Status | Citronics 2026'
    description='Check the status of your Citronics 2026 ticket payment. View confirmation details or retry if payment failed.'
    canonicalPath='/checkout/payment-status'
    noIndex
  />
)

export default PaymentStatusSEO
