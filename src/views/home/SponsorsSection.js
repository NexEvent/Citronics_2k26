import { memo, useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'

const MotionBox = motion(Box)

/* ── Sponsor data with Iconify icon keys ───────────────────────────────── */
// colorKey maps to a token in useAppPalette() — no hardcoded hex values
const SPONSORS = [
  { name: 'JetBrains',    icon: 'simple-icons:jetbrains',    colorKey: 'error' },
  { name: 'AWS',          icon: 'simple-icons:amazonaws',    colorKey: 'warning' },
  { name: 'GitHub',       icon: 'simple-icons:github',       colorKey: 'primary' },
  { name: 'Postman',      icon: 'simple-icons:postman',      colorKey: 'warning' },
  { name: 'MongoDB',      icon: 'simple-icons:mongodb',      colorKey: 'success' },
  { name: 'Vercel',       icon: 'simple-icons:vercel',       colorKey: 'textSecondary' },
  { name: 'Cloudinary',   icon: 'simple-icons:cloudinary',   colorKey: 'info' },
  { name: 'Razorpay',     icon: 'simple-icons:razorpay',     colorKey: 'primaryLight' },
  { name: 'Figma',        icon: 'simple-icons:figma',        colorKey: 'error' },
  { name: 'Notion',       icon: 'simple-icons:notion',       colorKey: 'textDisabled' },
  { name: 'Google Cloud', icon: 'simple-icons:googlecloud',  colorKey: 'info' },
  { name: 'DigitalOcean', icon: 'simple-icons:digitalocean', colorKey: 'primaryDark' }
]

/* ── Helpers ───────────────────────────────────────────────────────────── */

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function distributeLogos(allLogos, columnCount) {
  const shuffled = shuffleArray(allLogos)
  const columns = Array.from({ length: columnCount }, () => [])
  shuffled.forEach((logo, i) => { columns[i % columnCount].push(logo) })
  const maxLen = Math.max(...columns.map(col => col.length))
  columns.forEach(col => {
    while (col.length < maxLen) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })
  return columns
}

/* ── Single animated logo column ───────────────────────────────────────── */

const LogoColumn = memo(function LogoColumn({ logos, index, currentTime, c }) {
  const cycleInterval = 2400
  const columnDelay = index * 250
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
  const currentIndex = Math.floor(adjustedTime / cycleInterval)
  const sponsor = logos[currentIndex]

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 90, md: 120 },
        width: { xs: 90, md: 120 },
        overflow: 'hidden'
      }}
    >
      <AnimatePresence mode='wait'>
        <MotionBox
          key={`${sponsor.name}-${currentIndex}`}
          initial={{ y: '15%', opacity: 0, filter: 'blur(6px)' }}
          animate={{
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 280, damping: 22, duration: 0.5 }
          }}
          exit={{
            y: '-20%',
            opacity: 0,
            filter: 'blur(5px)',
            transition: { ease: 'easeIn', duration: 0.25 }
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <Icon
            icon={sponsor.icon}
            fontSize={48}
            style={{ color: c[sponsor.colorKey] }}
          />
          <Typography
            variant='caption'
            sx={{
              color: c.textSecondary,
              fontWeight: 600,
              fontSize: { xs: '0.6rem', md: '0.72rem' },
              textAlign: 'center',
              lineHeight: 1.2,
              px: 0.5
            }}
          >
            {sponsor.name}
          </Typography>
        </MotionBox>
      </AnimatePresence>
    </Box>
  )
})

/* ── Tier badge row ────────────────────────────────────────────────────── */

// Tiered sponsor grid removed — only animated logo columns are shown now.

/* ═══════════════════════════════════════════════════════════════════════════
 *  SponsorsSection — Citronics 2026
 * ═════════════════════════════════════════════════════════════════════════ */

export default function SponsorsSection() {
  const c = useAppPalette()
  const columnCount = 3

  const [logoSets, setLogoSets] = useState([])
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => setCurrentTime(prev => prev + 300), [])

  useEffect(() => {
    const id = setInterval(updateTime, 300)
    return () => clearInterval(id)
  }, [updateTime])

  useEffect(() => {
    setLogoSets(distributeLogos(SPONSORS, columnCount))
  }, [columnCount])

  // No tiered grid — keep only the animated columns

  return (
    <Box
      component='section'
      sx={{
        py: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth='lg'>
        {/* ── Header ─────────────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}
        >
          <Typography
            variant='overline'
            sx={{
              color: c.primary,
              letterSpacing: 4,
              fontWeight: 700,
              mb: 1.5,
              display: 'block'
            }}
          >
            OUR SPONSORS & PARTNERS
          </Typography>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: c.textPrimary,
              mb: 1.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' }
            }}
          >
            Powering Citronics 2026
          </Typography>
          
        </MotionBox>

        {/* ── Animated logo carousel ─────────────────────────────── 
        <MotionBox
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1.5, md: 2.5 },
            mb: { xs: 3, md: 4 }
          }}
        >
          {logoSets.map((logos, index) => (
            <LogoColumn
              key={index}
              logos={logos}
              index={index}
              currentTime={currentTime}
              c={c}
            />
          ))}
        </MotionBox>
*/}
        {/* Tier list intentionally removed — animation only section */}
      </Container>
    </Box>
  )
}