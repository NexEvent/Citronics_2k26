/**
 * CitroPuppy — Anime-style mascot for Citro Voice Assistant
 *
 * Redesigned as a soft anime chibi dog:
 * - SVG radial/linear gradients for realistic depth and fur shading
 * - Large expressive anime eyes with multi-layer reflective highlights
 * - Smooth tail curl, slow natural ear sway, subtle breathing idle
 * - NO harsh bounce/float — just a gentle breathing scale
 * - Speech bubble tips rotate when popup is closed
 */
import { useState, useEffect, memo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import { alpha, useTheme } from '@mui/material/styles'

// ── Rotating hint phrases ─────────────────────────────────────────────────────
const PHRASES = [
  'Hey! 👋',
  'Ask me!',
  'Need help?',
  'Try voice! 🎤',
  'Events? 🗓️',
  'Woof~ 🐾'
]

// ── CSS keyframe animations ───────────────────────────────────────────────────
const STYLES = `
  /* Subtle breathing — no harsh float */
  .citro-body-breathe {
    transform-origin: 50px 75px;
    animation: citroBreath 4.2s ease-in-out infinite;
  }
  @keyframes citroBreath {
    0%, 100% { transform: scaleY(1) scaleX(1);       }
    50%       { transform: scaleY(1.016) scaleX(0.99); }
  }

  /* Smooth tail curl */
  .citro-tail {
    transform-origin: 64px 74px;
    animation: citroTail 0.65s ease-in-out infinite alternate;
  }
  @keyframes citroTail {
    0%   { transform: rotate(-11deg); }
    100% { transform: rotate(13deg);  }
  }
  .citro-active .citro-tail { animation-duration: 0.22s; }

  /* Slow natural ear sway */
  .citro-ear-l {
    transform-origin: 25px 36px;
    animation: citroEarL 6.5s ease-in-out infinite;
  }
  .citro-ear-r {
    transform-origin: 75px 36px;
    animation: citroEarR 6.5s ease-in-out infinite;
  }
  @keyframes citroEarL {
    0%, 76%, 100% { transform: rotate(0deg); }
    82%, 92%      { transform: rotate(5deg); }
  }
  @keyframes citroEarR {
    0%, 76%, 100% { transform: rotate(0deg); }
    82%, 92%      { transform: rotate(-5deg); }
  }
  /* Listening: ears perk forward */
  .citro-active .citro-ear-l { animation: none; transform: rotate(-9deg); transition: transform 0.35s ease; }
  .citro-active .citro-ear-r { animation: none; transform: rotate(9deg);  transition: transform 0.35s ease; }

  /* Natural lazy blink */
  .citro-eyelid-l, .citro-eyelid-r {
    transform-box: fill-box;
    transform-origin: center top;
    animation: citroBlink 5.5s ease-in-out infinite;
  }
  .citro-eyelid-r { animation-delay: 0.04s; }
  @keyframes citroBlink {
    0%, 87%, 100% { transform: scaleY(0); }
    90%, 95%      { transform: scaleY(1); }
  }

  /* Shadow pulses with breath */
  .citro-shadow {
    animation: citroShadow 4.2s ease-in-out infinite;
  }
  @keyframes citroShadow {
    0%, 100% { opacity: 0.13; transform: scaleX(1);    }
    50%      { opacity: 0.08; transform: scaleX(0.82); }
  }

  /* Hover */
  .citro-wrap:hover .citro-inner { transform: scale(1.07); }
  .citro-inner { transition: transform 0.22s ease, filter 0.28s ease; }
`

const CitroPuppy = memo(({ isListening = false, isProcessing = false, isOpen = false, onClick }) => {
  const theme = useTheme()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    if (isOpen) { setShowBubble(false); return }
    const show = () => {
      setShowBubble(true)
      setTimeout(() => setShowBubble(false), 2800)
      setPhraseIndex(p => (p + 1) % PHRASES.length)
    }
    const t = setTimeout(show, 4000)
    const iv = setInterval(show, 8000)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [isOpen])

  const isActive = isListening || isProcessing

  return (
    <Box
      className='citro-wrap'
      onClick={onClick}
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

      {/* Speech hint bubble */}
      <Fade in={showBubble && !isOpen} timeout={350}>
        <Box sx={{
          position: 'absolute', bottom: '100%', right: 2, mb: 1.2,
          px: 1.3, py: 0.6, borderRadius: 2.5,
          bgcolor: 'background.paper',
          boxShadow: `0 3px 16px ${alpha(theme.palette.common.black, 0.14)}`,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          '&::after': {
            content: '""', position: 'absolute', bottom: -5, right: 14,
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: `6px solid ${theme.palette.background.paper}`
          }
        }}>
          <Typography variant='caption' fontWeight={700}
            sx={{ fontSize: '0.68rem', color: 'primary.main', letterSpacing: 0.2 }}>
            {PHRASES[phraseIndex]}
          </Typography>
        </Box>
      </Fade>

      {/* Anime Citro SVG */}
      <Box className='citro-inner'
        sx={{
          filter: isActive
            ? `drop-shadow(0 0 9px ${alpha(theme.palette.primary.main, 0.65)})`
            : `drop-shadow(0 2px 8px ${alpha(theme.palette.common.black, 0.18)})`,
          display: 'block'
        }}
      >
        <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'
          style={{ width: 66, height: 66, display: 'block' }}>
          <defs>
            {/* Body gradient — soft purple */}
            <radialGradient id='cBodyGrad' cx='42%' cy='35%' r='62%'>
              <stop offset='0%' stopColor='#EDE0FF' />
              <stop offset='55%' stopColor='#CABFF5' />
              <stop offset='100%' stopColor='#A893E0' />
            </radialGradient>
            {/* Ear inner gradient */}
            <radialGradient id='cEarInner' cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='#F5EEFF' />
              <stop offset='100%' stopColor='#D9C8F8' />
            </radialGradient>
            {/* Muzzle patch */}
            <radialGradient id='cMuzzle' cx='50%' cy='45%' r='55%'>
              <stop offset='0%' stopColor='#F8F4FF' />
              <stop offset='100%' stopColor='#E8DCFA' />
            </radialGradient>
            {/* Iris gradient */}
            <radialGradient id='cIris' cx='38%' cy='32%' r='60%'>
              <stop offset='0%' stopColor='#7B5EA7' />
              <stop offset='55%' stopColor='#4A3575' />
              <stop offset='100%' stopColor='#2A1D52' />
            </radialGradient>
            {/* Sclera */}
            <radialGradient id='cSclera' cx='40%' cy='35%' r='65%'>
              <stop offset='0%' stopColor='#FFFFFF' />
              <stop offset='100%' stopColor='#EEE8FF' />
            </radialGradient>
            {/* Nose */}
            <radialGradient id='cNose' cx='38%' cy='38%' r='58%'>
              <stop offset='0%' stopColor='#9579C8' />
              <stop offset='100%' stopColor='#5C3FA0' />
            </radialGradient>
            {/* Tail */}
            <linearGradient id='cTail' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#CABFF5' />
              <stop offset='100%' stopColor='#A090D5' />
            </linearGradient>
          </defs>

          {/* ── Tail (behind body) ── */}
          <g className='citro-tail'>
            <path d='M 63 73 C 72 62, 84 57, 82 44'
              stroke='url(#cTail)' strokeWidth='5.5' fill='none' strokeLinecap='round' />
            <circle cx='82' cy='44' r='4.2' fill='url(#cBodyGrad)' />
          </g>

          {/* ── Body ── */}
          <g className='citro-body-breathe'>
            <ellipse cx='50' cy='80' rx='22' ry='13' fill='url(#cBodyGrad)' />
            <ellipse cx='50' cy='82' rx='13' ry='7.5' fill='#F0E8FF' opacity='0.5' />

            {/* Paws */}
            <ellipse cx='34' cy='90' rx='8.5' ry='5.2' fill='url(#cBodyGrad)' />
            <circle cx='30' cy='89' r='1.2' fill='#9A85D0' />
            <circle cx='33' cy='87.8' r='1.2' fill='#9A85D0' />
            <circle cx='36.5' cy='89' r='1.2' fill='#9A85D0' />
            <ellipse cx='66' cy='90' rx='8.5' ry='5.2' fill='url(#cBodyGrad)' />
            <circle cx='62.5' cy='89' r='1.2' fill='#9A85D0' />
            <circle cx='66' cy='87.8' r='1.2' fill='#9A85D0' />
            <circle cx='69.5' cy='89' r='1.2' fill='#9A85D0' />
          </g>

          {/* ── Left ear ── */}
          <g className='citro-ear-l'>
            <ellipse cx='25' cy='27' rx='10.5' ry='20' fill='url(#cBodyGrad)' transform='rotate(-16 25 27)' />
            <ellipse cx='25' cy='29' rx='5.8' ry='12' fill='url(#cEarInner)' transform='rotate(-16 25 29)' />
          </g>

          {/* ── Right ear ── */}
          <g className='citro-ear-r'>
            <ellipse cx='75' cy='27' rx='10.5' ry='20' fill='url(#cBodyGrad)' transform='rotate(16 75 27)' />
            <ellipse cx='75' cy='29' rx='5.8' ry='12' fill='url(#cEarInner)' transform='rotate(16 75 29)' />
          </g>

          {/* ── Head ── */}
          <circle cx='50' cy='47' r='28' fill='url(#cBodyGrad)' />
          {/* Fur tuft on forehead */}
          <path d='M 44 22 Q 50 16 56 22' fill='none' stroke='#B8AAEC' strokeWidth='2.2' strokeLinecap='round' />

          {/* ── Muzzle patch ── */}
          <ellipse cx='50' cy='56' rx='15' ry='10' fill='url(#cMuzzle)' />

          {/* ── Anime Eyes ── */}
          {/* Left eye */}
          <circle cx='37' cy='44' r='8.8' fill='url(#cSclera)' />
          <circle cx='37.8' cy='43.5' r='6.6' fill='url(#cIris)' />
          <circle cx='37.8' cy='43.5' r='4.2' fill='#1E1140' />
          {/* L catchlights */}
          <circle cx='35.2' cy='40.8' r='2.2' fill='white' opacity='0.92' />
          <circle cx='39.6' cy='45.2' r='1.1' fill='white' opacity='0.55' />
          <circle cx='40.2' cy='41.6' r='0.7' fill='white' opacity='0.4' />

          {/* Right eye */}
          <circle cx='63' cy='44' r='8.8' fill='url(#cSclera)' />
          <circle cx='63.8' cy='43.5' r='6.6' fill='url(#cIris)' />
          <circle cx='63.8' cy='43.5' r='4.2' fill='#1E1140' />
          {/* R catchlights */}
          <circle cx='61.2' cy='40.8' r='2.2' fill='white' opacity='0.92' />
          <circle cx='65.6' cy='45.2' r='1.1' fill='white' opacity='0.55' />
          <circle cx='66.2' cy='41.6' r='0.7' fill='white' opacity='0.4' />

          {/* Anime eyelashes (top arc) */}
          <path d='M 29.5 41.5 Q 37 36 44.5 41.5' fill='none' stroke='#3D2A6A' strokeWidth='1.6' strokeLinecap='round' />
          <path d='M 55.5 41.5 Q 63 36 70.5 41.5' fill='none' stroke='#3D2A6A' strokeWidth='1.6' strokeLinecap='round' />

          {/* Eyelids (blink) */}
          <ellipse className='citro-eyelid-l' cx='37' cy='44' rx='9.2' ry='9' fill='url(#cBodyGrad)' />
          <ellipse className='citro-eyelid-r' cx='63' cy='44' rx='9.2' ry='9' fill='url(#cBodyGrad)' />

          {/* ── Nose ── */}
          <ellipse cx='50' cy='56' rx='4.2' ry='2.8' fill='url(#cNose)' />
          <ellipse cx='48.2' cy='55' rx='1.5' ry='1' fill='#C4A8F0' opacity='0.6' />

          {/* ── Mouth ── */}
          <path d='M 45.5 59 Q 50 64 54.5 59' fill='none' stroke='#7B5EA7' strokeWidth='1.6' strokeLinecap='round' />

          {/* Tongue */}
          <ellipse cx='50' cy='63' rx='3.2' ry='3.8' fill='#FF8FAA' />
          <line x1='50' y1='60.5' x2='50' y2='66' stroke='#FF6B90' strokeWidth='0.8' strokeLinecap='round' />

          {/* Blush spots */}
          <circle cx='26' cy='53' r='5.5' fill='rgba(255,180,200,0.22)' />
          <circle cx='74' cy='53' r='5.5' fill='rgba(255,180,200,0.22)' />
        </svg>
      </Box>

      {/* Shadow */}
      <Box className='citro-shadow'
        sx={{
          width: 36, height: 5, borderRadius: '50%',
          bgcolor: alpha(theme.palette.common.black, 0.13),
          mx: 'auto', mt: '-2px'
        }}
      />
    </Box>
  )
})

CitroPuppy.displayName = 'CitroPuppy'

export default CitroPuppy
