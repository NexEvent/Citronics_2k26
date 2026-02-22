import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'
import Icon from 'src/components/Icon'

/**
 * ConfirmDialog
 *
 * A reusable confirmation dialog used for destructive or irreversible actions
 * (e.g. delete event, cancel registration, revoke ticket).
 *
 * @prop {boolean}  open            - whether the dialog is visible
 * @prop {function} onClose         - called when user dismisses without confirming
 * @prop {function} onConfirm       - called when user clicks the confirm button
 * @prop {string}   [title]         - dialog heading (default: 'Are you sure?')
 * @prop {string}   [message]       - body text
 * @prop {string}   [confirmLabel]  - confirm button text (default: 'Confirm')
 * @prop {string}   [cancelLabel]   - cancel button text  (default: 'Cancel')
 * @prop {'error'|'warning'|'info'|'success'} [severity] - icon + button colour
 * @prop {boolean}  [loading]       - shows spinner on confirm button while async op runs
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   title='Delete Event'
 *   message='This will permanently delete the event and all its tickets. This cannot be undone.'
 *   confirmLabel='Delete'
 *   severity='error'
 *   loading={isDeleting}
 * />
 */

const ICON_MAP = {
  error:   'tabler:trash-x',
  warning: 'tabler:alert-triangle',
  info:    'tabler:info-circle',
  success: 'tabler:circle-check'
}

const ConfirmDialog = ({
  open          = false,
  onClose,
  onConfirm,
  title         = 'Are you sure?',
  message       = 'This action cannot be undone.',
  confirmLabel  = 'Confirm',
  cancelLabel   = 'Cancel',
  severity      = 'warning',
  loading       = false
}) => {
  const theme = useTheme()
  const iconColor = theme.palette[severity]?.main ?? theme.palette.warning.main

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width:           40,
              height:          40,
              borderRadius:    '50%',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              backgroundColor: alpha(iconColor, 0.12),
              flexShrink:      0
            }}
          >
            <Icon icon={ICON_MAP[severity] ?? ICON_MAP.warning} style={{ fontSize: 22, color: iconColor }} />
          </Box>
          <Typography variant='h6' fontWeight={600}>{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant='outlined'
          color='secondary'
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant='contained'
          color={severity === 'info' ? 'primary' : severity}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color='inherit' /> : null}
          sx={{ borderRadius: 2, minWidth: 90 }}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
