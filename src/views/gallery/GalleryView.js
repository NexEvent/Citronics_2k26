import { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CustomChip from 'src/components/mui/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── Mock Data ──────────────────────────────────────────────── */

const CATEGORIES = ['All', 'Events', 'Cultural','Campus', 'Behind the Scenes']

const ALL_IMAGES = []
const BATCH_SIZE = 8

const CATEGORY_COLORS = {
  All: 'primary',
  Events: 'info',
  Cultural: 'warning',
  Workshops: 'success',
  Campus: 'primary',
  'Behind the Scenes': 'error'
}

/* ── Lightbox ───────────────────────────────────────────────── */

function Lightbox({ image, onClose }) {
  const c = useAppPalette()

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <MotionBox
      role='dialog'
      aria-modal='true'
      aria-label={`${image.title} — ${image.category}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(c.black, 0.85),
        backdropFilter: 'blur(20px)',
        cursor: 'zoom-out',
        p: 3
      }}
    >
      <MotionBox
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}
      >
        <Box
          component='img'
          src={image.url}
          alt={image.title}
          sx={{
            maxWidth: '100%',
            maxHeight: '85vh',
            borderRadius: '16px',
            objectFit: 'contain',
            boxShadow: `0 32px 80px ${alpha(c.black, 0.5)}`
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -48,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <Typography sx={{ color: c.white, fontWeight: 600 }}>{image.title}</Typography>
          <Typography variant='caption' sx={{ color: alpha(c.white, 0.6) }}>{image.category}</Typography>
        </Box>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          aria-label='Close lightbox'
          size='small'
          sx={{
            position: 'absolute',
            top: -14,
            right: -14,
            width: 36,
            height: 36,
            bgcolor: alpha(c.white, 0.15),
            color: c.white,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: alpha(c.white, 0.25) }
          }}
        >
          <Icon icon='tabler:x' fontSize={18} />
        </IconButton>
      </MotionBox>
    </MotionBox>
  )
}

/* ── Gallery Card ───────────────────────────────────────────── */

function GalleryCard({ image, index, onClick }) {
  const c = useAppPalette()
  const colorKey = CATEGORY_COLORS[image.category] || 'primary'
  const color = c.theme.palette[colorKey]?.main || c.primary

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      tabIndex={0}
      role='button'
      aria-label={`View ${image.title}`}
      onClick={() => onClick(image)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(image) } }}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'zoom-in',
        breakInside: 'avoid',
        mb: 2,
        '&:hover .gallery-overlay, &:focus-visible .gallery-overlay': { opacity: 1 },
        '&:hover img, &:focus-visible img': { transform: 'scale(1.05)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
      }}
    >
      <Box
        component='img'
        src={image.url}
        alt={image.title}
        loading='lazy'
        sx={{
          width: '100%',
          display: 'block',
          borderRadius: '16px',
          transition: 'transform 0.5s ease'
        }}
      />

      {/* Hover overlay */}
      <Box
        className='gallery-overlay'
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          background: `linear-gradient(180deg, transparent 40%, ${alpha(c.black, 0.7)} 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 2.5
        }}
      >
        <Typography sx={{ color: c.white, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
          {image.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: color
            }}
          />
          <Typography variant='caption' sx={{ color: alpha(c.white, 0.7), fontWeight: 500 }}>
            {image.category}
          </Typography>
        </Box>
      </Box>
    </MotionBox>
  )
}

/* ── Main View ──────────────────────────────────────────────── */

export default function GalleryView() {
  const c = useAppPalette()
  const [activeCategory, setActiveCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef(null)

  const filteredImages =
    activeCategory === 'All' ? ALL_IMAGES : ALL_IMAGES.filter(img => img.category === activeCategory)

  const visibleImages = filteredImages.slice(0, visibleCount)
  const hasMore = visibleCount < filteredImages.length

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [activeCategory])

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    setLoading(true)
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredImages.length))
      setLoading(false)
    }, 600)
  }, [hasMore, loading, filteredImages.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha(c.primary, 0.05)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(c.primary, 0.05)} 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
            zIndex: 0
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '50vw',
            height: '50vw',
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(c.primary, 0.1)} 0%, transparent 70%)`,
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: '100px',
                background: alpha(c.primary, 0.08),
                border: `1px solid ${alpha(c.primary, 0.2)}`,
                mb: 3
              }}
            >
              <Icon icon='tabler:camera' fontSize={14} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                MOMENTS CAPTURED
              </Typography>
            </Box>

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-1.5px',
                lineHeight: 1.05,
                mb: 3,
                background: `linear-gradient(135deg, ${c.textPrimary} 0%, ${c.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Gallery
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 620,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              Relive the energy, creativity, and brilliance of Citronics through our curated
              collection of moments from past and present editions.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Category Filters ─────────────────────────────────── */}
      <Container maxWidth='lg' sx={{ mb: 5 }}>
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat
            const colorKey = CATEGORY_COLORS[cat] || 'primary'
            const color = c.theme.palette[colorKey]?.main || c.primary

            return (
              <CustomChip
                key={cat}
                label={cat}
                onClick={() => setActiveCategory(cat)}
                icon={
                  isActive
                    ? <Icon icon='tabler:circle-check-filled' fontSize={16} style={{ color }} />
                    : undefined
                }
                sx={{
                  px: 1,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '100px',
                  border: `1px solid ${isActive ? alpha(color, 0.4) : alpha(c.textDisabled, 0.2)}`,
                  bgcolor: isActive ? alpha(color, 0.1) : 'transparent',
                  color: isActive ? color : c.textSecondary,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: alpha(color, 0.08),
                    borderColor: alpha(color, 0.3)
                  }
                }}
              />
            )
          })}
        </MotionBox>
      </Container>

      {/* ── Masonry Gallery Grid ─────────────────────────────── */}
      <Container maxWidth='lg' sx={{ pb: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            columnCount: { xs: 1, sm: 2, md: 3 },
            columnGap: 2
          }}
        >
          <AnimatePresence mode='popLayout'>
            {visibleImages.map((img, i) => (
              <GalleryCard key={img.id} image={img} index={i} onClick={setLightboxImage} />
            ))}
          </AnimatePresence>
        </Box>

        {/* Infinite scroll sentinel + loader */}
        {hasMore && (
          <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            {loading && <CircularProgress size={32} sx={{ color: c.primary }} />}
          </Box>
        )}

        {/* Empty state */}
        {visibleImages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Icon icon='tabler:photo-off' fontSize={48} style={{ color: c.textDisabled }} />
            <Typography sx={{ color: c.textSecondary, mt: 2 }}>
              No images in this category yet.
            </Typography>
          </Box>
        )}

        {/* End of gallery */}
        {!hasMore && visibleImages.length > 0 && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{ textAlign: 'center', py: 4 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1,
                borderRadius: '100px',
                bgcolor: alpha(c.textDisabled, 0.06),
                border: `1px solid ${alpha(c.textDisabled, 0.1)}`
              }}
            >
              <Icon icon='tabler:checks' fontSize={16} style={{ color: c.textDisabled }} />
              <Typography variant='body2' sx={{ color: c.textDisabled, fontWeight: 500 }}>
                You've seen all {filteredImages.length} photos
              </Typography>
            </Box>
          </MotionBox>
        )}
      </Container>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />}
      </AnimatePresence>
    </>
  )
}