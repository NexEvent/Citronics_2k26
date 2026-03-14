import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'
import { AboutSEO } from 'src/components/SEO'

const MotionBox = motion(Box)

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

/* ── Reusable Section Heading ─────────────────────────────── */

function SectionBadge({ icon, label, color }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.5,
        borderRadius: '100px',
        background: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.18)}`,
        mb: 2.5
      }}
    >
      <Icon icon={icon} fontSize={13} style={{ color }} />
      <Typography variant='caption' sx={{ color, fontWeight: 700, letterSpacing: 1.5 }}>
        {label}
      </Typography>
    </Box>
  )
}

/* ── Content Section (text block with heading + paragraphs) ── */

function ContentSection({ badge, title, paragraphs, bulletTitle, bullets, children }) {
  const c = useAppPalette()

  return (
    <MotionBox
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      sx={{ textAlign: 'center' }}
    >
      {badge}
      <Typography
        variant='h3'
        sx={{
          fontWeight: 800,
          mb: 3,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          fontSize: { xs: '1.75rem', md: '2.25rem' }
        }}
      >
        {title}
      </Typography>

      {paragraphs.map((text, i) => (
        <Typography
          key={i}
          variant='body1'
          sx={{
            color: c.textSecondary,
            lineHeight: 1.85,
            mb: 2.5,
            fontSize: { xs: '0.95rem', md: '1.05rem' }
          }}
        >
          {text}
        </Typography>
      ))}

      {bulletTitle && (
        <Typography
          variant='body1'
          sx={{
            color: c.textSecondary,
            lineHeight: 1.85,
            mb: 1.5,
            fontSize: { xs: '0.95rem', md: '1.05rem' }
          }}
        >
          {bulletTitle}
        </Typography>
      )}

      {bullets && bullets.length > 0 && (
        <Box component='ul' sx={{ pl: 2.5, m: 0, mb: 2.5, display: 'inline-block', textAlign: 'left' }}>
          {bullets.map((item, i) => (
            <Box
              component='li'
              key={i}
              sx={{
                color: c.textSecondary,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.85,
                mb: 0.75,
                '&::marker': { color: c.primary, fontWeight: 700 }
              }}
            >
              {item}
            </Box>
          ))}
        </Box>
      )}

      {children}
    </MotionBox>
  )
}

/* ── Stat Card ────────────────────────────────────────────── */

function StatCard({ value, label, icon, colorKey }) {
  const c = useAppPalette()
  const color = c.theme.palette[colorKey]?.main || c.primary

  return (
    <MotionBox
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: '20px',
        textAlign: 'center',
        background: c.isDark ? alpha(color, 0.07) : alpha(color, 0.04),
        border: `1px solid ${alpha(color, 0.15)}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${alpha(color, 0.12)}`
        }
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          background: alpha(color, 0.12),
          border: `1px solid ${alpha(color, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}
      >
        <Icon icon={icon} fontSize={26} style={{ color }} />
      </Box>
      <Typography
        sx={{
          fontSize: { xs: '2rem', md: '2.5rem' },
          fontWeight: 800,
          color,
          lineHeight: 1,
          mb: 0.5
        }}
      >
        {value}
      </Typography>
      <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500 }}>
        {label}
      </Typography>
    </MotionBox>
  )
}

/* ════════════════════════════════════════════════════════════
   Main About Page
   ════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  const c = useAppPalette()

  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <AboutSEO />
      <PublicNavbar />

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 10, md: 14 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha(c.primary, 0.05)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(c.primary, 0.05)} 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
            zIndex: 0
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '50vw',
            height: '50vw',
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(c.primary, 0.1)} 0%, transparent 70%)`,
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: '100px',
                background: alpha(c.primary, 0.08),
                border: `1px solid ${alpha(c.primary, 0.2)}`,
                mb: 3
              }}
            >
              <Icon icon='tabler:school' fontSize={14} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                CDGI • INDORE
              </Typography>
            </Box>

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-1.5px',
                lineHeight: 1.05,
                mb: 3,
                background: `linear-gradient(135deg, ${c.textPrimary} 0%, ${c.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              About CDGI
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 660,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 5
              }}
            >
              Learn about Chameli Devi Group of Institutions — one of Central India's most prominent educational
              groups dedicated to delivering excellence in technical, professional, management, pharmacy & law education.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                href='/events'
                size='large'
                endIcon={<Icon icon='tabler:arrow-right' />}
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: '14px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: c.gradientPrimary,
                  boxShadow: `0 8px 32px ${alpha(c.primary, 0.3)}`,
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 40px ${alpha(c.primary, 0.4)}` },
                  transition: 'all 0.3s ease'
                }}
              >
                Explore Events
              </Button>
              <Button
                variant='outlined'
                href='/about-citronics'
                size='large'
                startIcon={<Icon icon='tabler:rocket' />}
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: '14px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: alpha(c.primary, 0.25),
                  color: c.textPrimary,
                  '&:hover': { borderColor: c.primary, bgcolor: alpha(c.primary, 0.06) },
                  transition: 'all 0.3s ease'
                }}
              >
                About Citronics
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

     

      {/* ══════════════════════════════════════════════════════════
          Section 1 — About CDGI
          ══════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: c.isDark ? alpha(c.bgPaper, 0.3) : alpha(c.bgPaper, 0.6) }}>
        <Container maxWidth='md'>
          <Grid container justifyContent='center'>
            <Grid item xs={12}>
              <ContentSection
                badge={<SectionBadge icon='tabler:school' label='ABOUT CDGI' color={c.info} />}
                title='Chameli Devi Group of Institutions'
                paragraphs={[
                  'Chameli Devi Group of Institutions (CDGI), Indore, is one of the most prominent educational groups in Central India, dedicated to delivering excellence in technical, professional, management, pharmacy & law education.',
                  'Established under the esteemed aegis of the Agarwal Group, CDGI has consistently focused on fostering academic excellence, industry engagement, research, innovation, and holistic student development.',
                  'The group offers a wide spectrum of undergraduate and postgraduate programs across diverse disciplines including Engineering, Management, Professional Courses, Pharmacy, and Law, catering to students from varied academic backgrounds and nurturing them into competent professionals.',
                  'Recognized for its commitment to quality education, CDGI is accredited with NAAC A+ and hosts NBA-accredited program in UG-CSE, reflecting its dedication to maintaining high academic standards. The institution boasts strong placement records, extensive industry collaborations, and opportunities for global certifications, enabling students to stay aligned with evolving industry requirements.',
                  'Through strategic partnerships with leading technology giants such as Microsoft and Google, along with active participation in hackathons, research initiatives, innovation challenges, and national-level competitions, CDGI has built a dynamic learning ecosystem that encourages students to think creatively, innovate fearlessly, and emerge as future leaders.',
                  'By blending academic rigor with practical exposure, CDGI continues to shape talented individuals who are ready to contribute meaningfully to society, industry, and the global technological landscape.'
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>





      {/* ── CTA Strip ────────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${alpha(c.primary, 0.06)} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
        <Container maxWidth='sm' sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox initial='hidden' whileInView='show' viewport={{ once: true }} variants={fadeUp}>
            <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
              Ready to Compete?
            </Typography>
            <Typography variant='body1' sx={{ color: c.textSecondary, mb: 5, lineHeight: 1.75 }}>
              Browse all 35+ events and register your team. Early bird slots fill fast.
            </Typography>
            <Button
              variant='contained'
              href='/events'
              size='large'
              endIcon={<Icon icon='tabler:arrow-right' />}
              sx={{
                px: 6,
                py: 1.8,
                borderRadius: '14px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                background: c.gradientPrimary,
                boxShadow: `0 8px 32px ${alpha(c.primary, 0.35)}`,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 14px 44px ${alpha(c.primary, 0.45)}` },
                transition: 'all 0.3s ease'
              }}
            >
              View All Events
            </Button>
          </MotionBox>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
AboutPage.authGuard = false
AboutPage.guestGuard = false
AboutPage.getLayout = page => page