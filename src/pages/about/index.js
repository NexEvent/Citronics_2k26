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
              About CDGI & Citronics
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
              groups — and CITRONICS, its flagship annual Techno-Management Fest that brings together the brightest
              minds in technology, management, and innovation.
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
            { value: '30+', label: 'Technical Events', icon: 'tabler:code', colorKey: 'primary' },
            { value: '3', label: 'Days of Fest', icon: 'tabler:calendar-event', colorKey: 'info' },
            { value: '2K+', label: 'Participants', icon: 'tabler:users', colorKey: 'success' },
            { value: '₹4L+', label: 'Prize Pool', icon: 'tabler:trophy', colorKey: 'warning' }
          ].map(s => (
            <Grid item xs={6} md={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Container>

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

      {/* ══════════════════════════════════════════════════════════
          Section 2 — About CITRONICS
          ══════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth='md'>
          <Grid container justifyContent='center'>
            <Grid item xs={12}>
              <ContentSection
                badge={<SectionBadge icon='tabler:rocket' label='ABOUT CITRONICS' color={c.primary} />}
                title={"CITRONICS — Central India's Largest Techno-Management Fest"}
                paragraphs={[
                  'CITRONICS is one of Central India\'s largest and most vibrant annual Techno-Management Fests, dedicated to bringing together the brightest minds in technology, management, and innovation.',
                  'Since its inception in 2009, CITRONICS has evolved into a prestigious platform where talented students, innovators, and future leaders from institutions across India come together to showcase their skills, creativity, and technological excellence.',
                  'Over the years, CITRONICS has grown beyond a conventional college fest to become a national-level platform for innovation, competition, and collaboration. The fest hosts a wide range of technical competitions, management challenges, workshops, expert talks, hackathons, and cultural experiences, creating an environment that encourages learning, networking, and idea exchange.',
                  'CITRONICS aims to inspire young minds to think beyond conventional boundaries by providing exposure to emerging technologies, entrepreneurial thinking, and industry-driven management practices.',
                  'By bridging the gap between academia, industry, and innovation, CITRONICS continues to nurture the next generation of technologists, leaders, and changemakers.'
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          Section 3 — About CITRONICS 2K26
          ══════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: c.isDark ? alpha(c.bgPaper, 0.3) : alpha(c.bgPaper, 0.6) }}>
        <Container maxWidth='md'>
          <Grid container justifyContent='center'>
            <Grid item xs={12}>
              <ContentSection
                badge={<SectionBadge icon='tabler:sparkles' label='CITRONICS 2K26' color={c.warning} />}
                title='CITRONICS 2K26 — AI for Sustainable Tomorrow'
                paragraphs={[
                  'CITRONICS 2K26 is the flagship edition of our institute\'s Techno-Management Fest, designed to integrate technology, management, innovation, and social responsibility on one dynamic platform.',
                  'This edition aims to inspire students to explore how cutting-edge technologies can address real-world challenges and contribute to a sustainable future.'
                ]}
              >
                {/* Theme highlight */}
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: '18px',
                    background: c.isDark ? alpha(c.warning, 0.06) : alpha(c.warning, 0.04),
                    border: `1px solid ${alpha(c.warning, 0.18)}`,
                    mb: 3
                  }}
                >
                  <Typography
                    variant='overline'
                    sx={{ color: c.warning, fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 1 }}
                  >
                    Theme
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      fontSize: { xs: '1rem', md: '1.15rem' }
                    }}
                  >
                    "AI for Sustainable Tomorrow: Where Innovation Meets Sustainable Vision"
                  </Typography>
                </Box>

                <Typography
                  variant='body1'
                  sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 2.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  This theme highlights the transformative potential of Artificial Intelligence in solving modern urban
                  and environmental challenges while creating smart, efficient, and sustainable communities.
                </Typography>

                <Typography
                  variant='body1'
                  sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 2.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  Through innovative competitions, idea-pitching platforms, technical events, and collaborative initiatives,
                  participants will explore how AI can be leveraged to develop solutions for real-world sustainability problems.
                </Typography>

                <Typography
                  variant='body1'
                  sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 2.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  A key highlight of CITRONICS 2K26 is our collaboration with the Indore Municipal Corporation, aimed at
                  spreading awareness about the responsible and impactful use of Artificial Intelligence for sustainable
                  urban development.
                </Typography>

                <Typography
                  variant='body1'
                  sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 2.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  This partnership encourages participants to propose AI-driven solutions for smart city challenges,
                  promoting innovative ideas that can contribute to the future development of Indore as a smarter and
                  greener city.
                </Typography>

                <Typography
                  variant='body1'
                  sx={{ color: c.textSecondary, lineHeight: 1.85, mb: 1.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  CITRONICS 2K26 will provide participants with an exceptional opportunity to:
                </Typography>

                <Box component='ul' sx={{ pl: 2.5, m: '0 auto 20px', mb: 2.5, display: 'inline-block', textAlign: 'left' }}>
                  {[
                    'Compete with some of the brightest technical minds from across the country',
                    'Gain exposure to emerging technologies',
                    'Interact with industry experts',
                    'Showcase their innovative potential on a national stage'
                  ].map((item, i) => (
                    <Box
                      component='li'
                      key={i}
                      sx={{
                        color: c.textSecondary,
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        lineHeight: 1.85,
                        mb: 0.75,
                        '&::marker': { color: c.warning, fontWeight: 700 }
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Box>
              </ContentSection>
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