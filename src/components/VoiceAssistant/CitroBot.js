/**
 * CitroBot — Sleek AI Robot Mascot for Citro Voice Assistant
 *
 * Psychology-driven design:
 *   - PROXIMITY AWARENESS: Eyes brighten when cursor approaches (~200px).
 *     Creates "it notices me" social-presence bond (anthropomorphism).
 *   - HAPPY SQUINT: On hover, eyes squash slightly on Y-axis —
 *     mimics the human "smiling with eyes" response (Duchenne smile cue).
 *   - SATISFYING CLICK: Brief visor flash + micro-bounce = dopamine hit
 *     from immediate tactile feedback (operant conditioning).
 *   - CURIOSITY GAP: Hint copy alternates between teasing and helpful,
 *     creating an open loop that nudges the click.
 *   - MERE EXPOSURE: The bot's gentle float and idle behaviors make it
 *     a familiar, comforting constant — users grow attached over time.
 *   - PEAK-END RULE: The spring entrance animation is memorable;
 *     behaviors like double-blink create "personality moments" people recall.
 *
 * Props: isListening, isProcessing, isOpen, onClick
 */
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

// ── Personality-driven hint copy ─────────────────────────────────────────────
const HINTS = [
  '● Online',
  'Hey there 👋',
  'Try me',
  'Voice ready',
  'Got a sec?',
  'Ask anything',
]

// ── Idle behavior pool (expanded) ────────────────────────────────────────────
const IDLE_BEHAVIORS = ['glance-l', 'glance-r', 'wave', 'scan', 'blink', 'double-blink', 'nod']

// ── CSS keyframe animations ──────────────────────────────────────────────────
const STYLES = `
  /* ─── Gentle float ─── */
  .cbot-float {
    animation: cbotFloat 4.5s ease-in-out infinite;
  }
  @keyframes cbotFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-2.5px); }
  }

  /* ─── Antenna orb pulse ─── */
  .cbot-antenna-orb {
    animation: cbotAntPulse 3s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes cbotAntPulse {
    0%, 100% { opacity: 0.75; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.18); }
  }

  /* ─── Eye base transitions ─── */
  .cbot-eye-l, .cbot-eye-r,
  .cbot-hl-l, .cbot-hl-r {
    transform-box: fill-box;
    transform-origin: center;
    transition: transform 0.45s cubic-bezier(.4,0,.2,1),
                opacity 0.35s ease,
                filter 0.4s ease;
  }

  /* ─── Eye group ambient pulse ─── */
  .cbot-eyes-grp {
    animation: cbotEyeGlow 5s ease-in-out infinite;
    transition: opacity 0.3s ease;
  }
  @keyframes cbotEyeGlow {
    0%, 100% { opacity: 0.88; }
    50%      { opacity: 1; }
  }

  /* ─── Forehead indicator ─── */
  .cbot-indicator {
    animation: cbotIndBlink 2.5s step-end infinite;
  }
  @keyframes cbotIndBlink {
    0%, 50%  { opacity: 0.85; }
    51%, 53% { opacity: 0.15; }
    54%      { opacity: 0.85; }
  }

  /* ─── Shadow ─── */
  .cbot-shadow {
    animation: cbotShadow 4.5s ease-in-out infinite;
  }
  @keyframes cbotShadow {
    0%, 100% { opacity: 0.13; transform: scaleX(1); }
    50%      { opacity: 0.07; transform: scaleX(0.82); }
  }

  /* ─── Chest LED pulse ─── */
  .cbot-chest-led {
    animation: cbotChest 3.5s ease-in-out infinite;
  }
  @keyframes cbotChest {
    0%, 100% { opacity: 0.3; }
    50%      { opacity: 0.65; }
  }

  /* ─── Visor glow overlay ─── */
  .cbot-visor-glow {
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  /* ─── Scan line ─── */
  .cbot-scanline { opacity: 0; }

  /* ─── Click flash ─── */
  .cbot-visor-flash {
    opacity: 0;
    transition: opacity 0.12s ease;
  }
  .cbot-clicked .cbot-visor-flash {
    animation: cbotFlash 0.35s ease-out forwards;
  }
  @keyframes cbotFlash {
    0%   { opacity: 0.7; }
    100% { opacity: 0; }
  }
  .cbot-clicked .cbot-inner {
    animation: cbotClickBounce 0.32s ease-out;
  }
  @keyframes cbotClickBounce {
    0%   { transform: scale(1); }
    35%  { transform: scale(0.9); }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     BEHAVIOR STATES
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-glance-l .cbot-eye-l, .cbot-glance-l .cbot-eye-r,
  .cbot-glance-l .cbot-hl-l,  .cbot-glance-l .cbot-hl-r {
    transform: translateX(-2.5px);
  }
  .cbot-glance-r .cbot-eye-l, .cbot-glance-r .cbot-eye-r,
  .cbot-glance-r .cbot-hl-l,  .cbot-glance-r .cbot-hl-r {
    transform: translateX(2.5px);
  }

  .cbot-wave .cbot-antenna-grp {
    animation: cbotWave 0.35s ease-in-out 3;
    transform-origin: 40px 28px;
  }
  @keyframes cbotWave {
    0%, 100% { transform: rotate(0deg); }
    33%      { transform: rotate(10deg); }
    66%      { transform: rotate(-10deg); }
  }

  .cbot-scan .cbot-scanline {
    animation: cbotScanSweep 1.2s ease-in-out forwards;
  }
  @keyframes cbotScanSweep {
    0%   { transform: translateX(0);    opacity: 0; }
    12%  { opacity: 0.55; }
    88%  { opacity: 0.55; }
    100% { transform: translateX(34px); opacity: 0; }
  }

  .cbot-blink .cbot-eye-l, .cbot-blink .cbot-eye-r {
    animation: cbotEyeBlink 0.28s ease-in-out;
  }
  @keyframes cbotEyeBlink {
    0%, 100% { transform: scaleY(1); }
    40%, 60% { transform: scaleY(0.08); }
  }

  /* Double-blink — "noticing you" personality moment */
  .cbot-double-blink .cbot-eye-l, .cbot-double-blink .cbot-eye-r {
    animation: cbotDoubleBlink 0.65s ease-in-out;
  }
  @keyframes cbotDoubleBlink {
    0%, 100% { transform: scaleY(1); }
    15%, 25% { transform: scaleY(0.06); }
    35%, 45% { transform: scaleY(1); }
    55%, 65% { transform: scaleY(0.06); }
    75%      { transform: scaleY(1); }
  }

  /* Nod — subtle acknowledgment dip */
  .cbot-nod .cbot-float {
    animation: cbotNod 0.6s ease-in-out;
  }
  @keyframes cbotNod {
    0%, 100% { transform: translateY(0); }
    40%      { transform: translateY(2.5px); }
    60%      { transform: translateY(1px); }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PROXIMITY — "it sees me" social-presence bond
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-nearby .cbot-eyes-grp {
    animation: none;
    opacity: 1;
  }
  .cbot-nearby .cbot-antenna-orb {
    animation: cbotAntNear 1.5s ease-in-out infinite;
  }
  @keyframes cbotAntNear {
    0%, 100% { opacity: 0.9;  transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.25); }
  }
  .cbot-nearby .cbot-visor-glow { opacity: 0.5; }
  .cbot-nearby .cbot-chest-led { opacity: 0.55; }

  /* ══════════════════════════════════════════════════════════════════════════
     HOVER — happy squint (Duchenne smile cue)
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-wrap:hover .cbot-eye-l,
  .cbot-wrap:hover .cbot-eye-r {
    transform: scaleY(0.7) scaleX(1.08);
  }
  .cbot-wrap:hover .cbot-visor-glow { opacity: 0.8; }

  /* ══════════════════════════════════════════════════════════════════════════
     ACTIVE — listening
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-active .cbot-antenna-orb {
    animation: cbotAntActive 0.8s ease-in-out infinite;
  }
  @keyframes cbotAntActive {
    0%, 100% { opacity: 0.85; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.35); }
  }
  .cbot-active .cbot-visor-glow { opacity: 1; }
  .cbot-active .cbot-eyes-grp  { opacity: 1; animation: none; }
  .cbot-active .cbot-indicator  { animation: none; opacity: 1; }

  /* ══════════════════════════════════════════════════════════════════════════
     PROCESSING — thinking
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-processing .cbot-scanline {
    animation: cbotScanSweep 1.2s ease-in-out infinite;
  }
  .cbot-processing .cbot-visor-glow { opacity: 1; }
  .cbot-processing .cbot-eyes-grp {
    animation: cbotEyeProc 0.8s ease-in-out infinite alternate;
  }
  @keyframes cbotEyeProc {
    0%   { opacity: 0.45; }
    100% { opacity: 1; }
  }
  .cbot-processing .cbot-indicator {
    animation: cbotIndProc 0.6s ease-in-out infinite;
  }
  @keyframes cbotIndProc {
    0%, 100% { opacity: 0.4; }
    50%      { opacity: 1; }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     HOVER & PRESS
     ══════════════════════════════════════════════════════════════════════════ */
  .cbot-wrap:hover .cbot-inner { transform: scale(1.06); }
  .cbot-wrap:active .cbot-inner { transform: scale(0.92); }
  .cbot-inner {
    transition: transform 0.2s cubic-bezier(.4,0,.2,1),
                filter 0.28s ease;
  }
`

const CitroBot = memo(({ isListening = false, isProcessing = false, isOpen = false, onClick }) => {
  const theme = useTheme()
  const [hintIndex, setHintIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [behavior, setBehavior] = useState('idle')
  const [isNearby, setIsNearby] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const wrapRef = useRef(null)
  const timerRef = useRef(null)
  const resetRef = useRef(null)

  // ── Rotating hints ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) { setShowHint(false); return }
    const show = () => {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 2600)
      setHintIndex(prev => (prev + 1) % HINTS.length)
    }
    const t = setTimeout(show, 3500)
    const iv = setInterval(show, 9000)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [isOpen])

  // ── Mouse proximity detection ─────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e) => {
      if (!wrapRef.current) return
      const rect = wrapRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      setIsNearby(dist < 200)
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // ── Click flash feedback ──────────────────────────────────────────────
  const handleClick = useCallback(() => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 400)
    onClick?.()
  }, [onClick])

  // ── Idle behavior state machine ───────────────────────────────────────
  useEffect(() => {
    if (isListening || isProcessing) {
      setBehavior('idle')
      return
    }
    const schedule = () => {
      const delay = 4500 + Math.random() * 9000
      timerRef.current = setTimeout(() => {
        const pick = IDLE_BEHAVIORS[Math.floor(Math.random() * IDLE_BEHAVIORS.length)]
        setBehavior(pick)
        const dur = { wave: 1200, scan: 1400, 'double-blink': 800, nod: 700 }[pick] ?? 700
        resetRef.current = setTimeout(() => {
          setBehavior('idle')
          schedule()
        }, dur)
      }, delay)
    }
    schedule()
    return () => { clearTimeout(timerRef.current); clearTimeout(resetRef.current) }
  }, [isListening, isProcessing])

  const isActive = isListening || isProcessing

  const wrapClass = [
    'cbot-wrap',
    isActive ? (isProcessing ? 'cbot-processing' : 'cbot-active') : '',
    !isActive && behavior !== 'idle' ? `cbot-${behavior}` : '',
    !isActive && isNearby ? 'cbot-nearby' : '',
    isClicked ? 'cbot-clicked' : ''
  ].filter(Boolean).join(' ')

  return (
    <Box
      ref={wrapRef}
      className={wrapClass}
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: { xs: 18, md: 24 },
        right: { xs: 18, md: 24 },
        zIndex: theme.zIndex.speedDial,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <style>{STYLES}</style>

      {/* Status hint bubble */}
      <Fade in={showHint && !isOpen} timeout={280}>
        <Box sx={{
          position: 'absolute', bottom: '100%', right: 0, mb: 1,
          px: 1.2, py: 0.45, borderRadius: 1.5,
          bgcolor: alpha('#1E1F3B', 0.92),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 4px 20px ${alpha('#000', 0.2)}`,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          '&::after': {
            content: '""', position: 'absolute', bottom: -5, right: 16,
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${alpha('#1E1F3B', 0.92)}`
          }
        }}>
          <Typography variant='caption' fontWeight={600}
            sx={{
              fontSize: '0.6rem', letterSpacing: 0.8,
              color: theme.palette.primary.light,
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 0.5
            }}
          >
            <Box sx={{
              width: 5, height: 5, borderRadius: '50%',
              bgcolor: '#28C76F',
              boxShadow: '0 0 6px rgba(40,199,111,0.6)'
            }} />
            {HINTS[hintIndex]}
          </Typography>
        </Box>
      </Fade>

      {/* Robot mascot SVG */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.8 }}
      >
        <Box
          className='cbot-inner'
          sx={{
            filter: isActive
              ? `drop-shadow(0 0 14px ${alpha(theme.palette.primary.main, 0.55)})`
              : isNearby
              ? `drop-shadow(0 0 10px ${alpha(theme.palette.primary.main, 0.3)})`
              : `drop-shadow(0 3px 10px ${alpha(theme.palette.common.black, 0.2)})`,
            display: 'block'
          }}
        >
          <svg viewBox='0 0 80 100' xmlns='http://www.w3.org/2000/svg'
            style={{ width: 56, height: 70, display: 'block' }}>
            <defs>
              <linearGradient id='cbBody' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#3D4072' />
                <stop offset='45%' stopColor='#2B2D54' />
                <stop offset='100%' stopColor='#1C1D38' />
              </linearGradient>
              <linearGradient id='cbVisor' x1='0' y1='0' x2='1' y2='0'>
                <stop offset='0%' stopColor='#0E0E28' />
                <stop offset='50%' stopColor='#18183C' />
                <stop offset='100%' stopColor='#0E0E28' />
              </linearGradient>
              <radialGradient id='cbEye' cx='50%' cy='50%' r='50%'>
                <stop offset='0%' stopColor='#A99BFF' />
                <stop offset='55%' stopColor='#7367F0' />
                <stop offset='100%' stopColor='#5A4FD6' />
              </radialGradient>
              <radialGradient id='cbAntOrb' cx='35%' cy='35%' r='60%'>
                <stop offset='0%' stopColor='#B5AAFF' />
                <stop offset='100%' stopColor='#7367F0' />
              </radialGradient>
              <filter id='cbGlow' x='-50%' y='-50%' width='200%' height='200%'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='2.2' result='blur' />
                <feMerge>
                  <feMergeNode in='blur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
              <filter id='cbAmb' x='-80%' y='-80%' width='260%' height='260%'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='7' />
              </filter>
            </defs>

            <rect x='14' y='28' width='52' height='52' rx='14'
              fill='#7367F0' opacity='0.07' filter='url(#cbAmb)' />

            <g className='cbot-antenna-grp'>
              <line x1='40' y1='16' x2='40' y2='29'
                stroke='#484B7E' strokeWidth='1.8' strokeLinecap='round' />
              <circle className='cbot-antenna-orb' cx='40' cy='13' r='4'
                fill='url(#cbAntOrb)' filter='url(#cbGlow)' />
            </g>

            <g className='cbot-float'>
              <rect x='14' y='30' width='52' height='50' rx='13'
                fill='url(#cbBody)' stroke='rgba(115,103,240,0.18)' strokeWidth='0.8' />
              <path d='M 28 30.5 L 52 30.5'
                stroke='rgba(115,103,240,0.22)' strokeWidth='0.6' strokeLinecap='round' />
              <rect x='16.5' y='32.5' width='47' height='45' rx='11'
                fill='none' stroke='rgba(115,103,240,0.06)' strokeWidth='0.5' />
              <circle className='cbot-indicator' cx='40' cy='36' r='1.3' fill='#00CFE8' />
              <rect x='20' y='41' width='40' height='15' rx='5.5' fill='url(#cbVisor)' />
              <rect x='20' y='41' width='40' height='15' rx='5.5'
                fill='none' stroke='rgba(115,103,240,0.1)' strokeWidth='0.5' />
              <rect className='cbot-visor-glow' x='22' y='43' width='36' height='11' rx='4'
                fill='rgba(115,103,240,0.12)' />
              <rect className='cbot-visor-flash' x='20' y='41' width='40' height='15' rx='5.5'
                fill='rgba(115,103,240,0.6)' />
              <g className='cbot-eyes-grp'>
                <circle className='cbot-eye-l' cx='32' cy='48.5' r='4.2'
                  fill='url(#cbEye)' filter='url(#cbGlow)' />
                <circle className='cbot-eye-r' cx='48' cy='48.5' r='4.2'
                  fill='url(#cbEye)' filter='url(#cbGlow)' />
                <circle className='cbot-hl-l' cx='30' cy='47' r='1.1' fill='white' opacity='0.55' />
                <circle className='cbot-hl-r' cx='46' cy='47' r='1.1' fill='white' opacity='0.55' />
              </g>
              <rect className='cbot-scanline' x='20' y='41' width='6' height='15' rx='3'
                fill='rgba(115,103,240,0.32)' />
              <path d='M 34 66 L 40 66 L 40 70 L 46 70'
                fill='none' stroke='rgba(115,103,240,0.14)' strokeWidth='0.6' />
              <circle cx='34' cy='66' r='0.9' fill='rgba(115,103,240,0.2)' />
              <circle cx='46' cy='70' r='0.9' fill='rgba(115,103,240,0.2)' />
              <circle className='cbot-chest-led' cx='40' cy='73' r='1.6'
                fill='#7367F0' opacity='0.35' />
            </g>

            <ellipse className='cbot-shadow' cx='40' cy='90' rx='18' ry='3.5'
              fill='rgba(0,0,0,0.13)' />
          </svg>
        </Box>
      </motion.div>
    </Box>
  )
})

CitroBot.displayName = 'CitroBot'

export default CitroBot
