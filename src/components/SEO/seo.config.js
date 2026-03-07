/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  SEO Configuration — Citronics 2026                                     │
 * │                                                                         │
 * │  Single source of truth for domain, brand identity, social handles,     │
 * │  fest metadata, and canonical URL logic.                                │
 * │                                                                         │
 * │  This file is consumed by:                                              │
 * │    • SEOHead.js   — renders <Head> with meta/OG/Twitter/JSON-LD        │
 * │    • schemas.js   — builds JSON-LD structured data                     │
 * │    • pages/*.js   — per-page SEO components (HomeSEO, AboutSEO, etc.)  │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

// ── Site identity ──────────────────────────────────────────────────────────────
export const SITE = {
  url:            'https://cdgicitronics.in',
  name:           'Citronics 2026',
  shortName:      'Citronics',
  tagline:        'Central India\'s Largest College Tech Fest',
  college:        'Chameli Devi Group of Institutions (CDGI)',
  collegeShort:   'CDGI',
  location:       'Indore, Madhya Pradesh, India',
  locale:         'en_IN',
  themeColor:     '#7C3AED',

  // Fest schedule
  festStartDate:  '2026-04-07',
  festEndDate:    '2026-04-09',

  // Images — update ogImage once a proper 1200×630 banner is uploaded
  ogImage:         'https://cdgicitronics.in/images/og-banner.png',
  ogImageFallback: '/images/icons/pwa/icon-512x512.png',
  logo:            'https://cdgicitronics.in/images/icons/pwa/icon-512x512.png',

  // Social
  twitter:   '@cdgi_citronics',
  instagram: 'https://www.instagram.com/cdgi_citronics',
  facebook:  'https://www.facebook.com/socialcdgi',

  // Contact
  email: 'citronics@cdgi.edu.in',

  // Geo coordinates — CDGI campus, Indore
  geo: { lat: 22.7196, lng: 75.8577 },
}

// ── Canonical URL builder ──────────────────────────────────────────────────────
export function buildCanonical(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`

  return `${SITE.url}${clean}`
}
