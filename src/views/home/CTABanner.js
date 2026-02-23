import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import Link from 'next/link'

const MotionBox = motion(Box)

export default function CTABanner() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#0a0a12'
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
              linear-gradient(${alpha(theme.palette.primary.main, 0.04)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.04)} 1px, transparent 1px)
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
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
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
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.4)}, 0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <Icon icon='tabler:rocket' fontSize={36} style={{ color: '#fff' }} />
          </Box>

          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, color: '#fff', letterSpacing: '-0.5px' }}>
            Ready to Make Your Mark?
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: alpha('#fff', 0.5), mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 0 60px ${alpha(theme.palette.primary.main, 0.6)}, 0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                borderColor: alpha('#fff', 0.15),
                color: alpha('#fff', 0.8),
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  background: alpha(theme.palette.primary.main, 0.08),
                  color: '#fff'
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
                <Icon icon={icon} fontSize={16} style={{ color: theme.palette.success.main }} />
                <Typography variant='caption' sx={{ color: alpha('#fff', 0.45), fontWeight: 500 }}>
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
