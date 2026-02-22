/**
 * Color Palette Configuration
 * Light and dark mode color schemes
 */
const palette = (mode) => {
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
      paper: '#2F3349',
      default: '#25293C'
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
