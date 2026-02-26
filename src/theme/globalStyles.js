/**
 * Global Styles
 */
const GlobalStyling = theme => ({
  '*': {
    boxSizing: 'border-box'
  },
  html: {
    scrollBehavior: 'smooth'
  },
  body: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
  },
  'a, a:hover': {
    textDecoration: 'none'
  },
  '.ps__rail-y, .ps__rail-x': {
    zIndex: 1,
    '&:hover, &:focus, &.ps--clicking': {
      backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[800]
    }
  },
  '.ps__thumb-y, .ps__thumb-x': {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[700]
  },
  '#nprogress': {
    pointerEvents: 'none',
    '& .bar': {
      left: 0,
      top: 0,
      height: 3,
      width: '100%',
      position: 'fixed',
      zIndex: theme.zIndex.drawer + 2,
      backgroundColor: theme.palette.primary.main
    }
  }
})

export default GlobalStyling
