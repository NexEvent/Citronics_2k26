/**
 * CitroBotPanel — Premium Voice-Assistant Interaction Panel
 *
 * Complete redesign with psychology-backed UX:
 *
 *   VISUAL CONTINUITY: The dark header gradient + visor accent line mirrors
 *   the robot mascot body, creating instant visual kinship (Gestalt proximity).
 *
 *   HERO MIC (empty state): When there are no messages, the mic is centered
 *   and large — a single clear affordance. Hick's Law: fewer choices = faster
 *   action. The pulsing invite ring uses the Zeigarnik effect (incomplete
 *   pattern draws attention).
 *
 *   SUGGESTION CHIPS: Tappable capsules below the mic leverage the
 *   "paradox of choice" — 3 visible options feel empowering, not overwhelming.
 *   They rotate to stay fresh (mere exposure + novelty balance).
 *
 *   WAVEFORM BARS: When listening, 5 animated bars replace the static
 *   "Listening..." text — gives live feedback (Norman's feedback principle)
 *   and feels alive, not frozen.
 *
 *   GLASSMORPHIC DEPTH: Backdrop-blur + layered shadows create a sense of
 *   floating above the page (perceived premium value). The subtle purple
 *   border glow anchors it to the Citronics brand.
 *
 *   TRANSITION: When first message arrives, the hero mic smoothly yields to
 *   a compact chat view. No jarring layout shift — just elegant choreography.
 *
 * Props: isOpen, isListening, isProcessing, messages, onClose, onMicClick
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme, keyframes } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import { IconMicrophone, IconMicrophoneOff, IconX } from '@tabler/icons-react'

// ── Quick-action suggestion chips ────────────────────────────────────────────
// Shown as tappable capsules in the hero (empty) state.
// Grouped in sets of 3 — rotated every 8s to prevent staleness.
const CHIP_SETS = [
  [
    { label: 'Show events', icon: '🗓' },
    { label: 'What is Citro?', icon: '🤖' },
    { label: 'Help', icon: '💡' },
  ],
  [
    { label: 'How to register?', icon: '✋' },
    { label: 'Upcoming events', icon: '📅' },
    { label: 'Open dashboard', icon: '📊' },
  ],
  [
    { label: 'Where is the event?', icon: '📍' },
    { label: 'Go home', icon: '🏠' },
    { label: 'Show stats', icon: '📈' },
  ],
  [
    { label: 'Who are you?', icon: '🤔' },
    { label: 'When is the event?', icon: '📆' },
    { label: 'Upcoming events', icon: '🔮' },
  ]
]

// ── Keyframes ────────────────────────────────────────────────────────────────
const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.4; }
  100% { transform: scale(2.2); opacity: 0; }
`
const pulseInvite = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(115,103,240,0.3); }
  50%      { box-shadow: 0 0 0 10px rgba(115,103,240,0); }
`
const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-3px); }
`
const visorSweep = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
`
// Waveform bar animation — each bar has a different phase
const waveBar = keyframes`
  0%, 100% { transform: scaleY(0.3); }
  50%      { transform: scaleY(1); }
`

/**
 * Robot-head mini icon for the header
 */
const RobotHeadIcon = ({ size = 20 }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} style={{ display: 'block' }}>
    <defs>
      <linearGradient id='rphi-b' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#3D4072' />
        <stop offset='100%' stopColor='#1C1D38' />
      </linearGradient>
    </defs>
    <line x1='12' y1='2.5' x2='12' y2='5.5' stroke='#484B7E' strokeWidth='1.2' strokeLinecap='round' />
    <circle cx='12' cy='2' r='1.5' fill='#7367F0' />
    <rect x='4' y='6' width='16' height='14' rx='4.5' fill='url(#rphi-b)' />
    <rect x='6.5' y='9' width='11' height='5' rx='2' fill='#12122A' />
    <circle cx='9.5' cy='11.5' r='1.6' fill='#7367F0' />
    <circle cx='14.5' cy='11.5' r='1.6' fill='#7367F0' />
  </svg>
)

/**
 * Waveform visualiser — 5 bars that animate when listening
 */
const WaveformBars = ({ active, theme }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: '3px', height: 18,
    opacity: active ? 1 : 0, transition: 'opacity 0.3s ease'
  }}>
    {[0, 1, 2, 3, 4].map(i => (
      <Box key={i} sx={{
        width: 3, height: '100%', borderRadius: 1,
        bgcolor: alpha(theme.palette.primary.main, 0.7),
        transformOrigin: 'bottom',
        animation: active ? `${waveBar} ${0.6 + i * 0.12}s ease-in-out infinite` : 'none',
        animationDelay: `${i * 0.08}s`
      }} />
    ))}
  </Box>
)

/**
 * Compact message bubble
 */
const MessageBubble = ({ message, theme, index }) => {
  const isUser = message.sender === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: 0.03 }}
    >
      <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        <Box sx={{
          maxWidth: '85%', px: 1.3, py: 0.6, borderRadius: 2.5,
          bgcolor: isUser
            ? theme.palette.primary.main
            : theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.primary.main, 0.06),
          color: isUser ? '#fff' : theme.palette.text.primary,
          borderBottomRightRadius: isUser ? 4 : 20,
          borderBottomLeftRadius: isUser ? 20 : 4,
          boxShadow: isUser
            ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
            : 'none'
        }}>
          {!isUser && (
            <Typography variant='caption' fontWeight={700}
              sx={{
                display: 'block', mb: 0.15,
                fontSize: '0.48rem', letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: theme.palette.primary.main,
                opacity: 0.7
              }}>
              CITRO
            </Typography>
          )}
          <Typography variant='body2' sx={{
            lineHeight: 1.45, fontSize: '0.78rem',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap'
          }}>
            {message.text}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  )
}

/**
 * CitroBotPanel
 */
const CitroBotPanel = ({ isOpen, isListening, isProcessing, messages = [], onClose, onMicClick, onChipClick }) => {
  const theme = useTheme()
  const scrollRef = useRef(null)
  const [chipSetIdx, setChipSetIdx] = useState(0)

  const isDark = theme.palette.mode === 'dark'
  const hasMessages = messages.length > 0
  const showHero = !hasMessages && !isProcessing

  // Rotate chip sets
  useEffect(() => {
    if (!isOpen) return
    const iv = setInterval(() => setChipSetIdx(p => (p + 1) % CHIP_SETS.length), 8000)
    return () => clearInterval(iv)
  }, [isOpen])

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isProcessing])

  // Chip click → send text as a voice command via parent handler
  const handleChipClick = useCallback((label) => {
    if (onChipClick) onChipClick(label)
  }, [onChipClick])

  const statusLabel = isProcessing
    ? 'Processing'
    : isListening
    ? 'Listening'
    : 'Tap to speak'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          style={{
            position: 'fixed',
            bottom: 106,
            right: 20,
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: theme.zIndex.speedDial - 1
          }}
        >
          {/* ── Glassmorphic container ── */}
          <Box sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: isDark ? alpha('#1A1D36', 0.95) : alpha('#fff', 0.97),
            backdropFilter: 'blur(20px) saturate(1.4)',
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1)}`,
            boxShadow: [
              `0 20px 60px ${alpha('#000', isDark ? 0.35 : 0.12)}`,
              `0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}`,
              `0 0 40px ${alpha(theme.palette.primary.main, isDark ? 0.06 : 0.03)}`
            ].join(', ')
          }}>

            {/* ═══════════════ HEADER — dark visor-inspired ═══════════════ */}
            <Box sx={{
              position: 'relative',
              px: 1.8, py: 1,
              background: isDark
                ? `linear-gradient(135deg, ${alpha('#24264A', 0.9)}, ${alpha('#1A1D36', 0.9)})`
                : `linear-gradient(135deg, ${alpha('#2B2D54', 0.05)}, ${alpha('#1E1F3B', 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08)}`,
              overflow: 'hidden'
            }}>
              {/* Visor accent sweep — animated light line */}
              <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '30%', height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.06)}, transparent)`,
                  animation: `${visorSweep} 6s ease-in-out infinite`
                }
              }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{
                    width: 28, height: 28,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <RobotHeadIcon size={18} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Typography variant='subtitle2' fontWeight={800} lineHeight={1.1}
                        sx={{
                          fontSize: '0.82rem', letterSpacing: 1.6,
                          color: isDark ? theme.palette.primary.light : '#2B2D54'
                        }}>
                        CITRO
                      </Typography>
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: '#28C76F',
                        boxShadow: '0 0 6px rgba(40,199,111,0.5)'
                      }} />
                    </Box>
                    <Typography variant='caption'
                      sx={{
                        fontSize: '0.52rem', lineHeight: 1,
                        color: isDark ? alpha('#fff', 0.35) : 'text.disabled',
                        letterSpacing: 0.5
                      }}>
                      Voice Assistant
                    </Typography>
                  </Box>
                </Box>

                <IconButton size='small' onClick={onClose}
                  sx={{
                    p: 0.4,
                    color: isDark ? alpha('#fff', 0.3) : 'text.disabled',
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    '&:hover': {
                      color: isDark ? alpha('#fff', 0.6) : 'text.secondary',
                      bgcolor: alpha(theme.palette.primary.main, 0.12)
                    }
                  }}>
                  <IconX size={13} />
                </IconButton>
              </Box>
            </Box>

            {/* ═══════════════ HERO MIC STATE (empty) ═══════════════ */}
            <AnimatePresence mode='wait'>
              {showHero && (
                <motion.div
                  key='hero'
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    py: 2.8, px: 2
                  }}>
                    {/* Central mic with invite pulse */}
                    <Box sx={{ position: 'relative', mb: 1.8 }}>
                      {/* Pulse invite ring (idle only) */}
                      {!isListening && !isProcessing && (
                        <Box sx={{
                          position: 'absolute', inset: -6,
                          borderRadius: '50%',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                          animation: `${pulseInvite} 2.5s ease-in-out infinite`
                        }} />
                      )}

                      {/* Listening pulse rings */}
                      {isListening && (
                        <>
                          <Box sx={{
                            position: 'absolute', inset: -4,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            animation: `${pulseRing} 1.4s ease-out infinite`,
                            pointerEvents: 'none'
                          }} />
                          <Box sx={{
                            position: 'absolute', inset: -4,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            animation: `${pulseRing} 1.8s ease-out infinite 0.3s`,
                            pointerEvents: 'none'
                          }} />
                        </>
                      )}

                      <Fab
                        onClick={onMicClick}
                        disabled={isProcessing}
                        sx={{
                          width: 62, height: 62,
                          bgcolor: isListening ? 'primary.main' : isDark ? alpha('#2A2D52', 0.9) : 'background.paper',
                          color: isListening ? '#fff' : theme.palette.primary.main,
                          border: isListening ? 'none' : `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          boxShadow: isListening
                            ? `0 0 24px ${alpha(theme.palette.primary.main, 0.45)}`
                            : `0 4px 16px ${alpha('#000', 0.1)}`,
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            bgcolor: isListening ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08),
                            boxShadow: isListening
                              ? `0 0 32px ${alpha(theme.palette.primary.main, 0.55)}`
                              : `0 6px 20px ${alpha('#000', 0.15)}`
                          }
                        }}
                      >
                        {isProcessing
                          ? <CircularProgress size={24} color='inherit' />
                          : isListening
                          ? <IconMicrophone size={26} />
                          : <IconMicrophoneOff size={26} />}
                      </Fab>
                    </Box>

                    {/* Status + waveform */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {isListening && <WaveformBars active={isListening} theme={theme} />}
                      <Typography variant='body2'
                        fontWeight={isListening ? 700 : 500}
                        color={isListening ? 'primary.main' : 'text.secondary'}
                        sx={{ fontSize: '0.78rem' }}
                      >
                        {statusLabel}
                      </Typography>
                      {isListening && <WaveformBars active={isListening} theme={theme} />}
                    </Box>

                    {!isListening && (
                      <Typography variant='caption' color='text.disabled'
                        sx={{ fontSize: '0.56rem', mb: 1.8, letterSpacing: 0.3 }}>
                        English &middot; Hindi &middot; Hinglish
                      </Typography>
                    )}

                    {/* Quick-action suggestion chips */}
                    {!isListening && (
                      <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <AnimatePresence mode='wait'>
                          <motion.div
                            key={chipSetIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.25 }}
                            style={{ display: 'flex', gap: 6 }}
                          >
                            {CHIP_SETS[chipSetIdx].map((chip, i) => (
                              <Box
                                key={chip.label}
                                onClick={() => handleChipClick(chip.label)}
                                sx={{
                                  px: 1.1, py: 0.4,
                                  borderRadius: 5,
                                  fontSize: '0.62rem',
                                  fontWeight: 600,
                                  color: isDark ? alpha('#fff', 0.55) : 'text.secondary',
                                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                                  border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08)}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  userSelect: 'none',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
                                    color: theme.palette.primary.main,
                                    borderColor: alpha(theme.palette.primary.main, 0.25)
                                  }
                                }}
                              >
                                {chip.icon}&nbsp;{chip.label}
                              </Box>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              )}

              {/* ═══════════════ CHAT MODE (has messages) ═══════════════ */}
              {!showHero && (
                <motion.div
                  key='chat'
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── Compact mic row ── */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.2,
                    px: 1.6, py: 1.1, position: 'relative'
                  }}>
                    {/* Listening pulse rings */}
                    {isListening && !isProcessing && (
                      <>
                        <Box sx={{
                          position: 'absolute', left: 11, top: '50%',
                          width: 44, height: 44, mt: '-22px',
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.22),
                          animation: `${pulseRing} 1.4s ease-out infinite`,
                          pointerEvents: 'none'
                        }} />
                      </>
                    )}

                    <Fab
                      onClick={onMicClick}
                      disabled={isProcessing}
                      size='small'
                      sx={{
                        width: 44, height: 44, minHeight: 44, flexShrink: 0,
                        bgcolor: isListening ? 'primary.main' : isDark ? alpha('#2A2D52', 0.8) : 'background.paper',
                        color: isListening ? '#fff' : theme.palette.primary.main,
                        border: isListening ? 'none' : `1.5px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                        boxShadow: isListening
                          ? `0 0 16px ${alpha(theme.palette.primary.main, 0.4)}`
                          : theme.shadows[1],
                        transition: 'all 0.22s ease'
                      }}
                    >
                      {isProcessing
                        ? <CircularProgress size={18} color='inherit' />
                        : isListening
                        ? <IconMicrophone size={19} />
                        : <IconMicrophoneOff size={19} />}
                    </Fab>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant='body2'
                          fontWeight={isListening ? 700 : 400}
                          color={isListening ? 'primary.main' : 'text.secondary'}
                          sx={{ fontSize: '0.74rem', lineHeight: 1.3 }}
                        >
                          {statusLabel}
                        </Typography>
                        {isListening && <WaveformBars active theme={theme} />}
                      </Box>
                      {!isListening && !isProcessing && (
                        <Typography variant='caption' color='text.disabled'
                          sx={{ fontSize: '0.54rem' }}>
                          English &middot; Hindi &middot; Hinglish
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* ── Messages ── */}
                  <Box ref={scrollRef} sx={{
                    maxHeight: 240, overflowY: 'auto',
                    px: 1.4, pb: 1.2, pt: 0.4,
                    borderTop: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.08 : 0.06)}`,
                    display: 'flex', flexDirection: 'column', gap: 0.6,
                    '&::-webkit-scrollbar': { width: 3 },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: alpha(theme.palette.text.primary, 0.08),
                      borderRadius: 2
                    }
                  }}>
                    {messages.slice(-10).map((msg, i) => (
                      <MessageBubble key={i} message={msg} theme={theme} index={i} />
                    ))}
                    {isProcessing && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05),
                          borderRadius: 2, px: 1.2, py: 0.6,
                          display: 'flex', gap: 0.5
                        }}>
                          {[0, 1, 2].map(i => (
                            <Box key={i} sx={{
                              width: 4, height: 4, borderRadius: '50%',
                              bgcolor: alpha(theme.palette.primary.main, 0.45),
                              animation: `${bounce} 0.9s ease-in-out infinite`,
                              animationDelay: `${i * 0.14}s`
                            }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════════ BOTTOM ACCENT LINE ═══════════════ */}
            <Box sx={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`
            }} />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CitroBotPanel
