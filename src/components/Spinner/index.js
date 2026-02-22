import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

/**
 * Full-page loading spinner used during auth/route transitions.
 */
const Spinner = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  )
}

export default Spinner
