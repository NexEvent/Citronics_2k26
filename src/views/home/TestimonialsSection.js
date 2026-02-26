import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'

const MotionBox = motion(Box)

/**
 * Renders a single testimonial card with avatar, quote, and attribution.
 * @param {object} props
 * @param {object} props.item - Testimonial data (name, role, avatar, quote)
 * @param {number} props.index - Card index for staggered entrance animation
 */
function TestimonialCard({ item, index }) {
  const c = useAppPalette()

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        flex: '0 0 auto',
        width: { xs: 300, sm: 360 },
        p: 4,
        borderRadius: '24px',
        background: c.bgPaperA50,
        border: `1px solid ${c.dividerA50}`,
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Quote icon */}
      <Icon
        icon='tabler:quote'
        fontSize={40}
        style={{
          color: c.primaryA10,
          position: 'absolute',
          top: 16,
          right: 20
        }}
      />

      {/* Stars */}
      <Box sx={{ display: 'flex', gap: 0.3, mb: 2.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} icon='tabler:star-filled' fontSize={14} style={{ color: c.warning }} />
        ))}
      </Box>

      <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}>
        &ldquo;{item.quote}&rdquo;
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: c.primaryA15,
            color: c.primary,
            fontWeight: 700,
            fontSize: '0.85rem'
          }}
        >
          {item.name.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {item.name}
          </Typography>
          <Typography variant='caption' sx={{ color: c.textSecondary }}>
            {item.role}
          </Typography>
        </Box>
      </Box>
    </MotionBox>
  )
}

/**
 * Horizontally scrolling testimonials section on the home page.
 * Auto-scrolls through attendee/participant quotes.
 * @param {object} props
 * @param {Array} [props.testimonials=[]] - Array of testimonial objects from the home API
 */
export default function TestimonialsSection({ testimonials: TESTIMONIALS = [] }) {
  const c = useAppPalette()

  return (
    <Box
      id='testimonials'
      sx={{
        py: { xs: 10, md: 16 },
        overflow: 'hidden'
      }}
    >
      <Container maxWidth='xl'>
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: c.warningA8,
              border: `1px solid ${c.warningA15}`,
              mb: 2.5
            }}
          >
            <Icon icon='tabler:message-circle' fontSize={14} style={{ color: c.warning }} />
            <Typography variant='caption' sx={{ color: c.warning, fontWeight: 600, letterSpacing: 1.5 }}>
              TESTIMONIALS
            </Typography>
          </Box>
          <Typography variant='h3' sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            What Past Participants Say
          </Typography>
          <Typography variant='body1' sx={{ color: c.textSecondary, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Hear from the students and professionals who experienced Citronics firsthand.
          </Typography>
        </MotionBox>
      </Container>

      {/* Scrollable testimonial row */}
      <Box
        role='region'
        aria-label='Testimonials carousel'
        tabIndex={0}
        sx={{
          display: 'flex',
          gap: 3,
          px: 3,
          pb: 2,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: c.primaryA20, borderRadius: 3 },
          '& > *': { scrollSnapAlign: 'start' }
        }}
      >
        {/* Spacer for centering */}
        <Box sx={{ flex: '0 0 auto', width: { xs: 0, md: 'calc((100vw - 1200px) / 2 + 24px)' } }} />
        {TESTIMONIALS.map((item, i) => (
          <TestimonialCard key={i} item={item} index={i} />
        ))}
        <Box sx={{ flex: '0 0 24px' }} />
      </Box>
    </Box>
  )
}
