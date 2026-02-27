import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

/**
 * A single auto-scrolling column of testimonial cards.
 * Duplicates items to create a seamless infinite vertical loop.
 * @param {object} props
 * @param {Array}  props.testimonials - Testimonial objects for this column
 * @param {number} [props.duration=10] - Loop cycle duration in seconds
 * @param {object} [props.sx={}] - Additional MUI sx overrides (e.g. responsive display)
 */
function TestimonialsColumn({ testimonials = [], duration = 10, sx = {} }) {
  const c = useAppPalette()

  if (!testimonials.length) return null

  return (
    <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0, ...sx }}>
      <MotionBox
        animate={{ translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop'
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 3 }}
      >
        {/* Render two copies for seamless looping */}
        {[0, 1].map(setIndex => (
          <React.Fragment key={setIndex}>
            {testimonials.map((item, i) => (
              <Box
                key={`${setIndex}-${i}`}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '24px',
                  bgcolor: c.bgPaper,
                  border: `1px solid ${c.divider}`,
                  boxShadow: `0 4px 24px ${c.primaryA8}`,
                  width: '100%'
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: c.textSecondary, lineHeight: 1.8, mb: 2.5 }}
                >
                  {item.quote ?? item.text}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={item.avatar || item.image || undefined}
                    alt={item.name}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: c.primaryA15,
                      color: c.primary,
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    {item.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </Avatar>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: c.textSecondary, opacity: 0.75, letterSpacing: '-0.01em' }}
                    >
                      {item.role}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </React.Fragment>
        ))}
      </MotionBox>
    </Box>
  )
}

/**
 * Vertically auto-scrolling testimonials section with three staggered columns.
 * Inspired by 21st.dev testimonials-columns layout.
 *
 * - Column 1: always visible
 * - Column 2: visible from md breakpoint
 * - Column 3: visible from lg breakpoint
 *
 * All colors are theme-aware via useAppPalette; adapts to dark/light mode
 * and primary-color changes automatically.
 *
 * @param {object} props
 * @param {Array} [props.testimonials=[]] - Array of testimonial objects from the home API
 */
export default function TestimonialsSection({ testimonials: TESTIMONIALS = [] }) {
  const c = useAppPalette()

  // Split testimonials evenly across three columns
  const third = Math.ceil(TESTIMONIALS.length / 3)
  const firstColumn = TESTIMONIALS.slice(0, third)
  const secondColumn = TESTIMONIALS.slice(third, third * 2)
  const thirdColumn = TESTIMONIALS.slice(third * 2)

  return (
    <Box
      id='testimonials'
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: c.bgDefault
      }}
    >
      <Container maxWidth='xl' disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* ── Section header ─────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 540,
            mx: 'auto',
            textAlign: 'center',
            mb: 6
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '8px',
              border: `1px solid ${c.dividerA50}`,
              mb: 2.5
            }}
          >
            <Typography variant='caption' sx={{ color: c.textSecondary, fontWeight: 600 }}>
              Testimonials
            </Typography>
          </Box>

          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' }
            }}
          >
            What Past Participants Say
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: c.textSecondary, opacity: 0.75, lineHeight: 1.7 }}
          >
            Hear from the students and professionals who experienced Citronics firsthand.
          </Typography>
        </MotionBox>

        {/* ── Auto-scrolling columns ─────────────────────────────── */}
        <Box
          role='region'
          aria-label='Testimonials carousel'
          sx={{
            display: 'flex',
            gap: 3,
            maxHeight: 740,
            overflow: 'hidden',
            maskImage:
              'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)'
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={19}
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={17}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          />
        </Box>
      </Container>
    </Box>
  )
}
