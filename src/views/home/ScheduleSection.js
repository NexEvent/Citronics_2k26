import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'


/* ═══════════════════════════════════════════════════════════════════════════
   Placeholder event images per day (replace with real images when available)
   ═══════════════════════════════════════════════════════════════════════════ */
const DAY_IMAGES = [
  [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587825140708-dfaf18c4c3d1?w=600&h=400&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop'
  ]
]

/* ═══════════════════════════════════════════════════════════════════════════
   ScheduleSection — Aceternity-style scroll-progress vertical timeline
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Multi-day schedule section with Aceternity-style scroll-progress timeline.
 *
 * - Day titles ("Day 1", "Day 2", "Day 3") are sticky on the left and scroll
 *   with the line, stopping when the next day arrives.
 * - Events are shown as clean text list items (no boxes).
 * - 4-image grid per day, Aceternity-reference style with soft shadows.
 * - Scroll-linked gradient line powered by framer-motion useScroll.
 *
 * @param {object} props
 * @param {Array} [props.scheduleDays=[]] - Array of day objects from the home API
 */
export default function ScheduleSection({ scheduleDays: SCHEDULE_DAYS = [] }) {
  const c = useAppPalette()
  const timelineRef = useRef(null)
  const [height, setHeight] = useState(0)

  // Continuously measure timeline height via ResizeObserver
  useEffect(() => {
    const node = timelineRef.current
    if (!node) return

    const measure = () => setHeight(node.getBoundingClientRect().height)
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(node)

    return () => ro.disconnect()
  }, [SCHEDULE_DAYS])

  if (!SCHEDULE_DAYS.length) return null

  // Soft multi-layer shadow matching Aceternity image cards
  const imgShadow = [
    `0 0 24px ${alpha(c.textPrimary, 0.06)}`,
    `0 1px 1px ${alpha(c.black, 0.05)}`,
    `0 0 0 1px ${alpha(c.textPrimary, 0.04)}`,
    `0 0 4px ${alpha(c.textPrimary, 0.08)}`,
    `0 16px 68px ${alpha(c.textPrimary, 0.05)}`,
    `inset 0 1px 0 ${alpha(c.white, 0.1)}`
  ].join(', ')

  return (
    <Box
      id='schedule'
      sx={{
        width: '100%',
        bgcolor: c.bgDefault,
        fontFamily: 'inherit',
        px: { xs: 0, md: 5 }
      }}
    >
      {/* ── Section header ─────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: { xs: 8, md: 10 }, px: { xs: 2, md: 4, lg: 5 } }}>
        <Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '100px',
              background: c.infoA8,
              border: `1px solid ${c.infoA15}`,
              mb: 2
            }}
          >
            <Icon icon='tabler:clock' fontSize={14} style={{ color: c.info }} />
            <Typography variant='caption' sx={{ color: c.info, fontWeight: 600, letterSpacing: 1.5 }}>
              3-DAY AGENDA
            </Typography>
          </Box>

          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              mb: 1.5,
              letterSpacing: '-0.5px',
              maxWidth: 700,
              fontSize: { xs: '1.25rem', md: '2.25rem' }
            }}
          >
            Event Schedule
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: c.textSecondary, maxWidth: 440, lineHeight: 1.7, fontSize: { xs: '0.85rem', md: '1rem' } }}
          >
            Three action-packed days of competitions, workshops, and unforgettable cultural nights.
          </Typography>
        </Box>
      </Box>

      {/* ── Timeline body ──────────────────────────────────────────── */}
      <Box ref={timelineRef} sx={{ position: 'relative', maxWidth: 1200, mx: 'auto', pb: { xs: 8, md: 10 } }}>
        {SCHEDULE_DAYS.map((day, dayIndex) => (
          <Box
            key={day.day}
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              pt: dayIndex === 0 ? { xs: 2, md: 5 } : { xs: 5, md: 20 },
              gap: { xs: 0, md: 5 }
            }}
          >
            {/* ── LEFT: day title + dot (scrolls with content) ──── */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                alignSelf: 'flex-start',
                zIndex: 40,
                maxWidth: { xs: 56, lg: 360 },
                width: { md: '100%' }
              }}
            >
              {/* Dot — centered on the 2px line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 2, md: 2 },
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: c.bgDefault,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: c.isDark ? c.grey[800] : c.grey[200],
                    border: `1px solid ${c.isDark ? c.grey[700] : c.grey[300]}`
                  }}
                />
              </Box>

              {/* Day title — desktop (large, sticky, scrolls with section) */}
              <Typography
                sx={{
                  display: { xs: 'none', md: 'block' },
                  pl: 8,
                  fontWeight: 700,
                  color: c.textSecondary,
                  whiteSpace: 'nowrap',
                  fontSize: { md: '1.5rem', lg: '3rem' },
                  letterSpacing: '-0.02em'
                }}
              >
                {day.day}
              </Typography>
            </Box>

            {/* ── RIGHT: content ──────────────────────────────── */}
            <Box sx={{ position: 'relative', pl: { xs: 9, md: 2 }, pr: { xs: 2, md: 4 }, width: '100%' }}>
              {/* Day title — mobile only */}
              <Typography
                sx={{
                  display: { xs: 'block', md: 'none' },
                  mb: 2,
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  color: c.textSecondary,
                  letterSpacing: '-0.02em'
                }}
              >
                {day.day}
              </Typography>

              {/* Day description */}
              <Box>
                <Typography
                  sx={{
                    color: c.textPrimary,
                    mb: 3,
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.35rem' },
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}
                >
                  {day.date} &mdash; Theme: <strong>{day.theme}</strong>
                </Typography>
              </Box>

              {/* ── Event list (clean text, no boxes) ─────────── */}
              <Box sx={{ mb: 4 }}>
                {day.highlights.map((item, i) => {
                  const color = c.theme.palette[item.paletteKey]?.main || c.primary

                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 1.5,
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Checkmark / bullet */}
                      <Icon
                        icon='tabler:circle-check-filled'
                        fontSize={20}
                        style={{ color: c.textPrimary, flexShrink: 0 }}
                      />

                      {/* Time */}
                      <Typography
                        component='span'
                        sx={{
                          fontWeight: 600,
                          color: c.textPrimary,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          minWidth: 80,
                          py: 0.25,
                          px: 0.5
                        }}
                      >
                        {item.time}
                      </Typography>

                      {/* Event name */}
                      <Typography
                        component='span'
                        sx={{
                          color: c.textPrimary,
                          fontWeight: item.dept === 'all' ? 600 : 400,
                          fontSize: { xs: '0.875rem', md: '1rem' }
                        }}
                      >
                        {item.event}
                      </Typography>

                      {/* Department tag (inline, subtle) */}
                      {item.dept !== 'all' && (
                        <Typography
                          component='span'
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color,
                            bgcolor: alpha(color, 0.1),
                            border: `1px solid ${alpha(color, 0.2)}`,
                            borderRadius: '6px',
                            px: 0.8,
                            py: 0.15,
                            lineHeight: 1.4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {item.dept}
                        </Typography>
                      )}
                    </Box>
                  )
                })}
              </Box>

              {/* ── Image grid (2×2, Aceternity reference style) ── */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                  gap: 2,
                  mb: 2
                }}
              >
                {(DAY_IMAGES[dayIndex] || DAY_IMAGES[0]).map((src, imgIdx) => (
                  <Box key={imgIdx}>
                    <Box
                      component='img'
                      src={src}
                      alt={`${day.day} event ${imgIdx + 1}`}
                      loading='lazy'
                      sx={{
                        width: '100%',
                        height: { xs: 100, md: 180, lg: 240 },
                        objectFit: 'cover',
                        borderRadius: '12px',
                        boxShadow: imgShadow,
                        display: 'block'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ))}

        {/* ── Scroll-progress line ─────────────────────────────────── */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 20, md: 20 },
            top: 0,
            width: 2,
            height: height || '100%',
            overflow: 'hidden',
            background: `linear-gradient(to bottom, transparent 0%, ${c.isDark ? c.grey[700] : c.grey[200]} 10%, ${c.isDark ? c.grey[700] : c.grey[200]} 90%, transparent 99%)`,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            zIndex: 0
          }}
        >
          <Box
            sx={{
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: 2,
              borderRadius: 9999,
              background: `linear-gradient(to top, ${c.primary}, ${c.info}, transparent)`
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}