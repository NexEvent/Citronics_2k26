import { deepmerge } from '@mui/utils'
import palette from 'src/components/palette'
import typography from './typography'
import breakpoints from './breakpoints'
import Overrides from './overrides'

/**
 * Themed background colors — lightest tint that matches each primary preset.
 * Light mode gets a subtle warm tint; dark mode gets a deep-hued shade.
 */
const THEME_BACKGROUNDS = {
  primary: { light: '#F4F3FE', dark: '#2B2C40' },
  info:    { light: '#EDFBFD', dark: '#1E3A40' },
  success: { light: '#EEFBF3', dark: '#1E3A2B' },
  error:   { light: '#FEF2F2', dark: '#3A1E1E' },
  warning: { light: '#FFF8F0', dark: '#3A301E' }
}

/**
 * Theme Options
 * Generates theme configuration based on settings
 */
const themeOptions = (settings, overrideMode) => {
  const { mode, themeColor = 'primary', skin = 'default', fontSize = 14 } = settings

  const themeMode = mode === 'semi-dark' ? overrideMode : mode

  // Resolve the background tint for the chosen color
  const bgPreset = THEME_BACKGROUNDS[themeColor] || THEME_BACKGROUNDS.primary
  const themedBg = themeMode === 'dark' ? bgPreset.dark : bgPreset.light

  const mergedConfig = {
    breakpoints: breakpoints(),
    palette: palette(themeMode),
    typography: { ...typography, fontSize },
    shape: {
      borderRadius: 8
    },
    mixins: {
      toolbar: {
        minHeight: 64
      }
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.08)',
      '0px 6px 12px rgba(0, 0, 0, 0.1)',
      '0px 8px 16px rgba(0, 0, 0, 0.12)',
      '0px 10px 20px rgba(0, 0, 0, 0.14)',
      '0px 12px 24px rgba(0, 0, 0, 0.16)',
      '0px 14px 28px rgba(0, 0, 0, 0.18)',
      '0px 16px 32px rgba(0, 0, 0, 0.2)',
      '0px 18px 36px rgba(0, 0, 0, 0.22)',
      '0px 20px 40px rgba(0, 0, 0, 0.24)',
      '0px 22px 44px rgba(0, 0, 0, 0.26)',
      '0px 24px 48px rgba(0, 0, 0, 0.28)',
      '0px 26px 52px rgba(0, 0, 0, 0.3)',
      '0px 28px 56px rgba(0, 0, 0, 0.32)',
      '0px 30px 60px rgba(0, 0, 0, 0.34)',
      '0px 32px 64px rgba(0, 0, 0, 0.36)',
      '0px 34px 68px rgba(0, 0, 0, 0.38)',
      '0px 36px 72px rgba(0, 0, 0, 0.4)',
      '0px 38px 76px rgba(0, 0, 0, 0.42)',
      '0px 40px 80px rgba(0, 0, 0, 0.44)',
      '0px 42px 84px rgba(0, 0, 0, 0.46)',
      '0px 44px 88px rgba(0, 0, 0, 0.48)',
      '0px 46px 92px rgba(0, 0, 0, 0.5)',
      '0px 48px 96px rgba(0, 0, 0, 0.52)'
    ],
    components: Overrides({ skin })
  }

  return deepmerge(mergedConfig, {
    palette: {
      primary: {
        ...(mergedConfig.palette[themeColor] || mergedConfig.palette.primary)
      },
    }
  })
}

export default themeOptions
