/**
 * SubtitlePanel — Citro Conversation Log
 *
 * A slide-up panel that shows the conversation between the user and Citro.
 * Anchored above the mic button (bottom-right).
 *
 * Features:
 *   - Auto-scrolls to latest message
 *   - Shows user messages (right-aligned) and Citro replies (left-aligned)
 *   - Processing indicator (typing dots)
 *   - Compact, non-intrusive design
 *   - Collapsible via close button
 */
import { useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Fade from '@mui/material/Fade'
import Chip from '@mui/material/Chip'
import { alpha, useTheme, keyframes } from '@mui/material/styles'
import { IconX, IconMessageCircle } from '@tabler/icons-react'

// ── Typing dots animation ─────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
`

const TypingIndicator = () => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', gap: 0.5, py: 0.5, px: 1 }}>
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.6),
            animation: `${bounce} 1s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </Box>
  )
}

/**
 * @param {object} props
 * @param {boolean} props.isOpen         Panel visibility
 * @param {boolean} props.isProcessing   Show typing indicator
 * @param {Array}   props.messages       [{ sender, text, timestamp }]
 * @param {function} props.onClose       Close panel handler
 */
const SubtitlePanel = ({ isOpen, isProcessing, messages, onClose }) => {
  const theme = useTheme()
  const scrollRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  return (
    <Slide direction='up' in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 92, md: 100 },
          right: { xs: 16, md: 32 },
          width: { xs: 'calc(100vw - 32px)', sm: 360 },
          maxHeight: 400,
          borderRadius: 3,
          overflow: 'hidden',
          zIndex: theme.zIndex.speedDial - 1,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconMessageCircle size={18} color={theme.palette.primary.main} />
            <Typography variant='subtitle2' fontWeight={600} color='primary'>
              Citro
            </Typography>
            <Chip
              label='Voice'
              size='small'
              variant='outlined'
              color='primary'
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Box>
          <IconButton size='small' onClick={onClose} aria-label='Close Citro panel'>
            <IconX size={16} />
          </IconButton>
        </Box>

        {/* ── Messages Area ──────────────────────────────────────────────────── */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxHeight: 320,
            minHeight: 100,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.text.primary, 0.15),
              borderRadius: 2
            }
          }}
        >
          {/* Empty state */}
          {messages.length === 0 && !isProcessing && (
            <Fade in>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Tap the mic and say something!
                </Typography>
                <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5, display: 'block' }}>
                  Try: "Show events" or "Open dashboard"
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Message bubbles */}
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} theme={theme} />
          ))}

          {/* Typing indicator */}
          {isProcessing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 2,
                  px: 1.5,
                  py: 1
                }}
              >
                <TypingIndicator />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Slide>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ message, theme }) => {
  const isUser = message.sender === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '100%'
      }}
    >
      <Box
        sx={{
          maxWidth: '85%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: isUser
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.08),
          color: isUser
            ? theme.palette.primary.contrastText
            : theme.palette.text.primary,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4
        }}
      >
        {!isUser && (
          <Typography
            variant='caption'
            fontWeight={600}
            color='primary'
            sx={{ display: 'block', mb: 0.25, fontSize: '0.65rem' }}
          >
            Citro
          </Typography>
        )}
        <Typography variant='body2' sx={{ lineHeight: 1.5, fontSize: '0.813rem' }}>
          {message.text}
        </Typography>
      </Box>
    </Box>
  )
}

export default SubtitlePanel
