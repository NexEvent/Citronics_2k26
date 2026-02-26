import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

const SOCIAL_LINKS = [
  { icon: 'tabler:mail', href: 'mailto:citronics@college.edu.in', label: 'Email' },
  { icon: 'tabler:brand-instagram', href: '#', label: 'Instagram' },
  { icon: 'tabler:brand-facebook', href: '#', label: 'Facebook' },
  { icon: 'tabler:brand-twitter', href: '#', label: 'Twitter' },
  { icon: 'tabler:brand-youtube', href: '#', label: 'YouTube' }
]

const CONTACT_ITEMS = [
  { icon: 'tabler:phone', text: '+91 98765 43210' },
  { icon: 'tabler:map-pin', text: 'GTU Campus, Chandkheda, Ahmedabad, Gujarat — 382424' }
]

/**
 * Footer — Reusable "Keep in Touch" footer component
 *
 * Renders a professional gradient footer with:
 *  - Downward chevron separator
 *  - "KEEP IN TOUCH" heading
 *  - Social media icon row
 *  - Contact details (phone, address)
 *  - Privacy Policy & Terms links
 *  - Copyright notice
 *
 * Follows project architecture: placed in src/components/footer
 * and consumed by view-level components (e.g. PublicFooter).
 */
export default function Footer() {
  const c = useAppPalette()

  return (
    <Box
      component='footer'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        // Transparent — WebGL canvas shows through
        background: 'transparent',
        pt: 0,
        pb: 0
      }}
    >
      {/* ── Chevron separator ──────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: { xs: 4, md: 6 },
          pb: { xs: 3, md: 4 }
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `2px solid ${c.primaryA20}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: c.primaryA50,
              background: c.primaryA8
            },
            '&:focus-visible': {
              outline: `2px solid ${c.primary}`,
              outlineOffset: 2
            }
          }}
          role='button'
          tabIndex={0}
          aria-label='Scroll to bottom'
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          onKeyDown={e => e.key === 'Enter' && window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        >
          <Icon icon='tabler:chevron-down' fontSize={24} style={{ color: c.primaryA70 }} />
        </Box>
      </MotionBox>

      {/* ── Decorative line ────────────────────────────────────────────── */}
      <Container maxWidth='md'>
        <Divider
          sx={{
            borderColor: c.primaryA8,
            mb: { xs: 5, md: 6 }
          }}
        />
      </Container>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <Container maxWidth='sm' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* KEEP IN TOUCH heading */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              mb: { xs: 4, md: 5 },
              background: `linear-gradient(135deg, ${c.primaryLight}, ${c.info})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Keep in Touch
          </Typography>
        </MotionBox>

        {/* ── Social icons row ─────────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 4 },
            mb: { xs: 5, md: 6 }
          }}
        >
          {SOCIAL_LINKS.map((s, i) => (
            <MotionBox
              key={s.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <IconButton
                component='a'
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel='noopener noreferrer'
                aria-label={s.label}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: `1.5px solid ${c.primaryA20}`,
                  color: c.primaryA80,
                  backdropFilter: 'blur(8px)',
                  background: alpha(c.primary, 0.06),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: c.primaryA15,
                    borderColor: c.primaryA50,
                    color: c.primaryLight,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${c.primaryA30}`
                  }
                }}
              >
                <Icon icon={s.icon} fontSize={24} />
              </IconButton>
            </MotionBox>
          ))}
        </MotionBox>

        {/* ── Contact info (phone, address) ────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mb: { xs: 5, md: 6 }
          }}
        >
          {CONTACT_ITEMS.map(({ icon, text }) => (
            <Box
              key={icon}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: c.primaryA8,
                  border: `1px solid ${c.primaryA15}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon icon={icon} fontSize={16} style={{ color: c.primaryLight }} />
              </Box>
              <Typography
                variant='body2'
                sx={{
                  color: c.primaryA60,
                  lineHeight: 1.6,
                  textAlign: 'left'
                }}
              >
                {text}
              </Typography>
            </Box>
          ))}
        </MotionBox>
      </Container>

      {/* ── Bottom bar (Privacy, Terms, Copyright) ─────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          pb: { xs: 3, md: 4 },
          pt: { xs: 3, md: 4 }
        }}
      >
        <Container maxWidth='md'>
          <Divider sx={{ borderColor: c.primaryA12, mb: 3 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            {/* Copyright */}
            <Typography
              variant='caption'
              sx={{
                color: c.textPrimaryA50,
                fontWeight: 500
              }}
            >
              © 2026 Citronics. All rights reserved.
            </Typography>

            {/* Policy links */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography
                variant='caption'
                component='a'
                href='#'
                sx={{
                  color: c.textPrimaryA55,
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                  '&:hover': { color: c.primary }
                }}
              >
                Privacy Policy
              </Typography>
              <Typography variant='caption' sx={{ color: c.textPrimaryA25 }}>
                |
              </Typography>
              <Typography
                variant='caption'
                component='a'
                href='#'
                sx={{
                  color: c.textPrimaryA55,
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                  '&:hover': { color: c.primary }
                }}
              >
                Terms & Conditions
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
