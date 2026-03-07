/**
 * AboutSEO — drop-in SEO for /about
 *
 * Schemas: Organization · festEvent · Breadcrumb · FAQ
 * Target queries: "about Citronics", "CDGI fest info", "Citronics 2026 details"
 */
import SEOHead from '../SEOHead'
import {
  organizationSchema,
  festEventSchema,
  breadcrumbSchema,
  faqSchema,
} from '../schemas'

const ABOUT_FAQS = [
  {
    question: 'What is Citronics 2026?',
    answer:   'Citronics 2026 is the flagship annual techno-management fest of Chameli Devi Group of Institutions (CDGI), Indore. It features 35+ competitions across AI, robotics, coding, management, and cultural events with 5000+ participants from colleges all over India.',
  },
  {
    question: 'When and where is Citronics 2026 held?',
    answer:   'Citronics 2026 takes place from April 7 to April 9, 2026 at the CDGI campus on Airport Road, Indore, Madhya Pradesh, India.',
  },
  {
    question: 'How can I register for Citronics 2026?',
    answer:   'Visit cdgicitronics.in, create a free account, browse all 35+ events, and register for the competitions you want to participate in. You can purchase tickets directly through the website.',
  },
  {
    question: 'Is Citronics 2026 open to students from other colleges?',
    answer:   'Yes, Citronics is a national-level fest open to students from all colleges and universities across India. Students from engineering, management, design, and other disciplines are welcome.',
  },
  {
    question: 'What kind of events does Citronics have?',
    answer:   'Citronics features technical events (AI/ML challenges, robotics, hackathons, coding battles), management case studies, cultural performances, debates, quizzes, workshops, keynote sessions, and more across 14+ departments.',
  },
]

const AboutSEO = () => (
  <SEOHead
    title='About Citronics 2026 — CDGI Flagship Tech Fest | 35+ Events · 5000+ Participants · 3 Days'
    description='Citronics is the annual techno-management fest of Chameli Devi Group of Institutions (CDGI), Indore. 35+ technical and cultural competitions, 5000+ student participants, 14+ departments, keynotes, workshops, and 3 packed days of innovation — April 7–9, 2026.'
    keywords='about Citronics 2026, CDGI annual fest, Citronics 2026, Citronics 2k26, CDGI tech fest 2026, Chameli Devi Group of Institutions, CDGI Indore, Central India tech fest, Indore technical festival, CDGI departments, tech fest 3 days, Central India biggest college fest, what is Citronics, CDGI fest information, engineering fest MP'
    canonicalPath='/about'
    schemas={[
      organizationSchema(),
      festEventSchema(),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'About Citronics 2026', path: '/about' },
      ]),
      faqSchema(ABOUT_FAQS),
    ]}
  />
)

export default AboutSEO
