/**
 * GallerySEO — drop-in SEO for /gallery
 *
 * Schemas: ImageGallery · Breadcrumb
 * Target queries: "Citronics photos", "CDGI fest gallery", "tech fest highlights"
 */
import SEOHead from '../SEOHead'
import { imageGallerySchema, breadcrumbSchema } from '../schemas'

const GallerySEO = () => (
  <SEOHead
    title='Gallery — Citronics 2026 | CDGI Tech Fest Photos, Highlights & Moments'
    description="Browse photos and highlights from Citronics — CDGI annual tech fest in Indore. Explore event moments, cultural performances, workshops, competition finals, campus life, and behind-the-scenes captures from one of Central India's biggest college festivals."
    keywords='Citronics gallery, CDGI fest photos, tech fest highlights, Citronics 2026 images, college fest moments 2026, CDGI campus photos, cultural fest Indore pictures, competition highlights, behind the scenes tech fest, Citronics 2k26 gallery'
    canonicalPath='/gallery'
    schemas={[
      imageGallerySchema(),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Gallery', path: '/gallery' },
      ]),
    ]}
  />
)

export default GallerySEO
