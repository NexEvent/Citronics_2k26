import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)



/* ── 21st.dev-style Countdown Card ────────────────────────────── */
function CountCard({ value, label }) {
  const c = useAppPalette()
  const isDark = c.isDark

  const cardBg = isDark ? c.bgPaperA12 : c.bgPaperA70
  const borderCol = isDark ? c.primaryA20 : c.primaryA15
  const numColor = c.textPrimary
  const labelColor = c.textSecondaryA70

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      {/* Card */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 80, sm: 100, md: 120 },
          height: { xs: 90, sm: 110, md: 130 },
          borderRadius: '8px',
          background: cardBg,
          border: `1px solid ${borderCol}`,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 4px 24px ${isDark ? c.primaryA8 : alpha(c.primary, 0.05)},
                      inset 0 1px 0 ${alpha(c.white, isDark ? 0.05 : 0.6)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${c.primaryA40}, transparent)`
          }
        }}
      >
          <Typography
            sx={{
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: numColor,
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
              lineHeight: 1,
              fontFamily: '"Inter", "SF Mono", monospace'
            }}
          >
            {String(value).padStart(2, '0')}
          </Typography>
      </Box>
      {/* Label */}
      <Typography
        sx={{
          color: labelColor,
          textTransform: 'uppercase',
          letterSpacing: 2.5,
          fontWeight: 600,
          fontSize: { xs: '0.6rem', sm: '0.65rem' }
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function CountColon() {
  const c = useAppPalette()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pt: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 0.5, sm: 1 }
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: c.primary,
          opacity: 1
        }}
      />
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: c.primary,
          opacity: 1
        }}
      />
    </Box>
  )
}



/* ── Extract first image from an event ───────────────────────── */
function getEventImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

/* ═══════════ HERO SECTION ═══════════════════════════════════════ */
export default function HeroSection() {
  const c = useAppPalette()
  const isDark = c.isDark
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date('2026-04-07T09:00:00') - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    }
  })

  /* ── Fetch logos from page_media table ─────────────────────── */
  const [logos, setLogos] = useState({})

  useEffect(() => {
    let cancelled = false
    axios.get('/api/media/hero').then(res => {
      if (cancelled || !res.data?.success) return
      const map = {}
      res.data.data.forEach(row => {
        if (row.name && row.links) map[row.name] = row.links
      })
      setLogos(map)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  /* ── Fetch event images for marquee ────────────────────────── */
  const [eventImages, setEventImages] = useState([])

  useEffect(() => {
    let cancelled = false
    axios.get('/api/events?limit=50').then(res => {
      if (cancelled || !res.data?.success) return
      const imgs = []
      res.data.data.forEach(ev => {
        const url = getEventImage(ev)
        if (url) imgs.push(url)
      })
      setEventImages(imgs)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  /* ── Theme-aware color helpers ──────────────────────────────── */
  const heroText = c.heroText
  const heroTextMuted = alpha(heroText, 0.5)
  const heroBorder = alpha(heroText, isDark ? 0.08 : 0.1)

  useEffect(() => {
    const target = new Date('2026-04-07T09:00:00').getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) return setTimeLeft(prev => prev.seconds === 0 && prev.days === 0 ? prev : { days: 0, hours: 0, minutes: 0, seconds: 0 })
      const next = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      }
      setTimeLeft(prev =>
        prev.days === next.days && prev.hours === next.hours &&
        prev.minutes === next.minutes && prev.seconds === next.seconds
          ? prev
          : next
      )
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])



  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <Box
      component='section'
      id='hero'
      aria-label='Hero'
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        /* xs: reduced from 24 — no top navbar on mobile any more */
        pt: { xs: 4, md: 16 },
        pb: { xs: 6, md: 10 }
      }}
    >
      {/* Top fade */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 120,
          background: `linear-gradient(180deg, ${c.bgDefaultA40} 0%, transparent 100%)`,
          zIndex: 1, pointerEvents: 'none'
        }}
      />

      <Container maxWidth='xl' sx={{ position: 'relative', zIndex: 2 }}>
        <MotionBox variants={stagger} initial='hidden' animate='visible'>

          {/* ── Logo ────────────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1.5, md: 1 }, mb: { xs: 3, md: 4 } }}>

            {/* Mobile: 4 partner logos above citronics */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 2,
                width: '100%',
                mb: 1
              }}
            >
              {['agr2', 'cdgi', 'nacc', 'nba'].map((name) => (
                <Box
                  key={name}
                  component='img'
                  src={logos[name]}
                  alt={name}
                  sx={{
                    width: 90,
                    height: 90,
                    objectFit: 'contain',
                    filter: isDark ? 'drop-shadow(0 0 8px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
                  }}
                />
              ))}
            </Box>

            {/* Desktop: [agr2][cdgi]  ──  [citronics]  ──  [nacc][nba] */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                px: { md: 4, lg: 6 }
              }}
            >
              {/* Left group */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 3, lg: 4 } }}>
                <Box
                  component='img'
                  src={logos.agr2}
                  alt='agr2'
                  sx={{
                    width: { md: 120, lg: 140 },
                    height: 'auto',
                    objectFit: 'contain',
                    filter: isDark ? 'drop-shadow(0 0 10px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.08)' }
                  }}
                />
                <Box
                  component='img'
                  src={logos.cdgi}
                  alt='cdgi'
                  sx={{
                    width: { md: 120, lg: 140 },
                    height: 'auto',
                    objectFit: 'contain',
                    ml: { md: 2, lg: 7},
                    filter: isDark ? 'drop-shadow(0 0 10px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.08)' }
                  }}
                />
              </Box>

              {/* Citronics logo (centre) */}
              <Box
                component='img'
                src={logos.citronics}
                alt='Citronics Logo'
                sx={{
                  width: { md: '38vw', lg: '32vw' },
                  maxWidth: 560,
                  minWidth: 220,
                  height: 'auto',
                  objectFit: 'contain',
                  filter: isDark ? 'drop-shadow(0 0 40px rgba(255,255,255,0.08))' : 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))',
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.03)' }
                }}
              />

              {/* Right group */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 3, lg: 4 } }}>
                <Box
                  component='img'
                  src={logos.nacc}
                  alt='nacc'
                  sx={{
                    width: { md: 120, lg: 140 },
                    height: 'auto',
                    objectFit: 'contain',
                    mr: { md: 2, lg: 6 },
                    filter: isDark ? 'drop-shadow(0 0 10px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.08)' }
                  }}
                />
                <Box
                  component='img'
                  src={logos.nba}
                  alt='nba'
                  sx={{
                    width: { md: 120, lg: 140 },
                    height: 'auto',
                    objectFit: 'contain',
                    filter: isDark ? 'drop-shadow(0 0 10px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.08)' }
                  }}
                />
              </Box>
            </Box>

            {/* Mobile: citronics logo below the partner row */}
            <Box
              component='img'
              src={logos.citronics}
              alt='Citronics Logo'
              sx={{
                display: { xs: 'block', md: 'none' },
                width: { xs: '70vw', sm: '50vw' },
                maxWidth: 480,
                minWidth: 220,
                height: 'auto',
                objectFit: 'contain',
                filter: isDark ? 'drop-shadow(0 0 40px rgba(255,255,255,0.08))' : 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.03)' }
              }}
            />

            {/* "In Collaboration With IMC" + nagar logo */}
            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                lineHeight: 1.3,
                background: c.gradientTriple,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mt: { xs: 1, md: -2 }
              }}
            >
              In Collaboration With IMC
            </Typography>
            <Box
              component='img'
              src={logos.nagar}
              alt='Indore Nagar Palika Nigam'
              sx={{
                width: { xs: 160, sm: 200, md: 260 },
                height: 'auto',
                objectFit: 'contain',
                filter: isDark ? 'drop-shadow(0 0 12px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />
          </MotionBox>

          {/* ── Tagline pill ─────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ textAlign: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'inline-block',
                borderRadius: '9999px',
                border: `1px solid ${heroBorder}`,
                bgcolor: isDark ? alpha(c.bgPaper, 0.5) : alpha(c.bgPaper, 0.5),
                backdropFilter: 'blur(8px)',
                px: 2.5,
                py: 0.75,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: heroTextMuted
              }}
            >
              Citronics 2026 • The Annual Tech Fest
            </Box>
          </MotionBox>

          {/* ── Headline (word-by-word stagger) ──────────────────────── */}
          <MotionBox
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
            }}
            sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}
          >
            <Typography
              component='h1'
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.6rem', sm: '2rem', md: '2.6rem', lg: '3rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: c.textPrimary,
                maxWidth: 900,
                mx: 'auto',
                px: { xs: 2, md: 0 }
              }}
            >
              {'AI for Sustainable Tomorrow: Where Innovation Meets Sustainable Vision'.split(' ').map((word, i) => (
                <MotionBox
                  key={i}
                  component='span'
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
                  }}
                  sx={{ display: 'inline-block', mr: '0.3em' }}
                >
                  {word}
                </MotionBox>
              ))}
            </Typography>
          </MotionBox>

          {/* ── Description ──────────────────────────────────────────── */}
          <MotionBox variants={fadeUp} sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Typography
              sx={{
                color: heroTextMuted,
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                lineHeight: 1.7,
                maxWidth: 640,
                mx: 'auto',
                px: { xs: 2, md: 0 }
              }}
            >
              The flagship annual techno-management fest — where talented minds collide
              across various domain, featuring 35 technical competitions, and 3 electrifying
              days of innovation.
            </Typography>
          </MotionBox>

          {/* ── CTA Button (pill) ────────────────────────────────────── */}
          <MotionBox
            variants={fadeUp}
            sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}
          >
            <MotionBox
              component='a'
              href='/events'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 4,
                py: 1.5,
                borderRadius: '9999px',
                background: c.gradientPrimary,
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: `0 8px 32px ${c.primaryA30}`,
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: `0 12px 40px ${c.primaryA40}`
                }
              }}
            >
              Explore All Events
            </MotionBox>
          </MotionBox>

        </MotionBox>
      </Container>

      {/* ── Animated Image Marquee ──────────────────────────────── */}
      {eventImages.length > 0 && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 220, sm: 260, md: 320 },
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            overflow: 'hidden',
            mb: { xs: 4, md: 6 }
          }}
        >
          <MotionBox
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
            sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'center' }}
          >
            {[...eventImages, ...eventImages].map((src, i) => (
              <Box
                key={i}
                sx={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  height: { xs: 180, md: 250 },
                  flexShrink: 0,
                  transform: `rotate(${i % 2 === 0 ? -2 : 5}deg)`
                }}
              >
                <Box
                  component='img'
                  src={src}
                  alt={`Event ${(i % eventImages.length) + 1}`}
                  loading='lazy'
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }}
                />
              </Box>
            ))}
          </MotionBox>
        </Box>
      )}

      {/* ── Countdown ────────────────────────────────────────────── */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, position: 'relative', zIndex: 2 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
            letterSpacing: 1,
            mb: { xs: 3, md: 4 },
            color: c.textPrimary
          }}
        >
          Reserve Your Spot
        </Typography>
        <Stack
          direction='row'
          justifyContent='center'
          alignItems='flex-start'
          sx={{ gap: { xs: 1.5, sm: 2.5, md: 3 } }}
        >
          <CountCard value={timeLeft.days} label='Days' />
          <CountCard value={timeLeft.hours} label='Hours' />
          <CountCard value={timeLeft.minutes} label='Min' />
          <CountCard value={timeLeft.seconds} label='Sec' />
        </Stack>
      </Box>

      {/* Bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 200,
          background: `linear-gradient(0deg, transparent 0%, transparent 100%)`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </Box>
  )
}
