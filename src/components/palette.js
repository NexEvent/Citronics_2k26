/**
 * Centralized Color Palette
 *
 * Single source of truth for every color token used across the app.
 * Import `useAppPalette` in any component to get theme-aware colors.
 *
 * Usage:
 *   import { useAppPalette } from 'src/components/palette'
 *   const c = useAppPalette()
 *   <Box sx={{ color: c.textPrimary, bgcolor: c.bgPaper }} />
 */

import { alpha, useTheme } from '@mui/material/styles'

/* ═══════════════════════════════════════════════════════════════════════════
   Glass-morphism tokens  (Navbar / overlays — always dark-on-glass)
   ═══════════════════════════════════════════════════════════════════════════ */
export const glass = {
  bg: 'rgba(31, 31, 31, 0.25)',
  bgSolid: 'rgba(18, 18, 18, 0.92)',
  bgMobile: 'rgba(18, 18, 18, 0.95)',
  bgMobileLogin: 'rgba(31, 31, 31, 0.6)',
  backdrop: 'blur(20px) saturate(180%)',

  // Text on glass
  textBright: 'rgba(250, 250, 250, 0.98)',
  textDefault: 'rgba(244, 239, 239, 0.99)',
  textMuted: 'rgba(200, 200, 200, 0.75)',
  textMutedAlt: 'rgba(200, 200, 200, 0.8)',
  textSubtle: 'rgba(200, 200, 200, 0.6)',
  textDimmer: 'rgba(200, 200, 200, 0.7)',
  textNav: 'rgba(246, 241, 241, 0.75)',

  // Dot / decorative
  dot: 'rgba(220, 220, 220, 0.85)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  badgeBg: 'rgba(230, 230, 230, 0.55)',

  // Logo button (light pill)
  btnText: '#111',
  btnGradient: 'linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%)',
  btnGradientHover: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
  btnGlow: 'rgba(220, 220, 220, 0.35)',
  btnGlowHover: 'rgba(220, 220, 220, 0.55)',

  // Shadow on glass
  textShadow: 'rgba(0, 0, 0, 0.3)'
}

/* ═══════════════════════════════════════════════════════════════════════════
   Theme-aware color hook
   ═══════════════════════════════════════════════════════════════════════════ */
export function useAppPalette() {
  const theme = useTheme()
  const p = theme.palette
  const isDark = p.mode === 'dark'

  return {
    // ── Reference to theme for advanced usage ───────────────────────────
    theme,
    isDark,

    // ── Brand / semantic colors ─────────────────────────────────────────
    primary: p.primary.main,
    primaryLight: p.primary.light,
    primaryDark: p.primary.dark,
    primaryContrast: p.primary.contrastText,

    secondary: p.secondary.main,
    info: p.info.main,
    success: p.success.main,
    warning: p.warning.main,
    error: p.error.main,

    white: p.common.white,
    black: p.common.black,

    // ── Text ────────────────────────────────────────────────────────────
    textPrimary: p.text.primary,
    textSecondary: p.text.secondary,
    textDisabled: p.text.disabled,

    // ── Surfaces ────────────────────────────────────────────────────────
    bgDefault: p.background.default,
    bgPaper: p.background.paper,
    divider: p.divider,

    // ── Grey scale ──────────────────────────────────────────────────────
    grey: p.grey,

    // ── Custom colors from theme ────────────────────────────────────────
    customColors: p.customColors,

    // ── Primary alpha variants ──────────────────────────────────────────
    primaryA3: alpha(p.primary.main, 0.03),
    primaryA4: alpha(p.primary.main, 0.04),
    primaryA8: alpha(p.primary.main, 0.08),
    primaryA10: alpha(p.primary.main, 0.1),
    primaryA12: alpha(p.primary.main, 0.12),
    primaryA15: alpha(p.primary.main, 0.15),
    primaryA20: alpha(p.primary.main, 0.2),
    primaryA30: alpha(p.primary.main, 0.3),
    primaryA35: alpha(p.primary.main, 0.35),
    primaryA40: alpha(p.primary.main, 0.4),
    primaryA50: alpha(p.primary.main, 0.5),
    primaryA55: alpha(p.primary.main, 0.55),
    primaryA60: alpha(p.primary.main, 0.6),
    primaryA70: alpha(p.primary.main, 0.7),
    primaryA80: alpha(p.primary.main, 0.8),
    primaryA85: alpha(p.primary.main, 0.85),

    primaryDarkA90: alpha(p.primary.dark, 0.9),

    // ── Info alpha variants ─────────────────────────────────────────────
    infoA8: alpha(p.info.main, 0.08),
    infoA10: alpha(p.info.main, 0.1),
    infoA15: alpha(p.info.main, 0.15),

    // ── Error alpha variants ────────────────────────────────────────────
    errorA4: alpha(p.error.main, 0.04),
    errorA10: alpha(p.error.main, 0.1),
    errorA15: alpha(p.error.main, 0.15),
    errorA20: alpha(p.error.main, 0.2),
    errorA30: alpha(p.error.main, 0.3),

    // ── Warning alpha variants ──────────────────────────────────────────
    warningA8: alpha(p.warning.main, 0.08),
    warningA15: alpha(p.warning.main, 0.15),

    // ── Divider alpha variants ──────────────────────────────────────────
    dividerA10: alpha(p.divider, 0.1),
    dividerA30: alpha(p.divider, 0.3),
    dividerA40: alpha(p.divider, 0.4),
    dividerA50: alpha(p.divider, 0.5),
    dividerA60: alpha(p.divider, 0.6),

    // ── Background alpha variants ───────────────────────────────────────
    bgPaperA12: alpha(p.background.paper, 0.12),
    bgPaperA40: alpha(p.background.paper, 0.4),
    bgPaperA50: alpha(p.background.paper, 0.5),
    bgPaperA60: alpha(p.background.paper, 0.6),
    bgPaperA70: alpha(p.background.paper, 0.7),
    bgPaperA80: alpha(p.background.paper, 0.8),

    bgDefaultA40: alpha(p.background.default, 0.4),
    bgDefaultA60: alpha(p.background.default, 0.6),
    bgDefaultA85: alpha(p.background.default, 0.85),
    bgDefaultA90: alpha(p.background.default, 0.9),
    bgDefaultA92: alpha(p.background.default, 0.92),

    // ── Common alpha variants ───────────────────────────────────────────
    whiteA6: alpha(p.common.white, 0.06),
    whiteA8: alpha(p.common.white, 0.08),
    whiteA10: alpha(p.common.white, 0.1),
    whiteA15: alpha(p.common.white, 0.15),
    whiteA20: alpha(p.common.white, 0.2),
    whiteA25: alpha(p.common.white, 0.25),
    whiteA40: alpha(p.common.white, 0.4),
    whiteA65: alpha(p.common.white, 0.65),
    whiteA80: alpha(p.common.white, 0.8),

    blackA8: alpha(p.common.black, 0.08),
    blackA50: alpha(p.common.black, 0.5),

    // ── Text alpha variants ─────────────────────────────────────────────
    textPrimaryA4: alpha(p.text.primary, 0.04),
    textPrimaryA25: alpha(p.text.primary, 0.25),
    textPrimaryA50: alpha(p.text.primary, 0.5),
    textPrimaryA55: alpha(p.text.primary, 0.55),

    textSecondaryA60: alpha(p.text.secondary, 0.6),
    textSecondaryA70: alpha(p.text.secondary, 0.7),

    textDisabledA12: alpha(p.text.disabled, 0.12),

    // ── Gradient helpers ────────────────────────────────────────────────
    gradientPrimary: `linear-gradient(135deg, ${p.primary.main}, ${p.info.main})`,
    gradientTriple: `linear-gradient(135deg, ${p.primary.main} 0%, ${p.info.main} 50%, ${p.secondary.main} 100%)`,
    gradientPrimaryDark: `linear-gradient(135deg, ${p.primary.main} 0%, ${alpha(p.primary.dark, 0.9)} 100%)`,

    // ── Hero-specific helpers ───────────────────────────────────────────
    heroText: isDark ? p.common.white : p.text.primary,
    heroOverlayEnd: isDark ? alpha(p.background.default, 0.85) : alpha(p.background.default, 0.6),
    heroImageBg: isDark ? alpha(p.background.paper, 0.8) : alpha(p.grey[300], 0.5),

    // ── Scrollbar colors ────────────────────────────────────────────────
    scrollTrack: isDark ? p.grey[800] : p.grey[300],
    scrollThumb: isDark ? p.grey[700] : p.grey[400],

    // ── Color presets (for ThemeCustomizer) ──────────────────────────────
    presets: [
      { name: 'primary', label: 'Violet', color: p.primary.main },
      { name: 'info',    label: 'Cyan',   color: p.info.main },
      { name: 'success', label: 'Green',  color: p.success.main },
      { name: 'error',   label: 'Rose',   color: p.error.main },
      { name: 'warning', label: 'Amber',  color: p.warning.main }
    ]
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MUI Theme Palette Configuration
   Generates the raw light / dark palette passed to createTheme().
   Previously lived in src/theme/palette.js — merged here as single source.
   ═══════════════════════════════════════════════════════════════════════════ */
const palette = mode => {
  const lightPalette = {
    mode: 'light',
    primary: {
      light: '#8479F2',
      main: '#7367F0',
      dark: '#655BD3',
      contrastText: '#FFF'
    },
    secondary: {
      light: '#B0B4BB',
      main: '#A8AAAE',
      dark: '#949699',
      contrastText: '#FFF'
    },
    success: {
      light: '#42CE80',
      main: '#28C76F',
      dark: '#23AF62',
      contrastText: '#FFF'
    },
    error: {
      light: '#F06C6C',
      main: '#EA5455',
      dark: '#CE4A4B',
      contrastText: '#FFF'
    },
    warning: {
      light: '#FFAB5A',
      main: '#FF9F43',
      dark: '#E08C3B',
      contrastText: '#FFF'
    },
    info: {
      light: '#1FD5EB',
      main: '#00CFE8',
      dark: '#00B6CC',
      contrastText: '#FFF'
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: '#4B465C',
      secondary: '#6E6B78',
      disabled: '#ADADB0'
    },
    divider: 'rgba(75, 70, 92, 0.12)',
    background: {
      paper: '#FFFFFF',
      default: '#F8F7FA'
    },
    action: {
      active: 'rgba(75, 70, 92, 0.54)',
      hover: 'rgba(75, 70, 92, 0.04)',
      selected: 'rgba(75, 70, 92, 0.08)',
      disabled: 'rgba(75, 70, 92, 0.26)',
      disabledBackground: 'rgba(75, 70, 92, 0.12)',
      focus: 'rgba(75, 70, 92, 0.12)'
    },
    customColors: {
      dark: '#4B4B4B',
      main: '#4B465C',
      light: '#A5A3AE',
      mainRgb: '75, 70, 92',
      tableHeaderBg: '#F6F6F7',
      avatarBg: '#DBDADE',
      tooltipBg: '#4A4458',
      trackBg: '#E7E7E8'
    }
  }

  const darkPalette = {
    mode: 'dark',
    primary: {
      light: '#8479F2',
      main: '#7367F0',
      dark: '#655BD3',
      contrastText: '#FFF'
    },
    secondary: {
      light: '#7C7F84',
      main: '#6D6F74',
      dark: '#606266',
      contrastText: '#FFF'
    },
    success: {
      light: '#42CE80',
      main: '#28C76F',
      dark: '#23AF62',
      contrastText: '#FFF'
    },
    error: {
      light: '#F06C6C',
      main: '#EA5455',
      dark: '#CE4A4B',
      contrastText: '#FFF'
    },
    warning: {
      light: '#FFAB5A',
      main: '#FF9F43',
      dark: '#E08C3B',
      contrastText: '#FFF'
    },
    info: {
      light: '#1FD5EB',
      main: '#00CFE8',
      dark: '#00B6CC',
      contrastText: '#FFF'
    },
    grey: {
      50: '#2F3349',
      100: '#363A51',
      200: '#3D4158',
      300: '#44485F',
      400: '#4B4F66',
      500: '#52566D',
      600: '#595D74',
      700: '#60647B',
      800: '#676B82',
      900: '#6E7289',
      A100: '#363A51',
      A200: '#3D4158',
      A400: '#4B4F66',
      A700: '#60647B'
    },
    text: {
      primary: '#DBDADE',
      secondary: '#B6B5C0',
      disabled: '#6D6D77'
    },
    divider: 'rgba(219, 218, 222, 0.12)',
    background: {
      paper: '#080808',
      default: '#0c0c0c'
    },
    action: {
      active: 'rgba(219, 218, 222, 0.54)',
      hover: 'rgba(219, 218, 222, 0.04)',
      selected: 'rgba(219, 218, 222, 0.08)',
      disabled: 'rgba(219, 218, 222, 0.26)',
      disabledBackground: 'rgba(219, 218, 222, 0.12)',
      focus: 'rgba(219, 218, 222, 0.12)'
    },
    customColors: {
      dark: '#E7E3FC',
      main: '#DBDADE',
      light: '#7A7A86',
      mainRgb: '219, 218, 222',
      tableHeaderBg: '#3A3E56',
      avatarBg: '#4A5072',
      tooltipBg: '#464A65',
      trackBg: '#474B65'
    }
  }

  return mode === 'dark' ? darkPalette : lightPalette
}

export default palette
