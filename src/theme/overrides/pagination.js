// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const Pagination = () => {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected:not(.Mui-disabled):not(.MuiPaginationItem-textPrimary):not(.MuiPaginationItem-textSecondary):hover':
            {
              backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.12)`
            }
        }),
        outlined: ({ theme }) => ({
          borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.2)`
        }),
        outlinedPrimary: ({ theme }) => ({
          '&.Mui-selected': {
            backgroundColor: hexToRGBA(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.2)} !important`
            }
          }
        }),
        outlinedSecondary: ({ theme }) => ({
          '&.Mui-selected': {
            backgroundColor: hexToRGBA(theme.palette.secondary.main, 0.12),
            '&:hover': {
              backgroundColor: `${hexToRGBA(theme.palette.secondary.main, 0.2)} !important`
            }
          }
        })
      }
    }
  }
}

export default Pagination
