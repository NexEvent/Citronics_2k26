import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import { alpha } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'
import themeConfig from 'src/configs/themeConfig'

// ── Data ──────────────────────────────────────────────────────────────────────

const LINK_COLUMN_1 = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Ticketing Terms & Conditions', href: '/terms-ticketing' },
  { label: 'Privacy Policy', href: '/privacy' }
]

const LINK_COLUMN_2 = [
  { label: 'Social Media Disclaimer', href: '/social-disclaimer' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Accessibility Statement', href: '/accessibility' }
]

const SOCIAL_LINKS = [
  { icon: 'tabler:brand-facebook', href: '#', label: 'Facebook' },
  { icon: 'tabler:brand-x', href: '#', label: 'X (Twitter)' },
  { icon: 'tabler:brand-instagram', href: '#', label: 'Instagram' }
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Footer — Professional footer with fixed-dimension logo handling.
 *
 * The Citronics logo has both horizontal and vertical content (wordmark + tagline),
 * so we constrain it with BOTH width and height + object-fit:contain to keep
 * the logo large and readable without inflating the footer.
 */
export default function Footer() {
  const c = useAppPalette()

  const cardBg = c.isDark
    ? alpha(c.bgPaper, 0.55)
    : alpha(c.grey[100], 0.7)

  const cardBorder = c.isDark
    ? `1px solid ${c.primaryA15}`
    : `1px solid ${c.primaryA12}`

  const linkColor = c.isDark ? c.whiteA65 : c.textSecondary

  /* Shared link styles */
  const linkSx = {
    color: linkColor,
    textDecoration: 'none',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontSize: { xs: '0.82rem', md: '0.88rem' },
    transition: 'color 0.2s',
    '&:hover': { color: c.primary }
  }

  return (
    <Box
      component='footer'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        pt: { xs: 4, md: 6 },
        pb: 0,
        mx: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* ─── Main card ─────────────────────────────────────────────── */}
      <Box
        sx={{
          borderRadius: { xs: '20px', md: '28px' },
          border: cardBorder,
          bgcolor: cardBg,
          backdropFilter: 'blur(16px)',
          px: { xs: 3, sm: 5, md: 6 },
          py: { xs: 3, md: 4 }
        }}
      >
        {/* ── Upper section: logo + info | link columns ────────────── */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems='flex-start'>
          {/* Left — Logo + Address + Phone */}
          <Grid item xs={12} md={5}>
            {/*
              Logo: constrained by BOTH width AND height simultaneously.
              object-fit:contain scales the image to the largest size that
              fits within the box. object-position:left keeps it pinned
              to the left edge. This prevents the logo from ever inflating
              the footer height, regardless of the image's aspect ratio.
            */}
            <Box
              component='img'
              src='/logo/citronics2.png'
              alt={themeConfig.templateName}
              sx={{
                width: { xs: 220, sm: 260, md: 300 },
                height: { xs: 60, sm: 70, md: 80 },
                maxWidth: '100%',
                objectFit: 'contain',
                objectPosition: 'left',
                display: 'block',
                mb: 2
              }}
            />

            <Typography
              variant='body2'
              sx={{
                color: c.isDark ? c.whiteA65 : c.textSecondary,
                fontWeight: 500,
                lineHeight: 1.55
              }}
            >
              Chameli Devi Group Of Institutions
              <br />
              Indore, Madhya Pradesh — 452020
            </Typography>

            <Typography
              variant='body1'
              component='a'
              href='tel:+919876543210'
              sx={{
                fontWeight: 600,
                color: c.primary,
                textDecoration: 'none',
                display: 'inline-block',
                mt: 1,
                fontSize: '0.95rem',
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.8 }
              }}
            >
              +91 98765 43210
            </Typography>
          </Grid>

          {/* Right — Two link columns */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={{ xs: 3, sm: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: { xs: 0, md: 1 } }}>
                  {LINK_COLUMN_1.map(link => (
                    <Link key={link.label} href={link.href} passHref legacyBehavior>
                      <Typography component='a' variant='body1' sx={linkSx}>
                        {link.label}
                      </Typography>
                    </Link>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: { xs: 0, md: 1 } }}>
                  {LINK_COLUMN_2.map(link => (
                    <Link key={link.label} href={link.href} passHref legacyBehavior>
                      <Typography component='a' variant='body1' sx={linkSx}>
                        {link.label}
                      </Typography>
                    </Link>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <Divider
          sx={{
            borderColor: c.isDark ? c.whiteA10 : c.primaryA12,
            my: { xs: 2.5, md: 3 }
          }}
        />

        {/* ── Bottom bar: copyright | social | badge ─────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2.5, md: 2 },
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          {/* Left — Copyright */}
          <Typography
            variant='body2'
            sx={{
              color: c.isDark ? c.whiteA40 : c.textPrimaryA50,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              order: { xs: 3, md: 1 }
            }}
          >
            © {new Date().getFullYear()} {themeConfig.templateName}
          </Typography>

          {/* Center — Social icons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              order: { xs: 1, md: 2 }
            }}
          >
            {SOCIAL_LINKS.map(s => (
              <IconButton
                key={s.label}
                component='a'
                href={s.href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={s.label}
                size='small'
                sx={{
                  color: c.isDark ? c.whiteA65 : c.textSecondary,
                  border: `1px solid ${c.isDark ? c.whiteA15 : c.primaryA12}`,
                  width: 36,
                  height: 36,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    color: c.primary,
                    borderColor: c.primaryA50,
                    bgcolor: c.primaryA8,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 14px ${c.primaryA20}`
                  }
                }}
              >
                <Icon icon={s.icon} fontSize={17} />
              </IconButton>
            ))}
          </Box>

          {/* Right — Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              order: { xs: 2, md: 3 }
            }}
          >
            <Box
              component='img'
              src='/logo/citronics2.png'
              alt={`${themeConfig.templateName} Badge`}
              sx={{
                width: 100,
                height: 32,
                objectFit: 'contain',
                objectPosition: 'right'
              }}
            />
            <Typography
              variant='caption'
              sx={{
                color: c.isDark ? c.whiteA40 : c.textPrimaryA50,
                fontWeight: 600,
                lineHeight: 1.4,
                whiteSpace: 'nowrap'
              }}
            >
              CDGI Technical Fest
              <br />
              Event Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Spacer */}
      <Box sx={{ height: { xs: 16, md: 24 } }} />
    </Box>
  )
}
