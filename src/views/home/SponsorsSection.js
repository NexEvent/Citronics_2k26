import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

export default function SponsorsSection({ sponsors: SPONSORS = [] }) {
  const c = useAppPalette()

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
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
        <Typography variant='overline' sx={{ color: c.textSecondary, letterSpacing: 3, fontWeight: 600 }}>
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
            background: `linear-gradient(90deg, ${c.bgDefaultA90}, transparent)`,
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
            background: `linear-gradient(270deg, ${c.bgDefaultA90}, transparent)`,
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
                background: c.bgPaperA40,
                border: `1px solid ${c.dividerA30}`,
                backdropFilter: 'blur(8px)',
                cursor: 'default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: `1px solid ${c.primaryA20}`,
                  background: c.bgPaperA60
                }
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 700, color: c.textPrimary, whiteSpace: 'nowrap' }}>
                {sponsor.name}
              </Typography>
              {sponsor.tier && (
                <Typography variant='caption' sx={{ color: c.textDisabled, fontWeight: 500, whiteSpace: 'nowrap' }}>
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
