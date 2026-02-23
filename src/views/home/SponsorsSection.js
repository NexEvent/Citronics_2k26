import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { SPONSORS } from './mockData'

const MotionBox = motion(Box)

export default function SponsorsSection() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.background.default,
        overflow: 'hidden'
      }}
    >
      {/* Section header */}
      <MotionBox
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        sx={{ textAlign: 'center', mb: 6 }}
      >
        <Typography variant='overline' sx={{ color: theme.palette.text.secondary, letterSpacing: 3, fontWeight: 600 }}>
          PROUDLY SUPPORTED BY
        </Typography>
      </MotionBox>

      {/* Infinite scroll marquee */}
      <Box sx={{ position: 'relative' }}>
        {/* Left fade */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: `linear-gradient(90deg, ${theme.palette.background.default}, transparent)`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
        {/* Right fade */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: `linear-gradient(270deg, ${theme.palette.background.default}, transparent)`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 6,
            animation: 'marquee 30s linear infinite',
            '@keyframes marquee': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' }
            },
            '&:hover': { animationPlayState: 'paused' }
          }}
        >
          {[...SPONSORS, ...SPONSORS].map((sponsor, i) => (
            <Box
              key={`${sponsor.name}-${i}`}
              sx={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3,
                py: 1.5,
                borderRadius: '14px',
                background: alpha(theme.palette.background.paper, 0.4),
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                backdropFilter: 'blur(8px)',
                cursor: 'default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  background: alpha(theme.palette.background.paper, 0.6)
                }
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 700, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                {sponsor.name}
              </Typography>
              {sponsor.tier && (
                <Typography variant='caption' sx={{ color: theme.palette.text.disabled, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {sponsor.tier}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
