import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import Link from 'next/link'

const MotionBox = motion(Box)

/**
 * Call-to-action banner section on the home page.
 * Encourages visitors to register or view events at Citronics.
 */
export default function CTABanner() {
  const c = useAppPalette()

  return (
    <Box
      component='section'
      aria-label='Call to action'
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Grid bg */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${c.primaryA4} 1px, transparent 1px),
              linear-gradient(90deg, ${c.primaryA4} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 100%)'
          }
        }}
      />

      {/* Glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.primaryA15}, transparent)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          sx={{ textAlign: 'center' }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              background: c.gradientPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: `0 0 40px ${c.primaryA40}, 0 8px 24px ${c.primaryA30}`
            }}
          >
            <Icon icon='tabler:rocket' fontSize={36} style={{ color: c.primaryContrast }} />
          </Box>

          <Typography variant='h2' sx={{ fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Ready to Make Your Mark?
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: 'text.secondary', mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}
          >
            Register now to secure your spot in Citronics 2026. Early registrations get priority seating, exclusive goodies, and e-certificates for all participants.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 5 }}>
            <Button
              variant='contained'
              size='large'
              component={Link}
              href='/login'
              endIcon={<Icon icon='tabler:arrow-right' />}
              sx={{
                px: 5,
                py: 2,
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1.05rem',
                textTransform: 'none',
                background: c.gradientPrimary,
                boxShadow: `0 0 40px ${c.primaryA50}, 0 8px 32px ${c.primaryA30}`,
                '&:hover': {
                  boxShadow: `0 0 60px ${c.primaryA60}, 0 12px 40px ${c.primaryA40}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Register Now
            </Button>
            <Button
              variant='outlined'
              size='large'
              href='#events'
              onClick={e => {
                e.preventDefault()
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
              }}
              sx={{
                px: 5,
                py: 2,
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '1.05rem',
                textTransform: 'none',
                borderColor: c.dividerA30,
                color: 'text.secondary',
                '&:hover': {
                  borderColor: c.primaryA50,
                  background: c.primaryA8,
                  color: 'text.primary'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Browse Events
            </Button>
          </Box>

          {/* Trust badges */}
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: 'tabler:shield-check', text: 'Free Registration' },
              { icon: 'tabler:certificate', text: 'E-Certificates' },
              { icon: 'tabler:trophy', text: '\u20B92L+ Prizes' }
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon={icon} fontSize={16} style={{ color: c.success }} />
                <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </MotionBox>
      </Container>
    </Box>
  )
}
