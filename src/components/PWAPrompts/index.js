import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import usePWA from 'src/hooks/usePWA'
import Icon from 'src/components/Icon'

/**
 * PWAPrompts
 *
 * Renders two non-intrusive UI hints:
 *  1. "Add to Home Screen" snackbar when app is installable
 *  2. "Update available" banner when a new SW is waiting
 *
 * Place once inside _app.js / UserLayout.
 */
const PWAPrompts = () => {
  const { isOnline } = usePWA()
  const [offlineDismissed, setOfflineDismissed] = useState(false)

  return (
    <>
      {/* ── Offline banner ─────────────────────────────────────────────── */}
      <Snackbar open={!isOnline && !offlineDismissed} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity='warning' icon={<Icon icon='tabler:wifi-off' />} onClose={() => setOfflineDismissed(true)}>
          <Typography variant='body2'>You are currently offline. Some features may not be available.</Typography>
        </Alert>
      </Snackbar>
    </>
  )
}

export default PWAPrompts
