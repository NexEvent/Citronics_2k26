/**
 * TeamSEO — drop-in SEO for /team
 *
 * Schemas: Organization · Breadcrumb
 * Target queries: "Citronics team", "CDGI fest organizers", "student council CDGI"
 */
import SEOHead from '../SEOHead'
import { organizationSchema, breadcrumbSchema } from '../schemas'

const TeamSEO = () => (
  <SEOHead
    title='Core Team — Citronics 2026 | Meet the Organizers & Student Council | CDGI Indore'
    description='Meet the student organisers, department heads, and faculty mentors behind Citronics 2026 at CDGI, Indore. The dedicated team of coordinators, technical leads, and operations crew making Central India`&quot;`s largest tech fest a reality.'
    keywords='Citronics team, CDGI organizers, Citronics 2026 committee, CDGI student council, fest committee, student committee CDGI, Citronics core team, CDGI fest team 2026, tech fest organizers Indore, Citronics 2k26 team'
    canonicalPath='/team'
    schemas={[
      organizationSchema(),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Core Team', path: '/team' },
      ]),
    ]}
  />
)

export default TeamSEO
