/**
 * CitroPopup — Compact voice assistant widget
 *
 * Designed to be a small, non-intrusive popup above the Citro mascot.
 * Fixed 272px width (no full-screen mobile), ~320px max height.
 */
import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme, keyframes } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import { IconMicrophone, IconMicrophoneOff, IconX } from '@tabler/icons-react'

// ── Rotating hint phrases ─────────────────────────────────────────────────────
const FEATURES = [
  { emoji: '🗓️', text: '"Show me events"' },
  { emoji: '📊', text: '"Open dashboard"' },
  { emoji: '🔍', text: '"Search hackathon"' },
  { emoji: '✋', text: '"Register for event"' },
  { emoji: '📅', text: '"What\'s upcoming?"' },
  { emoji: '📈', text: '"Show stats"' },
  { emoji: '🏠', text: '"Go home"' }
]

const pulseRing1 = keyframes`
  0%   { transform: scale(1);   opacity: 0.48; }
  100% { transform: scale(2);   opacity: 0; }
`
const pulseRing2 = keyframes`
  0%   { transform: scale(1);   opacity: 0.28; }
  100% { transform: scale(2.5); opacity: 0; }
`
const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0);    }
  30%           { transform: translateY(-4px); }
`

/**
 * Compact inline message bubble
 */
const MessageBubble = ({ message, theme }) => {
  const isUser = message.sender === 'user'
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box sx={{
        maxWidth: '84%', px: 1.2, py: 0.55, borderRadius: 2.5,
        bgcolor: isUser
          ? theme.palette.primary.main
          : alpha(theme.palette.primary.main, 0.09),
        color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
        borderBottomRightRadius: isUser ? 4 : 20,
        borderBottomLeftRadius: isUser ? 20 : 4
      }}>
        {!isUser && (
          <Typography variant='caption' fontWeight={700} color='primary'
            sx={{ display: 'block', mb: 0.1, fontSize: '0.52rem', letterSpacing: 0.5 }}>
            CITRO
          </Typography>
        )}
        <Typography variant='body2' sx={{ lineHeight: 1.42, fontSize: '0.76rem' }}>
          {message.text}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * CitroPopup — compact 272px voice widget
 */
const CitroPopup = ({ isOpen, isListening, isProcessing, messages = [], onClose, onMicClick }) => {
  const theme = useTheme()
  const scrollRef = useRef(null)
  const [hintIndex, setHintIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const iv = setInterval(() => setHintIndex(p => (p + 1) % FEATURES.length), 3500)
    return () => clearInterval(iv)
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isProcessing])

  const statusText = isProcessing
    ? 'Citro is thinking...'
    : isListening
    ? 'Listening…'
    : 'Tap to talk'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          style={{
            position: 'fixed',
            bottom: 102,
            right: 20,
            width: 272,
            zIndex: theme.zIndex.speedDial - 1
          }}
        >
          <Paper elevation={14} sx={{
            borderRadius: 3.5,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`
          }}>

            {/* ── Compact header ── */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 1.8, py: 1,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)}, transparent)`,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>🐾</Typography>
                <Box>
                  <Typography variant='subtitle2' fontWeight={800} color='primary' lineHeight={1.1}
                    sx={{ fontSize: '0.8rem' }}>
                    Citro
                  </Typography>
                  <Typography variant='caption' color='text.disabled'
                    sx={{ fontSize: '0.56rem', lineHeight: 1 }}>
                    Voice Assistant
                  </Typography>
                </Box>
              </Box>
              <IconButton size='small' onClick={onClose} sx={{ p: 0.35 }}>
                <IconX size={14} />
              </IconButton>
            </Box>

            {/* ── Rotating hint ── */}
            <Box sx={{
              px: 1.8, py: 0.7,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex', alignItems: 'center', gap: 0.5,
              minHeight: 34, overflow: 'hidden'
            }}>
              <Typography variant='caption' color='text.disabled'
                sx={{ fontSize: '0.58rem', flexShrink: 0 }}>
                Try:
              </Typography>
              <AnimatePresence mode='wait'>
                <motion.div key={hintIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.24 }}
                >
                  <Typography variant='caption' fontWeight={600} color='primary'
                    sx={{ fontSize: '0.72rem' }}>
                    {FEATURES[hintIndex].emoji} {FEATURES[hintIndex].text}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </Box>

            {/* ── Mic row ── */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 1.8, py: 1.4, position: 'relative'
            }}>
              {/* Pulse rings */}
              {isListening && !isProcessing && (
                <>
                  <Box sx={{
                    position: 'absolute', left: 14, top: '50%',
                    width: 52, height: 52, mt: '-26px',
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.28),
                    animation: `${pulseRing1} 1.4s ease-out infinite`,
                    pointerEvents: 'none'
                  }} />
                  <Box sx={{
                    position: 'absolute', left: 14, top: '50%',
                    width: 52, height: 52, mt: '-26px',
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    animation: `${pulseRing2} 1.8s ease-out infinite 0.28s`,
                    pointerEvents: 'none'
                  }} />
                </>
              )}

              {/* Mic button */}
              <Fab
                color={isListening ? 'primary' : 'default'}
                onClick={onMicClick}
                disabled={isProcessing}
                size='medium'
                sx={{
                  width: 52, height: 52, flexShrink: 0,
                  boxShadow: isListening
                    ? `0 0 18px ${alpha(theme.palette.primary.main, 0.48)}`
                    : theme.shadows[2],
                  bgcolor: isListening ? 'primary.main' : 'background.paper',
                  color: isListening ? 'primary.contrastText' : 'text.primary',
                  border: isListening ? 'none' : `2px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                  transition: 'all 0.22s ease'
                }}
              >
                {isProcessing
                  ? <CircularProgress size={22} color='inherit' />
                  : isListening
                  ? <IconMicrophone size={22} />
                  : <IconMicrophoneOff size={22} />}
              </Fab>

              {/* Status label */}
              <Box>
                <Typography variant='body2' fontWeight={isListening ? 700 : 400}
                  color={isListening ? 'primary.main' : 'text.secondary'}
                  sx={{ fontSize: '0.76rem', lineHeight: 1.3 }}>
                  {statusText}
                </Typography>
                {!isListening && !isProcessing && (
                  <Typography variant='caption' color='text.disabled'
                    sx={{ fontSize: '0.6rem' }}>
                    English or Hindi/Hinglish
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Messages (only when present) ── */}
            {(messages.length > 0 || isProcessing) && (
              <Box ref={scrollRef} sx={{
                maxHeight: 112, overflowY: 'auto',
                px: 1.5, pb: 1.4, pt: 0.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex', flexDirection: 'column', gap: 0.6,
                '&::-webkit-scrollbar': { width: 3 },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: alpha(theme.palette.text.primary, 0.1), borderRadius: 2
                }
              }}>
                {messages.slice(-8).map((msg, i) => (
                  <MessageBubble key={i} message={msg} theme={theme} />
                ))}
                {isProcessing && (
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderRadius: 2, px: 1.2, py: 0.55,
                      display: 'flex', gap: 0.4
                    }}>
                      {[0, 1, 2].map(i => (
                        <Box key={i} sx={{
                          width: 4, height: 4, borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.5),
                          animation: `${bounce} 0.9s ease-in-out infinite`,
                          animationDelay: `${i * 0.14}s`
                        }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Empty state footer ── */}
            {messages.length === 0 && !isProcessing && (
              <Box sx={{ px: 1.8, pb: 1.2, pt: 0 }}>
                <Typography variant='caption' color='text.disabled'
                  sx={{ fontSize: '0.6rem' }}>
                  🐾 Navigate, search events, register & more
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CitroPopup
