import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/**
 * Renders a single highlight feature card for the About section.
 * @param {object} props
 * @param {object} props.item - Highlight data (title, description, icon, paletteKey)
 * @param {number} props.index - Card index for staggered entrance animation
 */
function HighlightCard({ item, index }) {
  const c = useAppPalette()
  const color = c.theme.palette[item.paletteKey]?.main || c.primary

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      sx={{
        p: 4,
        height: '100%',
        borderRadius: '24px',
        background: c.bgPaperA50,
        border: `1px solid ${c.dividerA60}`,
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: `0 20px 60px ${alpha(color, 0.08)}`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        },
        '&:hover::before': { opacity: 1 }
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          background: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <Icon icon={item.icon} fontSize={28} style={{ color }} />
      </Box>

      <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
        {item.title}
      </Typography>

      <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.7 }}>
        {item.description}
      </Typography>
    </MotionBox>
  )
}

/**
 * About / highlights section on the home page.
 * Renders a grid of feature cards describing what makes Citronics unique.
 * @param {object} props
 * @param {Array} [props.highlights=[]] - Array of highlight objects from the home API
 */
export default function AboutSection({ highlights: HIGHLIGHTS = [] }) {
  const c = useAppPalette()

  return (
    <Box
      id='about'
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative'
      }}
    >
      <Container maxWidth='xl'>
        {/* Section header */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
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
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            More Than Just a Tech Fest
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: c.textSecondary, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}
          >
            Citronics is where ambition meets opportunity. Three days of world-class competitions, hands-on workshops, and connections that last a lifetime.
          </Typography>
        </MotionBox>

        <Grid container spacing={3}>
          {HIGHLIGHTS.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <HighlightCard item={item} index={i} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
