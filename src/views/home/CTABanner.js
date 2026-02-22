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
        py: { xs: 8, md: 10 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`
      }}
    >
      <Container maxWidth='md'>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 6 },
            borderRadius: '28px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            background: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Glow behind */}
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
              filter: 'blur(40px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />

          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            <Icon icon='tabler:rocket' fontSize={32} style={{ color: '#fff' }} />
          </Box>

          <Typography
            variant='h4'
            sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}
          >
            Ready to Participate?
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}
          >
            Register now to secure your spot in Citronics 2026. Early registrations get priority seating and exclusive
            goodies. Don't miss out!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant='contained'
              size='large'
              component={Link}
              href='/login'
              endIcon={<Icon icon='tabler:arrow-right' />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.55)}` }
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
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                '&:hover': { borderColor: theme.palette.primary.main, background: alpha(theme.palette.primary.main, 0.05) }
              }}
            >
              Browse Events
            </Button>
          </Box>

          {/* Trust badges */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
            {[
              { icon: 'tabler:shield-check', text: 'Free Registration' },
              { icon: 'tabler:certificate', text: 'E-Certificates for All' },
              { icon: 'tabler:trophy', text: '₹2L+ Prize Pool' }
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Icon icon={icon} fontSize={16} style={{ color: theme.palette.success.main }} />
                <Typography variant='caption' sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
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
