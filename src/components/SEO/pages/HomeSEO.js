/**
 * HomeSEO — drop-in SEO for the landing page (src/pages/index.js)
 *
 * Schemas: WebSite · Organization · festEvent · Breadcrumb
 * Target queries: "Citronics 2026", "CDGI tech fest", "college tech fest Indore"
 */
import SEOHead from '../SEOHead'
import {
  websiteSchema,
  organizationSchema,
  festEventSchema,
  breadcrumbSchema,
} from '../schemas'

const HomeSEO = () => (
  <SEOHead
    title='Citronics 2026 — CDGI Annual Tech Fest | April 7–9 | 35+ Events, 5000+ Participants'
    description="Citronics 2026 is Central India's largest annual college tech fest hosted by Chameli Devi Group of Institutions (CDGI), Indore. Featuring 35+ competitions in AI, robotics, coding, management & cultural events — April 7 to 9, 2026. Register now and compete!"
    keywords='Citronics 2026, Citronics 2k26, CDGI Citronics, CDGI tech fest 2026, Chameli Devi Group of Institutions, CDGI Indore, Central India tech fest, Indore technical festival, Madhya Pradesh engineering fest, college tech fest 2026, national level technical fest, engineering fest India, annual tech fest, register Citronics 2026, event registration college, buy event tickets online, college fest tickets, annual fest CDGI April 2026, technical cultural fest, robotics competition, coding competition, hackathon Indore'
    canonicalPath='/'
    schemas={[
      websiteSchema(),
      organizationSchema(),
      festEventSchema(),
      breadcrumbSchema([{ name: 'Home', path: '/' }]),
    ]}
  />
)

export default HomeSEO
