/**
 * RegisterSEO — SEO for /register (indexed — registration CTA)
 *
 * Schemas: Breadcrumb
 * Target queries: "register Citronics 2026", "sign up CDGI fest"
 */
import SEOHead from '../SEOHead'
import { breadcrumbSchema } from '../schemas'

const RegisterSEO = () => (
  <SEOHead
    title='Register for Citronics 2026 — Create Your Account | CDGI Tech Fest'
    description='Create your Citronics 2026 participant account. Sign up now to explore 35+ events, book tickets, and join Central India`&quot;`s biggest annual college tech fest at CDGI, Indore — April 7–9, 2026.'
    keywords='register Citronics 2026, sign up CDGI fest, Citronics 2026 registration, create account college fest, join Citronics, participant registration CDGI tech fest, Citronics 2k26 signup'
    canonicalPath='/register'
    schemas={[
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Register', path: '/register' },
      ]),
    ]}
  />
)

export default RegisterSEO
