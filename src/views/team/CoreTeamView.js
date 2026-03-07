import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 }
}

/* ── Mock Data ──────────────────────────────────────────────── */

const CORE_TEAM = []

const FACULTY = []

const SOCIAL_ICONS = {
  linkedin: 'tabler:brand-linkedin',
  github: 'tabler:brand-github',
  twitter: 'tabler:brand-x'
}

/* ── Components ─────────────────────────────────────────────── */

function TeamMemberCard({ member, index }) {
  const c = useAppPalette()
  const color = c.theme.palette[member.colorKey]?.main || c.primary
  const [hovered, setHovered] = useState(false)

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        background: c.isDark ? alpha(c.bgPaper, 0.5) : alpha(c.bgPaper, 0.8),
        border: `1px solid ${c.isDark ? alpha(color, 0.15) : alpha(color, 0.1)}`,
        backdropFilter: 'blur(16px)',
        transition: 'all 0.35s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.35)}`,
          boxShadow: `0 20px 60px ${alpha(color, 0.12)}`,
          transform: 'translateY(-6px)'
        }
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      <Box sx={{ p: { xs: 3, md: 3.5 }, textAlign: 'center' }}>
        {/* Avatar */}
        <Box
          sx={{
            position: 'relative',
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            p: '3px',
            background: `linear-gradient(135deg, ${alpha(color, 0.6)}, ${alpha(color, 0.15)})`,
            transition: 'all 0.3s ease',
            ...(hovered && {
              background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.3)})`
            })
          }}
        >
          <Box
            component='img'
            src={member.avatar}
            alt={member.name}
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </Box>

        {/* Name */}
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            mb: 0.5,
            color: c.textPrimary
          }}
        >
          {member.name}
        </Typography>

        {/* Role badge */}
        <Box
          sx={{
            display: 'inline-flex',
            px: 1.5,
            py: 0.3,
            borderRadius: '100px',
            background: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.2)}`,
            mb: 1
          }}
        >
          <Typography
            variant='caption'
            sx={{ color, fontWeight: 700, letterSpacing: 0.5, fontSize: '0.7rem' }}
          >
            {member.role}
          </Typography>
        </Box>

        {/* Department */}
        <Typography variant='body2' sx={{ color: c.textDisabled, fontSize: '0.8rem', mb: 1.5 }}>
          {member.department}
        </Typography>

        {/* Bio */}
        {member.bio && (
          <Typography
            variant='body2'
            sx={{
              color: c.textSecondary,
              lineHeight: 1.7,
              fontSize: '0.82rem',
              mb: 2,
              minHeight: { md: 48 }
            }}
          >
            {member.bio}
          </Typography>
        )}

        {/* Social links */}
        {member.socials && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            {Object.entries(member.socials).map(([platform, url]) => (
              <IconButton
                key={platform}
                href={url}
                size='small'
                sx={{
                  color: c.textDisabled,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color,
                    bgcolor: alpha(color, 0.08)
                  }
                }}
              >
                <Icon icon={SOCIAL_ICONS[platform]} fontSize={18} />
              </IconButton>
            ))}
          </Box>
        )}
      </Box>
    </MotionBox>
  )
}

function FacultyCard({ member, index }) {
  const c = useAppPalette()
  const color = c.theme.palette[member.colorKey]?.main || c.primary

  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        background: c.isDark ? alpha(c.bgPaper, 0.4) : alpha(c.bgPaper, 0.7),
        border: `1px solid ${alpha(color, 0.12)}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: `0 12px 40px ${alpha(color, 0.1)}`
        }
      }}
    >
      <Box
        component='img'
        src={member.avatar}
        alt={member.name}
        sx={{
          width: 72,
          height: 72,
          borderRadius: '16px',
          objectFit: 'cover',
          border: `2px solid ${alpha(color, 0.25)}`
        }}
      />
      <Box>
        <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.25 }}>
          {member.name}
        </Typography>
        <Typography variant='body2' sx={{ color, fontWeight: 600, mb: 0.25 }}>
          {member.role}
        </Typography>
        <Typography variant='caption' sx={{ color: c.textDisabled }}>
          {member.department}
        </Typography>
      </Box>
    </MotionBox>
  )
}

/* ── Main View ──────────────────────────────────────────────── */

export default function CoreTeamView() {
  const c = useAppPalette()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha(c.primary, 0.05)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(c.primary, 0.05)} 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
            zIndex: 0
          }
        }}
      >
        {/* Glow blob */}
        <Box
          sx={{
            position: 'absolute',
            width: '50vw',
            height: '50vw',
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(c.primary, 0.1)} 0%, transparent 70%)`,
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: '100px',
                background: alpha(c.primary, 0.08),
                border: `1px solid ${alpha(c.primary, 0.2)}`,
                mb: 3
              }}
            >
              <Icon icon='tabler:users-group' fontSize={14} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                THE PEOPLE BEHIND THE FEST
              </Typography>
            </Box>

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-1.5px',
                lineHeight: 1.05,
                mb: 3,
                background: `linear-gradient(135deg, ${c.textPrimary} 0%, ${c.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Core Team
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 620,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              Meet the passionate minds orchestrating Citronics 2026 — from planning and
              execution to design and outreach, this team makes it all happen.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Faculty Coordinators ─────────────────────────────── */}
      <Container maxWidth='lg' sx={{ mb: { xs: 8, md: 12 } }}>
        <MotionBox initial='hidden' whileInView='show' viewport={{ once: true }} variants={fadeUp}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: '100px',
                background: alpha(c.info, 0.08),
                border: `1px solid ${alpha(c.info, 0.15)}`,
                mb: 2
              }}
            >
              <Icon icon='tabler:school' fontSize={13} style={{ color: c.info }} />
              <Typography variant='caption' sx={{ color: c.info, fontWeight: 700, letterSpacing: 1.5 }}>
                FACULTY COORDINATORS
              </Typography>
            </Box>
            <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Guided by Experience
            </Typography>
          </Box>
        </MotionBox>


      </Container>

      {/* ── Student Core Team ────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: c.isDark ? alpha(c.bgPaper, 0.3) : alpha(c.bgPaper, 0.5) }}>
        <Container maxWidth='lg'>
          <MotionBox initial='hidden' whileInView='show' viewport={{ once: true }} variants={fadeUp}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: '100px',
                  background: alpha(c.success, 0.08),
                  border: `1px solid ${alpha(c.success, 0.15)}`,
                  mb: 2
                }}
              >
                <Icon icon='tabler:stars' fontSize={13} style={{ color: c.success }} />
                <Typography variant='caption' sx={{ color: c.success, fontWeight: 700, letterSpacing: 1.5 }}>
                  STUDENT CORE TEAM
                </Typography>
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1 }}>
                The Driving Force
              </Typography>
              <Typography
                variant='body1'
                sx={{ color: c.textSecondary, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}
              >
                The core team that transforms ideas into reality — leading teams, managing events,
                and creating unforgettable experiences.
              </Typography>
            </Box>
          </MotionBox>


        </Container>
      </Box>

      {/* ── Join CTA ─────────────────────────────────────────── */}
      <Container maxWidth='md' sx={{ py: { xs: 8, md: 12 } }}>
        <MotionBox
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeUp}
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 6 },
            borderRadius: '28px',
            background: c.isDark ? alpha(c.bgPaper, 0.4) : alpha(c.bgPaper, 0.6),
            border: `1px solid ${alpha(c.primary, 0.12)}`,
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: 2,
              background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)`
            }
          }}
        >
         
        
        </MotionBox>
      </Container>
    </>
  )
}