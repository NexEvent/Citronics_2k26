/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  SEOHead — Core <Head> Component                                        │
 * │                                                                         │
 * │  Renders title, meta description, keywords, canonical URL, Open Graph,  │
 * │  Twitter Card, and JSON-LD structured data.                             │
 * │                                                                         │
 * │  NOT imported directly in pages — wrapped by per-page components like   │
 * │  HomeSEO, AboutSEO, etc. that pre-fill all props.                      │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import Head from 'next/head'
import { SITE, buildCanonical } from './seo.config'

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath = '/',
  ogType   = 'website',
  ogImage,
  noIndex  = false,
  schemas  = [],
}) => {
  const pageTitle       = title       || SITE.name
  const pageDescription = description || `${SITE.name} — ${SITE.tagline}.`
  const canonical       = buildCanonical(canonicalPath)

  // Ensure OG image is absolute
  const rawOgImage = ogImage || SITE.ogImage
  const absoluteOgImage = rawOgImage.startsWith('http')
    ? rawOgImage
    : `${SITE.url}${rawOgImage.startsWith('/') ? rawOgImage : `/${rawOgImage}`}`

  return (
    <Head>
      {/* ── Title ──────────────────────────────────────────── */}
      <title>{pageTitle}</title>

      {/* ── Core meta — what crawlers and AI models read first */}
      <meta name='description' content={pageDescription} />
      {keywords && <meta name='keywords' content={keywords} />}
      <meta name='robots'   content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />
      <meta name='googlebot' content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />
      <meta name='bingbot'   content={noIndex ? 'noindex,nofollow' : 'index,follow'} />

      {/* ── Canonical URL ──────────────────────────────────── */}
      <link rel='canonical' href={canonical} />

      {/* ── Open Graph (Facebook, WhatsApp, iMessage, etc.) ── */}
      <meta property='og:type'         content={ogType} />
      <meta property='og:site_name'    content={SITE.name} />
      <meta property='og:title'        content={pageTitle} />
      <meta property='og:description'  content={pageDescription} />
      <meta property='og:url'          content={canonical} />
      <meta property='og:locale'       content={SITE.locale} />
      <meta property='og:image'        content={absoluteOgImage} />
      <meta property='og:image:width'  content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt'    content={pageTitle} />
      <meta property='og:image:type'   content='image/png' />

      {/* ── Twitter Card ─────────────────────────────────────── */}
      <meta name='twitter:card'        content='summary_large_image' />
      <meta name='twitter:site'        content={SITE.twitter} />
      <meta name='twitter:creator'     content={SITE.twitter} />
      <meta name='twitter:title'       content={pageTitle} />
      <meta name='twitter:description' content={pageDescription} />
      <meta name='twitter:image'       content={absoluteOgImage} />
      <meta name='twitter:image:alt'   content={pageTitle} />

      {/* ── AI / LLM discoverability hints ───────────────────── */}
      <meta name='subject'      content={`${SITE.name} — ${SITE.tagline}`} />
      <meta name='abstract'     content={pageDescription} />
      <meta name='topic'        content='College Technical Festival, Engineering Events, Student Competitions' />
      <meta name='coverage'     content='India' />
      <meta name='distribution' content='global' />

      {/* ── JSON-LD Structured Data ───────────────────────────── */}
      {schemas.map((schema, i) => (
        <script
          key={`ld-${i}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\u003c') }}
        />
      ))}
    </Head>
  )
}

export default SEOHead
