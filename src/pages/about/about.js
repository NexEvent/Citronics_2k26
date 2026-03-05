import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const HIGHLIGHTS = [
  {
    icon: 'tabler:trophy',
    title: '35+ Competitions',
    description:
      'From AI & ML challenges to robotics, coding battles, and management case studies — every domain has its arena.',
    paletteKey: 'primary'
  },
  {
    icon: 'tabler:users',
    title: '5000+ Participants',
    description:
      'Students from across India converge to compete, collaborate, and connect in one of Central India\'s largest tech fests.',
    paletteKey: 'success'
  },
  {
    icon: 'tabler:calendar-event',
    title: '3 Days of Action',
    description:
      'Three packed days of competitions, keynotes, workshops, cultural performances, and networking opportunities.',
    paletteKey: 'info'
  },
  {
    icon: 'tabler:bulb',
    title: 'Innovation First',
    description:
      'Every event is designed to push boundaries — fostering creative thinking, problem-solving, and entrepreneurial spirit.',
    paletteKey: 'warning'
  }
]

const TEAM_SECTIONS = [
  {
    title: 'Faculty Coordinators',
    icon: 'tabler:school',
    color: 'primary',
    members: [
      { name: 'Dr. [Faculty Name]', role: 'Faculty in Charge', dept: 'CSE' },
      { name: 'Prof. [Faculty Name]', role: 'Co-Coordinator', dept: 'IT' }
    ]
  },
  {
    title: 'Student Core Team',
    icon: 'tabler:users-group',
    color: 'success',
    members: [
      { name: '[Student Name]', role: 'Event Head', dept: 'Final Year CSE' },
      { name: '[Student Name]', role: 'Technical Lead', dept: 'Final Year IT' },
      { name: '[Student Name]', role: 'Operations Lead', dept: 'Third Year CSE' }
    ]
  }
]

/* ────────────────────────────────────────────────────── */

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

function HightlightCard({ item, index }) {
  const c = useAppPalette()
  const color = c.theme.palette[item.paletteKey]?.main || c.primary

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      sx={{
        p: { xs: 3, md: 4 },
        height: '100%',
        borderRadius: '24px',
        background: c.isDark ? alpha(c.bgPaper, 0.5) : alpha(c.bgPaper, 0.7),
        border: `1px solid ${c.isDark ? alpha(color, 0.18) : alpha(color, 0.12)}`,
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.35)}`,
          boxShadow: `0 20px 60px ${alpha(color, 0.1)}`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        },
        '&:hover::before': { opacity: 1 }
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          background: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5
        }}
      >
        <Icon icon={item.icon} fontSize={26} style={{ color }} />
      </Box>
      <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
        {item.title}
      </Typography>
      <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.75 }}>
        {item.description}
      </Typography>
    </MotionBox>
  )
}

/* ── Main About Page ─────────────────────────────────────────── */

export default function AboutPage() {
  const c = useAppPalette()

  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
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
        {/* Glow blob */}
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
            {/* Badge */}
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
              <Icon icon='tabler:sparkles' fontSize={14} style={{ color: c.primary }} />
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
              About Citronics
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 620,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 5
              }}
            >
              Citronics is the flagship annual techno-management fest of Chameli Devi Group of Institutions, Indore.
              A convergence of brilliant minds, innovative ideas, and relentless competition — shaping the engineers and leaders of tomorrow.
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
                href='/'
                size='large'
                startIcon={<Icon icon='tabler:home' />}
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
                Back to Home
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <Container maxWidth='lg' sx={{ mb: { xs: 10, md: 14 } }}>
        <Grid container spacing={3}>
          {[
            { value: '35+', label: 'Technical Events', icon: 'tabler:code', colorKey: 'primary' },
            { value: '3', label: 'Days of Fest', icon: 'tabler:calendar-event', colorKey: 'info' },
            { value: '5K+', label: 'Participants', icon: 'tabler:users', colorKey: 'success' },
            { value: '₹2L+', label: 'Prize Pool', icon: 'tabler:trophy', colorKey: 'warning' }
          ].map((s, i) => (
            <Grid item xs={6} md={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── What is Citronics ────────────────────────────────────── */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: c.isDark ? alpha(c.bgPaper, 0.3) : alpha(c.bgPaper, 0.6) }}>
        <Container maxWidth='lg'>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems='center'>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial='hidden'
                whileInView='show'
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    borderRadius: '100px',
                    background: alpha(c.primary, 0.08),
                    border: `1px solid ${alpha(c.primary, 0.15)}`,
                    mb: 2.5
                  }}
                >
                  <Icon icon='tabler:info-circle' fontSize={13} style={{ color: c.primary }} />
                  <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                    OUR STORY
                  </Typography>
                </Box>

                <Typography variant='h3' sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.5px' }}>
                  More Than a Tech Fest
                </Typography>

                <Typography variant='body1' sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 3, fontSize: '1.05rem' }}>
                  Since its inception, Citronics has grown from a small departmental event to one of Central India's most anticipated collegiate festivals.
                  It brings together students from engineering, management, and design disciplines to compete, collaborate, and create.
                </Typography>

                <Typography variant='body1' sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 4, fontSize: '1.05rem' }}>
                  Each year the theme evolves — this year, <strong style={{ color: c.textPrimary }}>
                  "AI for Sustainable Tomorrow"</strong> guides every event, workshop, and keynote toward responsible innovation.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: 'tabler:map-pin', text: 'Chameli Devi Group of Institutions, Indore, MP' },
                    { icon: 'tabler:calendar', text: 'March 2026 — 3 days of non-stop innovation' },
                    { icon: 'tabler:mail', text: 'citronics@cdgi.edu.in' }
                  ].map(item => (
                    <Box key={item.text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          bgcolor: alpha(c.primary, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.25
                        }}
                      >
                        <Icon icon={item.icon} fontSize={16} style={{ color: c.primary }} />
                      </Box>
                      <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.6, pt: 0.5 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: `1px solid ${c.isDark ? alpha(c.primary, 0.12) : alpha(c.primary, 0.08)}`,
                  boxShadow: `0 24px 80px ${alpha(c.primary, 0.1)}`,
                  height: { xs: 280, md: 420 },
                  position: 'relative'
                }}
              >
                <Box
                  component='img'
                  src='/imagesB.jpg'
                  alt='Citronics 2026'
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: c.isDark ? 'brightness(0.7) contrast(1.05)' : 'brightness(0.9)'
                  }}
                />
                {/* overlay pill badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    px: 2.5,
                    py: 1.25,
                    borderRadius: '14px',
                    background: alpha(c.isDark ? '#000' : '#fff', 0.7),
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${alpha(c.primary, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Icon icon='tabler:sparkles' fontSize={18} style={{ color: c.primary }} />
                  <Box>
                    <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                      CITRONICS 2026
                    </Typography>
                    <Typography variant='caption' sx={{ color: c.textSecondary, lineHeight: 1.2 }}>
                      AI for Sustainable Tomorrow
                    </Typography>
                  </Box>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Why Citronics highlights ─────────────────────────────── */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth='lg'>
          <MotionBox
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeUp}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
              Why Participate?
            </Typography>
            <Typography variant='body1' sx={{ color: c.textSecondary, maxWidth: 520, mx: 'auto', lineHeight: 1.75 }}>
              Whether you compete, volunteer, or spectate — Citronics leaves a mark.
            </Typography>
          </MotionBox>

          <Grid container spacing={3}>
            {HIGHLIGHTS.map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <HightlightCard item={item} index={i} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CDGI Info ────────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: c.isDark ? alpha(c.bgPaper, 0.25) : alpha(c.bgPaper, 0.55)
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems='center'>
            <Grid item xs={12} md={5}>
              <MotionBox initial='hidden' whileInView='show' viewport={{ once: true }} variants={fadeUp}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    borderRadius: '100px',
                    background: alpha(c.info, 0.08),
                    border: `1px solid ${alpha(c.info, 0.15)}`,
                    mb: 2.5
                  }}
                >
                  <Icon icon='tabler:school' fontSize={13} style={{ color: c.info }} />
                  <Typography variant='caption' sx={{ color: c.info, fontWeight: 700, letterSpacing: 1.5 }}>
                    ABOUT CDGI
                  </Typography>
                </Box>

                <Typography variant='h4' sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  Chameli Devi Group of Institutions
                </Typography>

                <Typography variant='body1' sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 3, fontSize: '1rem' }}>
                  CDGI is one of Madhya Pradesh's premier educational institutions, with a legacy of academic excellence across engineering,
                  management, pharmacy, and more. The institute fosters innovation through its strong industry connections and student-driven culture.
                </Typography>

                <Divider sx={{ my: 3, borderColor: c.isDark ? alpha(c.white, 0.08) : alpha(c.primary, 0.1) }} />

                <Box sx={{ display: 'flex', gap: 4 }}>
                  {[
                    { value: '20+', label: 'Years of Excellence' },
                    { value: '15K+', label: 'Alumni Network' },
                    { value: 'NAAC', label: 'Accredited' }
                  ].map(s => (
                    <Box key={s.label} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: c.primary, lineHeight: 1 }}>
                        {s.value}
                      </Typography>
                      <Typography variant='caption' sx={{ color: c.textSecondary, fontWeight: 500 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {[
                  { icon: 'tabler:building-community', title: 'State-of-the-Art Campus', desc: 'Modern labs, hackathon spaces, and a dedicated innovation hub spread across a sprawling campus in Indore.' },
                  { icon: 'tabler:certificate', title: 'Industry Partnerships', desc: 'Collaborations with leading tech companies ensure students get real-world exposure and placement opportunities.' },
                  { icon: 'tabler:chart-line', title: 'Research & Innovation', desc: 'Active research programs and incubation support for student startups, with dedicated mentors and seed funding.' },
                  { icon: 'tabler:hearts', title: 'Strong Alumni Network', desc: 'Thousands of alumni placed at top MNCs and startups form a vibrant support network for current students.' }
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={item.title}>
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      sx={{
                        p: 3,
                        borderRadius: '18px',
                        border: `1px solid ${c.isDark ? alpha(c.white, 0.06) : alpha(c.primary, 0.08)}`,
                        background: c.isDark ? alpha(c.bgPaper, 0.4) : alpha(c.bgDefault, 0.6),
                        backdropFilter: 'blur(12px)',
                        height: '100%'
                      }}
                    >
                      <Icon icon={item.icon} fontSize={22} style={{ color: c.info, marginBottom: 8 }} />
                      <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.75 }}>
                        {item.title}
                      </Typography>
                      <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.65, fontSize: '0.82rem' }}>
                        {item.desc}
                      </Typography>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA strip ────────────────────────────────────────────── */}
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
