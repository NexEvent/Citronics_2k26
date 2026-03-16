/**
 * EventsSEO — drop-in SEO for /events (listing page)
 *
 * Schemas: Organization · Breadcrumb
 * Target queries: "Citronics events", "CDGI competitions 2026", "tech fest events Indore"
 */
import SEOHead from '../SEOHead'
import { organizationSchema, breadcrumbSchema } from '../schemas'

const EventsSEO = () => (
  <SEOHead
    title='Events & Competitions | Citronics 2026 — CDGI Tech Fest Indore'
    description='Explore 35+ competitive events at Citronics 2026: AI/ML challenges, robotics, coding hackathons, management case studies, cultural performances, debates, quizzes, and workshops. CDGI, Indore — April 7–9, 2026. Filter by category and register online.'
    keywords='events Citronics 2026, CDGI competitions 2026, technical events Indore, robotics competition, coding competition, hackathon CDGI, AI ML challenge 2026, management case study, cultural fest events, debate competition college, college tech fest events, national level technical fest events, hackathon Indore 2026, Citronics 2k26 events, CDGI event list'
    canonicalPath='/events'
    schemas={[
      organizationSchema(),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Events & Competitions', path: '/events' },
      ]),
    ]}
  />
)

export default EventsSEO
