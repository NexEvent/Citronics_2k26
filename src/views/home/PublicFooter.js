import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'

const MotionBox = motion(Box)

const QUICK_LINKS = [
  { label: 'Events', href: '#events' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'About Us', href: '#stats' },
  { label: 'Contact', href: '#' },
  { label: 'Login / Register', href: '/login' }
]

const SOCIAL_LINKS = [
  { icon: 'tabler:brand-instagram', href: '#', label: 'Instagram' },
  { icon: 'tabler:brand-twitter', href: '#', label: 'Twitter' },
  { icon: 'tabler:brand-linkedin', href: '#', label: 'LinkedIn' },
  { icon: 'tabler:brand-youtube', href: '#', label: 'YouTube' }
]

const CONTACT_INFO = [
  { icon: 'tabler:map-pin', text: 'GTU Campus, Chandkheda, Ahmedabad, Gujarat — 382424' },
  { icon: 'tabler:phone', text: '+91 98765 43210' },
  { icon: 'tabler:mail', text: 'citronics@college.edu.in' }
]

export default function PublicFooter() {
  const theme = useTheme()

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.replace('#', '')
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Box
      component='footer'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)}, transparent)`,
          bottom: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth='lg' sx={{ position: 'relative', pt: { xs: 8, md: 10 }, pb: 4 }}>
        <Grid container spacing={5}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`
                  }}
                >
                  <Icon icon='tabler:bolt' fontSize={22} style={{ color: '#fff' }} />
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
                      letterSpacing: '0.5px'
                    }}
                  >
                    CITRONICS
                  </Typography>
                  <Typography variant='caption' sx={{ color: theme.palette.text.secondary, lineHeight: 1, fontSize: '0.6rem', letterSpacing: '1.5px' }}>
                    TECHNICAL FEST 2026
                  </Typography>
                </Box>
              </Box>

              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8, maxWidth: 280 }}>
                The flagship technical festival of our college — celebrating innovation, engineering excellence, and student talent since 2010.
              </Typography>

              {/* Social icons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {SOCIAL_LINKS.map(s => (
                  <IconButton
                    key={s.label}
                    component='a'
                    href={s.href}
                    aria-label={s.label}
                    size='small'
                    sx={{
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    <Icon icon={s.icon} fontSize={16} />
                  </IconButton>
                ))}
              </Box>
            </MotionBox>
          </Grid>

          {/* Quick links */}
          <Grid item xs={6} md={4}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography variant='overline' sx={{ color: theme.palette.text.primary, fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {QUICK_LINKS.map(link => (
                  <Box
                    key={link.label}
                    component='a'
                    href={link.href}
                    onClick={e => handleNavClick(e, link.href)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: theme.palette.text.secondary,
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Icon icon='tabler:chevron-right' fontSize={14} />
                    {link.label}
                  </Box>
                ))}
              </Box>
            </MotionBox>
          </Grid>

          {/* Contact */}
          <Grid item xs={6} md={4}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography variant='overline' sx={{ color: theme.palette.text.primary, fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {CONTACT_INFO.map(({ icon, text }) => (
                  <Box key={icon} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        mt: 0.2,
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon icon={icon} fontSize={14} style={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant='caption' sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </MotionBox>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.5) }} />

        {/* Bottom bar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant='caption' sx={{ color: theme.palette.text.disabled }}>
            © 2026 Citronics. All rights reserved. Built with ❤️ by the Citronics Tech Team.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <Typography
                key={l}
                variant='caption'
                component='a'
                href='#'
                sx={{ color: theme.palette.text.disabled, textDecoration: 'none', '&:hover': { color: theme.palette.primary.main } }}
              >
                {l}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
