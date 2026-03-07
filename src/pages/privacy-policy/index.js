import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const policies = [
  {
    icon: 'tabler:shield-lock',
    title: 'Data Privacy',
    text: 'User data is securely stored and will not be shared or used for any other purpose.'
  },
  {
    icon: 'tabler:currency-rupee',
    title: 'No Refund Policy',
    text: 'Once a payment is made, it is non-refundable under any circumstances.'
  },
  {
    icon: 'tabler:user-x',
    title: 'Non-Attendance Policy',
    text: 'Participants who register for an event but do not attend will not be eligible for a refund.'
  },
  {
    icon: 'tabler:calendar-event',
    title: 'Event Modification',
    text: 'The organizers reserve the right to modify or cancel events due to unforeseen circumstances.'
  },
  {
    icon: 'tabler:gavel',
    title: 'Code of Conduct',
    text: 'All participants must adhere to the event\'s code of conduct. Any violation may result in disqualification without a refund.'
  },
  {
    icon: 'tabler:credit-card',
    title: 'Payment Confirmation',
    text: 'Ensure that your payment is successfully processed. If the transaction fails, registration will not be confirmed.'
  },
  {
    icon: 'tabler:ticket',
    title: 'Event Access',
    text: 'Only registered participants will be allowed entry. ID verification may be required.'
  },
  {
    icon: 'tabler:alert-triangle',
    title: 'Liability Disclaimer',
    text: 'The event organizers are not responsible for any personal belongings lost during the event.'
  }
]

function PolicyCard({ icon, title, text, index }) {
  const c = useAppPalette()

  return (
    <MotionBox
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] } }
      }}
      sx={{
        p: 3,
        borderRadius: 3,
        background: alpha(c.primary, 0.04),
        border: `1px solid ${alpha(c.primary, 0.10)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: alpha(c.primary, 0.08),
          border: `1px solid ${alpha(c.primary, 0.20)}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(c.primary, 0.10),
            color: c.primary
          }}
        >
          <Icon icon={icon} fontSize={20} />
        </Box>
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 700, color: c.text, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.7 }}>
            {text}
          </Typography>
        </Box>
      </Box>
    </MotionBox>
  )
}

export default function PrivacyPolicyPage() {
  const c = useAppPalette()

  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />

      {/* Hero */}
      <Box sx={{ pt: { xs: 16, md: 20 }, pb: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth='md'>
          <MotionBox initial='hidden' whileInView='show' viewport={{ once: true }} variants={fadeUp}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: '100px',
                background: alpha(c.primary, 0.08),
                border: `1px solid ${alpha(c.primary, 0.18)}`,
                mb: 3
              }}
            >
              <Icon icon='tabler:shield-check' fontSize={13} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                EVENT POLICY
              </Typography>
            </Box>

            <Typography
              variant='h2'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
                color: c.text,
                mb: 2
              }}
            >
              Privacy & Event Policy
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 560,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: '1.05rem'
              }}
            >
              Please read our policies carefully before registering for any event.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* Policy Cards */}
      <Container maxWidth='md' sx={{ pb: { xs: 8, md: 14 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {policies.map((policy, i) => (
            <PolicyCard key={policy.title} {...policy} index={i} />
          ))}
        </Box>

        <MotionBox
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeUp}
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 3,
            background: alpha(c.primary, 0.06),
            border: `1px solid ${alpha(c.primary, 0.12)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant='body2' sx={{ color: c.textSecondary, lineHeight: 1.8 }}>
            By registering for an event, you agree to abide by these policies.
          </Typography>
        </MotionBox>
      </Container>

      <PublicFooter />
    </Box>
  )
}

PrivacyPolicyPage.authGuard = false
PrivacyPolicyPage.guestGuard = false
PrivacyPolicyPage.getLayout = page => page
