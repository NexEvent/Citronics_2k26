/**
 * MicButton — Citro Floating Action Button
 *
 * A global floating mic button (bottom-right) that toggles voice listening.
 * Shows pulse animation when listening, processing spinner when working.
 *
 * Uses MUI Fab + keyframes for the pulsing ring effect.
 * Matches the Citronics primary purple theme.
 */
import { forwardRef } from 'react'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Zoom from '@mui/material/Zoom'
import Box from '@mui/material/Box'
import { alpha, useTheme, keyframes } from '@mui/material/styles'
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react'

// ── Pulse animation for the listening ring ────────────────────────────────────
const pulseRing = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.2;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
`

const pulseRingSlow = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.8);
    opacity: 0.1;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
`

/**
 * @param {object} props
 * @param {boolean} props.isListening   Whether the mic is actively listening
 * @param {boolean} props.isProcessing  Whether Citro is processing a command
 * @param {function} props.onClick      Toggle listening handler
 * @param {boolean} props.disabled      Disable button (e.g., no auth)
 */
const MicButton = forwardRef(({ isListening, isProcessing, onClick, disabled = false }, ref) => {
  const theme = useTheme()

  const getTooltip = () => {
    if (isProcessing) return 'Citro is thinking...'
    if (isListening) return 'Tap to stop listening'
    return 'Tap to talk to Citro'
  }

  return (
    <Box
      ref={ref}
      sx={{
        position: 'fixed',
        bottom: { xs: 24, md: 32 },
        right: { xs: 24, md: 32 },
        zIndex: theme.zIndex.speedDial,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* ── Pulse rings (only when listening) ──────────────────────────────── */}
      {isListening && !isProcessing && (
        <>
          <Box
            sx={{
              position: 'absolute',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.4),
              animation: `${pulseRing} 1.5s ease-out infinite`
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              animation: `${pulseRingSlow} 2s ease-out infinite 0.3s`
            }}
          />
        </>
      )}

      {/* ── FAB Button ─────────────────────────────────────────────────────── */}
      <Tooltip title={getTooltip()} placement='left' TransitionComponent={Zoom}>
        <span>
          <Fab
            color={isListening ? 'primary' : 'default'}
            onClick={onClick}
            disabled={disabled || isProcessing}
            aria-label={isListening ? 'Stop listening' : 'Start voice command'}
            sx={{
              width: 56,
              height: 56,
              boxShadow: isListening
                ? `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`
                : theme.shadows[6],
              bgcolor: isListening
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              color: isListening
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
              transition: theme.transitions.create(['background-color', 'box-shadow', 'color'], {
                duration: 250
              }),
              '&:hover': {
                bgcolor: isListening
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.08),
                boxShadow: isListening
                  ? `0 0 28px ${alpha(theme.palette.primary.main, 0.6)}`
                  : theme.shadows[8]
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.action.disabledBackground, 0.5)
              }
            }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color='inherit' />
            ) : isListening ? (
              <IconMicrophone size={24} />
            ) : (
              <IconMicrophoneOff size={24} />
            )}
          </Fab>
        </span>
      </Tooltip>
    </Box>
  )
})

MicButton.displayName = 'MicButton'

export default MicButton
