// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const ToggleButton = () => {
  return {
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius
        })
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.12)`,
          '&:hover': {
            backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.04)`
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: theme.palette.primary.main,
            backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08)
          },
          '&.Mui-disabled': {
            color: `rgba(${theme.palette.customColors.mainRgb}, 0.4)`,
            borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.12)`
          },
          '&.MuiToggleButtonGroup-grouped': {
            margin: 0,
            '&:not(:first-of-type), &:not(:last-of-type)': {
              borderRadius: 0,
              borderLeft: 0
            },
            '&:first-of-type': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            },
            '&:last-of-type': {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderLeft: 0
            }
          }
        }),
        sizeSmall: ({ theme }) => ({
          padding: theme.spacing(1.5, 2.75)
        }),
        sizeMedium: ({ theme }) => ({
          padding: theme.spacing(2, 4)
        }),
        sizeLarge: ({ theme }) => ({
          padding: theme.spacing(2.75, 5)
        })
      }
    }
  }
}

export default ToggleButton
