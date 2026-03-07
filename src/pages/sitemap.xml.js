/**
 * Dynamic Sitemap — Citronics 2026
 *
 * Served at: GET /sitemap.xml
 * Includes all public static routes + every published event.
 *
 * Google and Bing crawlers pick this up automatically via robots.txt.
 * Regenerated on every request (ISR-free, always fresh event list).
 */

import eventService from 'src/services/event-service'
import { SITE } from 'src/components/SEO'

const SITE_URL = SITE.url

/** Static routes with their SEO priority / change frequency */
const STATIC_ROUTES = [
  { path: '/',         changefreq: 'daily',   priority: '1.0' },
  { path: '/about',   changefreq: 'weekly',  priority: '0.8' },
  { path: '/events',  changefreq: 'daily',   priority: '0.9' },
  { path: '/gallery', changefreq: 'weekly',  priority: '0.7' },
  { path: '/team',    changefreq: 'monthly', priority: '0.6' },
  { path: '/register',changefreq: 'monthly', priority: '0.7' },
]

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod    ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority   ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n')
}

export default async function SitemapPage() {
  // This function is never called — rendering is done in getServerSideProps
  return null
}

export async function getServerSideProps({ res }) {
  const today = new Date().toISOString().slice(0, 10)

  // Fetch all published event IDs
  let events = []
  try {
    events = await eventService.getEvents({ limit: 500, offset: 0 })
  } catch {
    // If DB is unreachable, serve a static-only sitemap rather than failing
    events = []
  }

  const staticEntries = STATIC_ROUTES.map(route =>
    buildUrlEntry({
      loc:        `${SITE_URL}${route.path}`,
      lastmod:    today,
      changefreq: route.changefreq,
      priority:   route.priority,
    })
  )

  const eventEntries = (events || []).map(event =>
    buildUrlEntry({
      loc:        `${SITE_URL}/events/${event.id}`,
      lastmod:    event.updated_at
        ? new Date(event.updated_at).toISOString().slice(0, 10)
        : today,
      changefreq: 'weekly',
      priority:   '0.8',
    })
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    ...staticEntries,
    ...eventEntries,
    '</urlset>',
  ].join('\n')

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(xml)
  res.end()

  return { props: {} }
}
