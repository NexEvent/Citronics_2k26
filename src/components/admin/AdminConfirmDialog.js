/**
 * AdminConfirmDialog — Generic confirmation dialog (used for delete, status change, etc.)
 *
 * Props:
 *  open        bool    — dialog visibility
 *  onClose     fn      — called when cancelled
 *  onConfirm   fn      — called when confirmed (async ok)
 *  title       string  — dialog title
 *  message     string | ReactNode — body text
 *  confirmText string  — confirm button label (default 'Confirm')
 *  confirmColor string — 'error' | 'primary' | 'warning' (default 'error')
 *  loading     bool    — shows spinner on confirm button
 */

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Icon from 'src/components/Icon'

const ICON_MAP = {
  error:   { icon: 'tabler:alert-triangle', bg: '#FFF3F3', color: '#F44336' },
  warning: { icon: 'tabler:alert-circle',   bg: '#FFF8E1', color: '#FF9800' },
  primary: { icon: 'tabler:info-circle',    bg: '#EEF2FF', color: '#6366F1' }
}

const AdminConfirmDialog = ({
  open = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  confirmColor = 'error',
  loading = false
}) => {
  const iconCfg = ICON_MAP[confirmColor] || ICON_MAP.error

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent sx={{ pt: 3, pb: 1, textAlign: 'center' }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: iconCfg.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <Icon icon={iconCfg.icon} fontSize={28} style={{ color: iconCfg.color }} />
        </Box>

        <Typography variant='h6' fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          variant='outlined'
          onClick={onClose}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Please wait…' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AdminConfirmDialog
