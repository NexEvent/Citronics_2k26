/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  JSON-LD Structured Data Builders — Citronics 2026                      │
 * │                                                                         │
 * │  schema.org markup that search engines and AI assistants parse to       │
 * │  understand page content. Outputs valid JSON-LD objects for injection   │
 * │  via <script type="application/ld+json">.                              │
 * │                                                                         │
 * │  Schemas included:                                                      │
 * │    1. WebSite          — sitelinks search box in Google/Bing           │
 * │    2. Organization     — knowledge panel, logo, social links           │
 * │    3. CollegeOrUniv.   — parent institution signal                     │
 * │    4. Event (fest)     — 3-day festival rich result                    │
 * │    5. Event (single)   — per-competition rich result                   │
 * │    6. BreadcrumbList   — breadcrumb trail in SERPs                     │
 * │    7. FAQPage          — FAQ rich snippets                             │
 * │    8. ImageGallery     — gallery page structured data                  │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import { SITE } from './seo.config'

// ── Shared address fragment ────────────────────────────────────────────────────
const CDGI_ADDRESS = {
  '@type':           'PostalAddress',
  streetAddress:     'Airport Road, Sector F',
  addressLocality:   'Indore',
  addressRegion:     'Madhya Pradesh',
  postalCode:        '452020',
  addressCountry:    'IN',
}

const CDGI_PLACE = {
  '@type':  'Place',
  name:     'Chameli Devi Group of Institutions',
  address:  CDGI_ADDRESS,
  geo: {
    '@type':    'GeoCoordinates',
    latitude:   SITE.geo.lat,
    longitude:  SITE.geo.lng,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WebSite — enables sitelinks search box
// ═══════════════════════════════════════════════════════════════════════════════
export function websiteSchema() {
  return {
    '@context':      'https://schema.org',
    '@type':         'WebSite',
    '@id':           `${SITE.url}/#website`,
    name:             SITE.name,
    alternateName:   ['Citronics', 'Citronics 2k26', 'CDGI Citronics', 'CDGI Tech Fest 2026'],
    url:              SITE.url,
    description:      `${SITE.tagline} — 35+ competitions, 5000+ participants, April 7–9, 2026 at ${SITE.college}, Indore.`,
    inLanguage:       'en-IN',
    publisher:       { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type':       'SearchAction',
      target: {
        '@type':       'EntryPoint',
        urlTemplate:   `${SITE.url}/events?search={search_term_string}`,
      },
      'query-input':  'required name=search_term_string',
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Organization — knowledge panel, brand identity
// ═══════════════════════════════════════════════════════════════════════════════
export function organizationSchema() {
  return {
    '@context':      'https://schema.org',
    '@type':         'Organization',
    '@id':           `${SITE.url}/#organization`,
    name:             'Citronics — CDGI Annual Tech Fest',
    alternateName:   ['CDGI Citronics', 'Citronics 2026', `${SITE.college} Tech Fest`],
    url:              SITE.url,
    logo: {
      '@type':    'ImageObject',
      url:         SITE.logo,
      width:       512,
      height:      512,
    },
    image:            SITE.ogImage,
    description:      '35+ technical and cultural competitions, 5000+ student participants from across India, 14+ departments — the flagship annual fest of Chameli Devi Group of Institutions, Indore.',
    email:            SITE.email,
    address:          CDGI_ADDRESS,
    sameAs:          [SITE.instagram, SITE.facebook],
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      '@id':   `${SITE.url}/#college`,
      name:    SITE.college,
      url:     SITE.url,
      address: CDGI_ADDRESS,
      sameAs: [SITE.facebook],
    },
    contactPoint: {
      '@type':       'ContactPoint',
      contactType:   'registration enquiries',
      email:         SITE.email,
      url:           `${SITE.url}/about`,
      availableLanguage: ['English', 'Hindi'],
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Fest Event — the entire 3-day festival (Google Event rich card)
// ═══════════════════════════════════════════════════════════════════════════════
export function festEventSchema() {
  return {
    '@context':  'https://schema.org',
    '@type':     'Event',
    '@id':       `${SITE.url}/#fest-event`,
    name:         'Citronics 2026 — Annual Tech Fest',
    alternateName: ['Citronics 2k26', 'CDGI Tech Fest 2026', 'CDGI Citronics 2026'],
    description:  `Citronics 2026 is ${SITE.tagline.toLowerCase()} hosted by ${SITE.college}, Indore. Featuring 35+ competitions across AI, robotics, coding, management, cultural performances, and more — with 5000+ student participants from across India over 3 action-packed days.`,
    startDate:    `${SITE.festStartDate}T09:00:00+05:30`,
    endDate:      `${SITE.festEndDate}T21:00:00+05:30`,
    eventStatus:  'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location:     CDGI_PLACE,
    image:       [SITE.ogImage, SITE.logo],
    url:          SITE.url,
    organizer:   { '@id': `${SITE.url}/#organization` },
    performer: {
      '@type': 'PerformingGroup',
      name:    'Student Teams from 14+ Departments',
    },
    offers: {
      '@type':        'Offer',
      url:            `${SITE.url}/events`,
      availability:   'https://schema.org/InStock',
      priceCurrency:  'INR',
      price:          '0',
      validFrom:      '2025-12-01',
      description:    'Free and paid events — browse competitions and register online at cdgicitronics.in.',
    },
    typicalAgeRange: '17-25',
    isAccessibleForFree: false,
    keywords: [
      'Citronics 2026', 'CDGI tech fest', 'college tech fest India',
      'Central India fest Indore', 'annual engineering fest MP',
      'AI ML robotics competition 2026', 'hackathon Indore',
    ].join(', '),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Single Event — per-competition schema
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {object} event  DB row for a single event
 */
export function eventSchema(event = {}) {
  const {
    id, name, tagline, description, venue,
    ticket_price, banner_url, start_time, end_time, department_name,
  } = event

  const price   = ticket_price != null && ticket_price > 0 ? ticket_price : 0
  const isFree  = price === 0
  const startDT = start_time || `${SITE.festStartDate}T09:00:00+05:30`
  const endDT   = end_time   || `${SITE.festEndDate}T21:00:00+05:30`
  const eventUrl = id ? `${SITE.url}/events/${id}` : `${SITE.url}/events`

  return {
    '@context':  'https://schema.org',
    '@type':     'Event',
    name:         name || 'Citronics 2026 Event',
    description:  tagline || description || `A competition at Citronics 2026 — CDGI's annual tech fest in Indore.`,
    startDate:    startDT,
    endDate:      endDT,
    eventStatus:  'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type':  'Place',
      name:     venue || CDGI_PLACE.name,
      address:  CDGI_ADDRESS,
      geo:      CDGI_PLACE.geo,
    },
    image:   banner_url ? [banner_url] : [SITE.ogImage],
    url:     eventUrl,
    organizer: {
      '@type': 'Organization',
      name:    department_name ? `${department_name} — CDGI Citronics` : 'CDGI Citronics',
      url:     SITE.url,
    },
    offers: {
      '@type':        'Offer',
      url:            eventUrl,
      price:          String(price),
      priceCurrency:  'INR',
      availability:   'https://schema.org/InStock',
      validFrom:      '2025-12-01',
      ...(isFree && { description: 'Free entry' }),
    },
    superEvent: { '@id': `${SITE.url}/#fest-event` },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. BreadcrumbList — breadcrumb trail
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Array<{name: string, path: string}>} crumbs
 */
export function breadcrumbSchema(crumbs = []) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      crumb.name,
      item:      `${SITE.url}${crumb.path}`,
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. FAQPage — FAQ rich snippets (for About page)
// ═══════════════════════════════════════════════════════════════════════════════
export function faqSchema(faqs = []) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name:     faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:     faq.answer,
      },
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ImageGallery — gallery page structured data
// ═══════════════════════════════════════════════════════════════════════════════
export function imageGallerySchema() {
  return {
    '@context': 'https://schema.org',
    '@type':    'ImageGallery',
    name:       'Citronics 2026 Photo Gallery',
    description:'Photos and highlights from Citronics — cultural performances, competitions, workshops, events, and behind-the-scenes moments at CDGI, Indore.',
    url:        `${SITE.url}/gallery`,
    isPartOf:   { '@id': `${SITE.url}/#website` },
  }
}
