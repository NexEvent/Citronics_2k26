import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import CoreTeamView from 'src/views/team/CoreTeamView'

export default function TeamPage() {
  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <CoreTeamView />
      <PublicFooter />
    </Box>
  )
}

TeamPage.authGuard = false
TeamPage.guestGuard = false
TeamPage.getLayout = page => page
