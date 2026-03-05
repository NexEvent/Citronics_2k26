import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from 'src/components/Navbar'

const BASE_NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Events', href: '/events' },
  { label: 'My Tickets', href: '/tickets', requiresAuth: true }
]

/**
 * Fixed navigation bar for the public home page.
 * Highlights the active section based on window scroll event listeners.
 * Hides auth-required links (My Tickets) from unauthenticated users.
 */
export default function PublicNavbar() {
  const [activeSection, setActiveSection] = useState('hero')
  const { data: session } = useSession()

  // Filter out links that require auth when user is not signed in
  const navLinks = BASE_NAV_LINKS.filter(link => !link.requiresAuth || !!session?.user)

  useEffect(() => {
    const sections = ['hero', 'about', 'stats', 'events']
    const handleScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return <Navbar navLinks={navLinks} activeSection={activeSection} />
}
