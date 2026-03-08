/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  SEO Engine — Citronics 2026                                            │
 * │                                                                         │
 * │  Barrel export. Import per-page SEO components directly:                │
 * │                                                                         │
 * │    import { HomeSEO } from 'src/components/SEO'                         │
 * │    import { EventDetailSEO } from 'src/components/SEO'                  │
 * │                                                                         │
 * │  Structure:                                                             │
 * │    SEO/                                                                 │
 * │    ├── index.js           ← this barrel file                           │
 * │    ├── seo.config.js      ← site identity, domain, social, geo         │
 * │    ├── schemas.js         ← JSON-LD structured data builders           │
 * │    ├── SEOHead.js         ← core <Head> component (internal)           │
 * │    └── pages/                                                           │
 * │        ├── HomeSEO.js     ← <HomeSEO />                               │
 * │        ├── AboutSEO.js    ← <AboutSEO />                              │
 * │        ├── EventsSEO.js   ← <EventsSEO />                             │
 * │        ├── EventDetailSEO.js ← <EventDetailSEO event={...} />         │
 * │        ├── GallerySEO.js  ← <GallerySEO />                            │
 * │        ├── TeamSEO.js     ← <TeamSEO />                               │
 * │        ├── CartSEO.js     ← <CartSEO />                               │
 * │        ├── CheckoutSEO.js ← <CheckoutSEO />                           │
 * │        ├── LoginSEO.js    ← <LoginSEO />                              │
 * │        └── RegisterSEO.js ← <RegisterSEO />                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

// Per-page SEO components — one import, one JSX tag per page
export { default as HomeSEO }        from './pages/HomeSEO'
export { default as AboutSEO }       from './pages/AboutSEO'
export { default as EventsSEO }      from './pages/EventsSEO'
export { default as EventDetailSEO } from './pages/EventDetailSEO'
export { default as GallerySEO }     from './pages/GallerySEO'
export { default as TeamSEO }        from './pages/TeamSEO'
export { default as CartSEO }        from './pages/CartSEO'
export { default as CheckoutSEO }    from './pages/CheckoutSEO'
export { default as LoginSEO }       from './pages/LoginSEO'
export { default as RegisterSEO }    from './pages/RegisterSEO'
export { default as TicketsSEO }      from './pages/TicketsSEO'
export { default as TicketVerifySEO } from './pages/TicketVerifySEO'
export { default as PaymentStatusSEO } from './pages/PaymentStatusSEO'

// Low-level exports (for advanced use / sitemap / events/[id] getServerSideProps)
export { SITE, buildCanonical } from './seo.config'
export { eventSchema } from './schemas'
