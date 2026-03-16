/**
 * TicketVerifySEO — SEO for /tickets/verify (noindex — transactional page)
 */
import SEOHead from '../SEOHead'

const TicketVerifySEO = () => (
  <SEOHead
    title='Verify Ticket | Citronics 2026'
    description='Verify your Citronics 2026 event ticket using the QR code or ticket ID.'
    canonicalPath='/tickets/verify'
    noIndex
  />
)

export default TicketVerifySEO
