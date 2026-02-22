// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const FabButton = () => {
  return {
    MuiFab: {
      styleOverrides: {
        default: ({ theme }) => ({
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.08)`
          }
        }),
        primary: ({ theme }) => ({
          boxShadow: theme.shadows[3],
          '&:hover': {
            backgroundColor: theme.palette.primary.dark
          }
        }),
        secondary: ({ theme }) => ({
          boxShadow: theme.shadows[3],
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark
          }
        }),
        extended: ({ theme }) => ({
          '& svg, & i': {
            marginRight: theme.spacing(1)
          }
        }),
        sizeSmall: ({ theme }) => ({
          width: 34,
          height: 34,
          padding: theme.spacing(1.75)
        }),
        sizeMedium: ({ theme }) => ({
          width: 40,
          height: 40,
          padding: theme.spacing(2)
        }),
        sizeLarge: ({ theme }) => ({
          width: 48,
          height: 48,
          padding: theme.spacing(2.5)
        })
      }
    }
  }
}

export default FabButton
