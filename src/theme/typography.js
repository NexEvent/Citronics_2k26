/**
 * Typography Configuration
 */
/** Shared font stacks — importable by any component that needs them. */
export const fontFamilyBody = [
  'Inter',
  'Public Sans',
  'sans-serif',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"'
].join(',')

export const fontFamilyHeading = [
  '"Plus Jakarta Sans"',
  '"Space Grotesk"',
  'Inter',
  'sans-serif'
].join(',')

const typography = {
  fontFamily: fontFamilyBody,
  h1: {
    fontFamily: fontFamilyHeading,
    fontWeight: 700,
    fontSize: '2.375rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontFamily: fontFamilyHeading,
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.4
  },
  h4: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4
  },
  h5: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.5
  },
  h6: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43
  },
  button: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    lineHeight: 1.71,
    textTransform: 'none'
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 2.66,
    textTransform: 'uppercase'
  }
}

export default typography
