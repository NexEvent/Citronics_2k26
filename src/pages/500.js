import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MinimalLayout from 'src/layouts/MinimalLayout'

/**
 * 500 Server Error Page
 */
const ServerError = () => {
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
        500
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, letterSpacing: '0.18px' }}>
        Internal Server Error 👨🏻‍💻
      </Typography>
      <Typography variant="body2" sx={{ mb: 6 }}>
        Something went wrong. Please try again later.
      </Typography>
      <Button variant="contained" component={Link} href="/">
        Back to Home
      </Button>
    </Box>
  )
}

ServerError.getLayout = (page) => <MinimalLayout>{page}</MinimalLayout>
ServerError.authGuard = false
ServerError.guestGuard = false

export default ServerError
