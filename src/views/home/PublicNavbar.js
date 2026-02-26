import { useState, useEffect } from 'react'
import Navbar from 'src/components/Navbar'

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Events', href: '/events' },
  { label: 'Schedule', href: '#schedule' }
]

/**
 * Fixed navigation bar for the public home page.
 * Highlights the active section based on window scroll event listeners.
 */
export default function PublicNavbar() {
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const sections = ['hero', 'about', 'stats', 'events', 'schedule']
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

  return <Navbar navLinks={NAV_LINKS} activeSection={activeSection} />
}
