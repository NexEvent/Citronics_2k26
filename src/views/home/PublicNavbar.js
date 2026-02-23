import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Icon from 'src/components/Icon'

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Schedule', href: '#schedule' }
]

const MotionBox = motion(Box)

export default function PublicNavbar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 40 })

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setDrawerOpen(false)
  }

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

  return (
    <AppBar
      elevation={0}
      sx={{
        backdropFilter: 'blur(20px)',
        backgroundColor: scrolled ? alpha('#0a0a12', 0.85) : 'transparent',
        borderBottom: scrolled ? `1px solid ${alpha('#fff', 0.06)}` : 'none',
        transition: theme.transitions.create(['background-color', 'border-bottom', 'box-shadow'], { duration: 300 }),
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ py: 1, maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            <Icon icon='tabler:bolt' fontSize={20} style={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 800,
                lineHeight: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
                fontSize: '1rem'
              }}
            >
              CITRONICS
            </Typography>
            <Typography variant='caption' sx={{ color: alpha('#fff', 0.35), lineHeight: 1, fontSize: '0.55rem', letterSpacing: '1.5px' }}>
              TECHNICAL FEST 2026
            </Typography>
          </Box>
        </MotionBox>

        {/* Desktop nav */}
        {!isMobile && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.href.replace('#', '')

              return (
                <Button
                  key={link.href}
                  component='a'
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    textTransform: 'none',
                    color: isActive ? theme.palette.primary.main : alpha('#fff', 0.55),
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.label}
                </Button>
              )
            })}

            <Box sx={{ width: 1, height: 24, bgcolor: alpha('#fff', 0.1), mx: 1 }} />

            <Button
              variant='contained'
              component={Link}
              href='/login'
              size='small'
              sx={{
                borderRadius: '8px',
                px: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}
            >
              Login
            </Button>
          </MotionBox>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)}>
            <Icon icon='tabler:menu-2' style={{ color: '#fff' }} />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            pt: 2,
            background: alpha('#0a0a12', 0.97),
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${alpha('#fff', 0.06)}`
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant='subtitle1'
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CITRONICS
          </Typography>
          <IconButton size='small' onClick={() => setDrawerOpen(false)}>
            <Icon icon='tabler:x' style={{ color: alpha('#fff', 0.6) }} />
          </IconButton>
        </Box>
        <List>
          {NAV_LINKS.map(link => (
            <ListItemButton
              key={link.href}
              component='a'
              href={link.href}
              onClick={e => handleNavClick(e, link.href)}
              sx={{
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
              }}
            >
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{ sx: { color: alpha('#fff', 0.7), fontWeight: 500 } }}
              />
            </ListItemButton>
          ))}
          <Box sx={{ px: 2, pt: 2 }}>
            <Button
              fullWidth
              variant='contained'
              component={Link}
              href='/login'
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`
              }}
            >
              Login
            </Button>
          </Box>
        </List>
      </Drawer>
    </AppBar>
  )
}
