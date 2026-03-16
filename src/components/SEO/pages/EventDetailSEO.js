/**
 * EventDetailSEO — dynamic SEO for /events/[id]
 *
 * Accepts an event object (from getServerSideProps) and generates
 * title, description, keywords, and JSON-LD dynamically.
 *
 * Schemas: Event (single) · Breadcrumb
 */
import SEOHead from '../SEOHead'
import { SITE } from '../seo.config'
import { eventSchema, breadcrumbSchema } from '../schemas'

/**
 * @param {{ event: object|null }} props
 *   event — serialized event row from getServerSideProps (can be null)
 */
const EventDetailSEO = ({ event }) => {
  if (!event) {
    return (
      <SEOHead
        title='Event | Citronics 2026 — CDGI Tech Fest'
        description='View event details, timings, venue, and registration info for this competition at Citronics 2026, CDGI Indore.'
        canonicalPath='/events'
        noIndex
      />
    )
  }

  const { id, name, tagline, description, venue, department_name, ticket_price, banner_url } = event

  const eventName = name || 'Event'
  const dept      = department_name ? ` · ${department_name}` : ''
  const priceTag  = ticket_price != null && ticket_price > 0 ? ` | ₹${ticket_price}` : ' | Free Entry'

  // Build a natural description — crawlers and AI models prefer complete sentences
  const rawDesc = tagline || description || ''
  const pageDesc = rawDesc
    ? `${rawDesc.slice(0, 140).trim()}${rawDesc.length > 140 ? '…' : ''} — at Citronics 2026, CDGI Indore.`
    : `${eventName} at Citronics 2026 — compete, collaborate and win at ${SITE.college}, Indore. ${department_name ? `Organised by ${department_name}.` : ''} April 7–9, 2026.`

  return (
    <SEOHead
      title={`${eventName}${dept} | Citronics 2026 — CDGI Tech Fest${priceTag}`}
      description={pageDesc.slice(0, 160)}
      keywords={`${eventName}, ${department_name || 'CDGI'}, Citronics 2026 event, CDGI competition, ${venue || 'Indore'}, college tech fest event, register ${eventName}, Citronics 2k26`}
      canonicalPath={`/events/${id}`}
      ogType='article'
      ogImage={banner_url || undefined}
      schemas={[
        eventSchema(event),
        breadcrumbSchema([
          { name: 'Home',   path: '/' },
          { name: 'Events', path: '/events' },
          { name: eventName, path: `/events/${id}` },
        ]),
      ]}
    />
  )
}

export default EventDetailSEO
