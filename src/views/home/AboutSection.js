import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── Feature data ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    step: 'Step 1',
    title: '30+ Competitions',
    content: 'Battle it out in technical and non-technical competitions across 14 departments — from robotics to coding to debates.',
    image: '/about/one.jpg',
    icon: 'tabler:trophy'
  },
  {
    step: 'Step 2',
    title: 'Learning & Collaboration',
    content: 'Citronics is not just about competition; it’s about learning together. Students collaborate, share knowledge, attend workshops, and gain hands-on experience while connecting with other tech enthusiasts.',
    image: '/about/collab.jpg',
    icon: 'tabler:tools'
  },
  {
    step: 'Step 3',
    title: 'Talent & Opportunities',
    content: 'The event provides a platform for students to present their skills and talents. Through hackathons, tech challenges, and presentations, participants gain recognition, experience, and opportunities for future growth.',
    image: '/about/opportutnities.jpg',
    icon: 'tabler:users'
  },
  
]

/* ── About / Feature-Steps Section ────────────────────────────────────── */
export default function AboutSection() {
  const c = useAppPalette()
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const autoPlayInterval = 4000

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 100 / (autoPlayInterval / 500)
        if (next >= 100) {
          setCurrent(f => (f + 1) % FEATURES.length)
          return 0
        }
        return next
      })
    }, 500)
    return () => clearInterval(timer)
  }, [])

  const handleStepClick = index => {
    setCurrent(index)
    setProgress(0)
  }

  return (
    <Box
      id='about'
      component='section'
      sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}
    >
      <Container maxWidth='xl'>
        {/* Section header */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: c.primaryA8,
              border: `1px solid ${c.primaryA15}`,
              mb: 2.5
            }}
          >
            <Icon icon='tabler:sparkles' fontSize={14} style={{ color: c.primary }} />
            <Typography variant='caption' sx={{ color: c.primary, fontWeight: 600, letterSpacing: 1.5 }}>
              WHY CITRONICS
            </Typography>
          </Box>

          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
            }}
          >
            More Than Just a Tech Fest
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: c.textSecondary, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}
          >
            Citronics is where ambition meets opportunity. Three days of world-class competitions, hands-on workshops, and connections that last a lifetime.
          </Typography>
        </MotionBox>

        {/* Feature steps + image grid */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 6 }
          }}
        >
          {/* ── Steps list (left side) ───────────────────────────────── */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            {FEATURES.map((feature, index) => {
              const isActive = index === current
              const isPast = index < current

              return (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => handleStepClick(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 2, md: 3 },
                    cursor: 'pointer',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '16px',
                    transition: 'background 0.3s ease',
                    '&:hover': {
                      background: 'transparent'
                    }
                  }}
                >
                  {/* Step circle */}
                  <Box
                    sx={{
                      width: { xs: 36, md: 44 },
                      height: { xs: 36, md: 44 },
                      minWidth: { xs: 36, md: 44 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: isActive ? c.primary : c.dividerA50,
                      bgcolor: isActive ? c.primary : 'transparent',
                      color: isActive ? c.primaryContrast : c.textSecondary,
                      transition: 'all 0.3s ease',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Icon icon='tabler:check' fontSize={18} />

                    {/* Progress ring for active step */}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: -2,
                          borderRadius: '50%',
                          background: `conic-gradient(${c.primaryContrast} ${progress * 3.6}deg, transparent 0deg)`,
                          opacity: 0.2,
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </Box>

                  {/* Text content */}
                  <Box sx={{ flex: 1, pt: 0.25 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        mb: 0.5,
                        color: isActive ? c.textPrimary : c.textSecondary,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {feature.title || feature.step}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: c.textSecondary,
                        lineHeight: 1.7,
                        fontSize: { xs: '0.85rem', md: '0.95rem' }
                      }}
                    >
                      {feature.content}
                    </Typography>

                    {/* Progress bar under active step */}
                    {isActive && (
                      <Box
                        sx={{
                          mt: 1.5,
                          height: 3,
                          borderRadius: 2,
                          bgcolor: c.dividerA30,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            borderRadius: 2,
                            bgcolor: c.primary,
                            width: `${progress}%`,
                            transition: 'width 0.1s linear'
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </MotionBox>
              )
            })}
          </Box>

          {/* ── Image panel (right side) ─────────────────────────────── */}
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              height: { xs: 220, sm: 300, md: 420 },
              borderRadius: '20px',
              overflow: 'hidden',
              bgcolor: c.isDark ? alpha(c.bgPaper, 0.15) : alpha(c.grey[200], 0.5)
            }}
          >
            <AnimatePresence mode='wait'>
              {FEATURES.map(
                (feature, index) =>
                  index === current && (
                    <MotionBox
                      key={index}
                      initial={{ y: 80, opacity: 0, rotateX: -15 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -80, opacity: 0, rotateX: 15 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        component='img'
                        src={feature.image}
                        alt={feature.title}
                        loading='lazy'
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />


                    </MotionBox>
                  )
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
