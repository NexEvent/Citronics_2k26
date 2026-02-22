import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MinimalLayout from 'src/layouts/MinimalLayout'

/**
 * 404 Not Found Page
 */
const NotFound = () => {
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
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, letterSpacing: '0.18px' }}>
        Page Not Found ⚠️
      </Typography>
      <Typography variant="body2" sx={{ mb: 6 }}>
        We couldn't find the page you are looking for.
      </Typography>
      <Button variant="contained" component={Link} href="/">
        Back to Home
      </Button>
    </Box>
  )
}

NotFound.getLayout = (page) => <MinimalLayout>{page}</MinimalLayout>
NotFound.authGuard = false
NotFound.guestGuard = false

export default NotFound
