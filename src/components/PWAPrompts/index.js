import { useState } from 'react'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
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
  const { isInstallable, promptInstall, updateAvailable, applyUpdate, isOnline } = usePWA()
  const [installDismissed, setInstallDismissed] = useState(false)
  const [offlineDismissed, setOfflineDismissed] = useState(false)

  return (
    <>
      {/* ── Install prompt ─────────────────────────────────────────────── */}
      <Snackbar
        open={isInstallable && !installDismissed}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ mb: 7 }}
      >
        <Alert
          severity="info"
          icon={<Icon icon="tabler:device-mobile" />}
          action={
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Button size="small" variant="contained" onClick={promptInstall}>
                Install
              </Button>
              <IconButton size="small" onClick={() => setInstallDismissed(true)}>
                <Icon icon="tabler:x" fontSize={16} />
              </IconButton>
            </Box>
          }
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="body2" fontWeight={500}>
            Add EventHub to your home screen
          </Typography>
        </Alert>
      </Snackbar>

      {/* ── Update available ───────────────────────────────────────────── */}
      <Snackbar
        open={updateAvailable}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<Icon icon="tabler:refresh" />}
          action={
            <Button size="small" variant="contained" color="success" onClick={applyUpdate}>
              Reload
            </Button>
          }
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="body2" fontWeight={500}>
            A new version of EventHub is ready!
          </Typography>
        </Alert>
      </Snackbar>

      {/* ── Offline banner ─────────────────────────────────────────────── */}
      <Snackbar
        open={!isOnline && !offlineDismissed}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          icon={<Icon icon="tabler:wifi-off" />}
          onClose={() => setOfflineDismissed(true)}
        >
          <Typography variant="body2">
            You are currently offline. Some features may not be available.
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}

export default PWAPrompts
