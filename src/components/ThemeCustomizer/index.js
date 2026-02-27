import { useState, useCallback, useEffect } from 'react'

// MUI
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Fade from '@mui/material/Fade'
import Slider from '@mui/material/Slider'
import { styled, alpha } from '@mui/material/styles'

// Icons
import {
  IconSettings,
  IconX,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconLayoutAlignCenter,
  IconLayoutAlignLeft,
  IconEye,
  IconEyeOff,
  IconDroplet,
  IconDropletOff,
  IconSun,
  IconMoon,
  IconTextSize,
  IconRefresh,
  IconToggleRight,
  IconToggleLeft
} from '@tabler/icons-react'

// Hooks
import { useSettings } from 'src/hooks/useSettings'
import { useAppPalette } from 'src/components/palette'
import themeConfig from 'src/configs/themeConfig'

// ── Color Presets ──────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'primary', label: 'Violet', color: '#7367F0' },
  { name: 'info',    label: 'Cyan',   color: '#00CFE8' },
  { name: 'success', label: 'Green',  color: '#28C76F' },
  { name: 'error',   label: 'Rose',   color: '#EA5455' },
  { name: 'warning', label: 'Amber',  color: '#FF9F43' }
]

// ── Font size presets ──────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: 'S', value: 13 },
  { label: 'M', value: 14 },
  { label: 'L', value: 15 },
  { label: 'XL', value: 16 }
]

// ── Styled Components ──────────────────────────────────────────────────────────

const TriggerButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: theme.zIndex.drawer - 1,
  width: 44,
  height: 44,
  borderRadius: '8px 0 0 8px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: `-4px 0 16px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    width: 52,
    boxShadow: `-6px 0 24px ${alpha(theme.palette.primary.main, 0.55)}`
  }
}))

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2.5, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
  color: theme.palette.primary.contrastText
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.675rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.palette.text.disabled,
  marginBottom: theme.spacing(1)
}))

const ColorSwatch = styled(Box, {
  shouldForwardProp: prop => prop !== 'active' && prop !== 'swatchColor'
})(({ theme, active, swatchColor }) => ({
  width: '100%',
  aspectRatio: '1',
  borderRadius: '12px',
  backgroundColor: swatchColor,
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  border: active ? `2.5px solid ${theme.palette.background.paper}` : '2.5px solid transparent',
  outline: active ? `2.5px solid ${swatchColor}` : 'none',
  boxShadow: active
    ? `0 4px 14px ${alpha(swatchColor, 0.5)}`
    : `0 2px 8px ${alpha(swatchColor, 0.15)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${alpha(swatchColor, 0.4)}`
  },
  '&::after': active
    ? { content: '"✓"', color: theme.palette.primary.contrastText, fontSize: '1rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }
    : {}
}))

const OptionRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0.875, 1),
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  }
}))

const OptionLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& svg': {
    width: 18,
    height: 18,
    color: theme.palette.text.secondary,
    flexShrink: 0
  }
}))

const FontSizeChip = styled(Box, {
  shouldForwardProp: prop => prop !== 'active'
})(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 32,
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 600,
  transition: 'all 0.2s',
  backgroundColor: active ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.04),
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  border: `1px solid ${active ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  }
}))

// ── Component ──────────────────────────────────────────────────────────────────

const ThemeCustomizer = () => {
  const c = useAppPalette()
  const { settings, saveSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFS = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFS)

    return () => document.removeEventListener('fullscreenchange', onFS)
  }, [])

  const handleToggle = useCallback(() => setOpen(p => !p), [])
  const handleClose = useCallback(() => setOpen(false), [])

  const handleColorChange = useCallback(
    preset => saveSettings({ ...settings, themeColor: preset.name }),
    [settings, saveSettings]
  )

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  const handleContentWidth = useCallback(
    () => saveSettings({ ...settings, contentWidth: settings.contentWidth === 'full' ? 'boxed' : 'full' }),
    [settings, saveSettings]
  )

  const handleAppBarBlur = useCallback(
    () => saveSettings({ ...settings, appBarBlur: !settings.appBarBlur }),
    [settings, saveSettings]
  )

  const handleAppBar = useCallback(
    () => saveSettings({ ...settings, appBar: settings.appBar === 'hidden' ? 'fixed' : 'hidden' }),
    [settings, saveSettings]
  )

  const handleModeToggle = useCallback(
    () => saveSettings({ ...settings, mode: settings.mode === 'dark' ? 'light' : 'dark' }),
    [settings, saveSettings]
  )

  const handleFontSize = useCallback(
    (size) => saveSettings({ ...settings, fontSize: size }),
    [settings, saveSettings]
  )

  const handleResetAll = useCallback(() => {
    saveSettings({
      mode: themeConfig.mode || 'light',
      themeColor: 'primary',
      contentWidth: themeConfig.contentWidth || 'full',
      appBar: themeConfig.appBar || 'fixed',
      appBarBlur: themeConfig.appBarBlur ?? true,
      fontSize: 14,
      direction: 'ltr'
    })
  }, [saveSettings])

  const isDark = c.isDark
  const activePreset = COLOR_PRESETS.find(p => p.name === (settings.themeColor || 'primary')) || COLOR_PRESETS[0]
  const currentFontSize = settings.fontSize || 14

  return (
    <>
      {/* Floating Trigger */}
      <Fade in={!open}>
        <TriggerButton onClick={handleToggle} aria-label='Open theme customizer'>
          <IconSettings size={22} />
        </TriggerButton>
      </Fade>

      {/* Drawer — temporary so it closes on click outside */}
      <Drawer
        anchor='right'
        open={open}
        onClose={handleClose}
        variant='temporary'
        aria-label='Theme customizer'
        PaperProps={{
          sx: {
            width: 300,
            borderLeft: `1px solid ${c.divider}`,
            boxShadow: `-8px 0 32px ${c.blackA8}`,
            backgroundImage: 'none'
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        {/* Header */}
        <DrawerHeader>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'inherit' }}>
              Customizer
            </Typography>
            <Typography variant='caption' sx={{ color: c.whiteA65, fontSize: '0.65rem' }}>
              Personalize your experience
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size='small' aria-label='Close customizer' sx={{ color: c.whiteA80, '&:hover': { color: c.white } }}>
            <IconX size={18} />
          </IconButton>
        </DrawerHeader>

        {/* Content */}
        <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>

          {/* ── Mode ── */}
          <SectionTitle>Mode</SectionTitle>
          <OptionRow role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleModeToggle()} onClick={handleModeToggle} sx={{ mb: 1.5 }}>
            <OptionLabel>
              {isDark ? <IconMoon /> : <IconSun />}
              <Typography variant='body2'>{isDark ? 'Dark Mode' : 'Light Mode'}</Typography>
            </OptionLabel>
            {isDark
              ? <IconToggleRight size={28} color={c.primary} />
              : <IconToggleLeft size={28} color={c.textDisabled} />
            }
          </OptionRow>

          <Divider sx={{ mb: 2 }} />

          {/* ── Primary Color ── */}
          <SectionTitle>Primary Color</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5, mb: 0.5 }}>
            {COLOR_PRESETS.map(preset => (
              <Tooltip key={preset.name} title={preset.label} arrow placement='top'>
                <ColorSwatch
                  swatchColor={preset.color}
                  active={activePreset.name === preset.name}
                  onClick={() => handleColorChange(preset)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleColorChange(preset)}
                  aria-label={`Select ${preset.label} color`}
                />
              </Tooltip>
            ))}
          </Box>
          <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mb: 2, mt: 0.5 }}>
            {activePreset.label} — {activePreset.color}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* ── Font Size ── */}
          <SectionTitle>Font Size</SectionTitle>
          <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
            {FONT_SIZES.map(fs => (
              <Tooltip key={fs.value} title={`${fs.value}px`} arrow placement='top'>
                <FontSizeChip
                  active={currentFontSize === fs.value}
                  onClick={() => handleFontSize(fs.value)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleFontSize(fs.value)}
                  aria-label={`Set font size to ${fs.value}px`}
                >
                  {fs.label}
                </FontSizeChip>
              </Tooltip>
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ── Layout Options ── */}
          <SectionTitle>Layout</SectionTitle>

          <OptionRow role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleContentWidth()} onClick={handleContentWidth}>
            <OptionLabel>
              {settings.contentWidth === 'boxed' ? <IconLayoutAlignCenter /> : <IconLayoutAlignLeft />}
              <Typography variant='body2'>Boxed Layout</Typography>
            </OptionLabel>
            {settings.contentWidth === 'boxed'
              ? <IconToggleRight size={28} color={c.primary} />
              : <IconToggleLeft size={28} color={c.textDisabled} />
            }
          </OptionRow>

          <OptionRow role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleFullscreen()} onClick={handleFullscreen}>
            <OptionLabel>
              {isFullscreen ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
              <Typography variant='body2'>Fullscreen</Typography>
            </OptionLabel>
            {isFullscreen
              ? <IconToggleRight size={28} color={c.primary} />
              : <IconToggleLeft size={28} color={c.textDisabled} />
            }
          </OptionRow>

          <Divider sx={{ my: 2 }} />

          {/* ── Navbar Options ── */}
          <SectionTitle>Navbar</SectionTitle>

          <OptionRow role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleAppBar()} onClick={handleAppBar}>
            <OptionLabel>
              {settings.appBar !== 'hidden' ? <IconEye /> : <IconEyeOff />}
              <Typography variant='body2'>Show Navbar</Typography>
            </OptionLabel>
            {settings.appBar !== 'hidden'
              ? <IconToggleRight size={28} color={c.primary} />
              : <IconToggleLeft size={28} color={c.textDisabled} />
            }
          </OptionRow>

          <OptionRow role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleAppBarBlur()} onClick={handleAppBarBlur}>
            <OptionLabel>
              {settings.appBarBlur !== false ? <IconDroplet /> : <IconDropletOff />}
              <Typography variant='body2'>Glassmorphism</Typography>
            </OptionLabel>
            {settings.appBarBlur !== false
              ? <IconToggleRight size={28} color={c.primary} />
              : <IconToggleLeft size={28} color={c.textDisabled} />
            }
          </OptionRow>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: `1px solid ${c.divider}` }}>
          <Box
            onClick={handleResetAll}
            role='button'
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleResetAll()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1,
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'text.secondary',
              border: `1px solid ${c.dividerA50}`,
              transition: 'all 0.2s',
              '&:hover': {
                color: 'error.main',
                borderColor: c.errorA30,
                bgcolor: c.errorA4
              }
            }}
          >
            <IconRefresh size={16} />
            <Typography variant='body2' fontWeight={500}>Reset to Defaults</Typography>
          </Box>
          <Typography variant='caption' color='text.disabled' sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Saved automatically
          </Typography>
        </Box>
      </Drawer>
    </>
  )
}

export { COLOR_PRESETS }

export default ThemeCustomizer
