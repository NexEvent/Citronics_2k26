import Box from '@mui/material/Box'

/**
 * Minimal Layout Component
 * Used for pages that don't need navigation (login, error pages, etc.)
 */
const MinimalLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </Box>
  )
}

export default MinimalLayout
