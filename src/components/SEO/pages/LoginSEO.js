/**
 * LoginSEO — SEO for /login (noindex — auth page)
 */
import SEOHead from '../SEOHead'

const LoginSEO = () => (
  <SEOHead
    title='Login | Citronics 2026 — CDGI Tech Fest'
    description='Log in to your Citronics 2026 account to manage event registrations, view tickets, and track your fest journey at CDGI, Indore.'
    canonicalPath='/login'
    noIndex
  />
)

export default LoginSEO
