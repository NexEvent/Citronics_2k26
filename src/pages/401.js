import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MinimalLayout from 'src/layouts/MinimalLayout'

/**
 * 401 Not Authorized Page
 */
const NotAuthorized = () => {
  return (
    <Box
      sx={{
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" sx={{ mb: 2, fontSize: '6rem !important' }}>
        401
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, letterSpacing: '0.18px' }}>
        You are not authorized! 🔐
      </Typography>
      <Typography variant="body2" sx={{ mb: 6 }}>
        You don't have permission to access this page. Go back to home.
      </Typography>
      <Button variant="contained" component={Link} href="/">
        Back to Home
      </Button>
    </Box>
  )
}

NotAuthorized.getLayout = (page) => <MinimalLayout>{page}</MinimalLayout>
NotAuthorized.authGuard = false
NotAuthorized.guestGuard = false

export default NotAuthorized
