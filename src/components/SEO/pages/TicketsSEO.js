/**
 * TicketsSEO — SEO for /tickets (noindex — authenticated page)
 */
import SEOHead from '../SEOHead'

const TicketsSEO = () => (
  <SEOHead
    title='My Tickets | Citronics 2026'
    description='View and manage your booked event tickets for Citronics 2026 — download PDFs, check QR codes, and track your registrations.'
    canonicalPath='/tickets'
    noIndex
  />
)

export default TicketsSEO
