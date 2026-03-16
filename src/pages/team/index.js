import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import CoreTeamView from 'src/views/team/CoreTeamView'
import { TeamSEO } from 'src/components/SEO'

export default function TeamPage() {
  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <TeamSEO />
      <PublicNavbar />
      <CoreTeamView />
      <PublicFooter />
    </Box>
  )
}

TeamPage.authGuard = false
TeamPage.guestGuard = false
TeamPage.getLayout = page => page