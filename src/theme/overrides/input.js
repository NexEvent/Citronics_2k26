const input = () => {
  return {
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -8px) scale(0.75)'
          }
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.2)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.28)`
          },
          '&.Mui-disabled:before': {
            borderBottomStyle: 'solid'
          }
        })
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:not(.MuiInputBase-sizeSmall)': {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          },
          backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.04)`,
          '&:hover:not(.Mui-disabled)': {
            backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.08)`
          },
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.2)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.28)`
          }
        })
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:not(.MuiInputBase-sizeSmall)': {
            borderRadius: 8
          },
          '&:hover:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.28)`
          },
          '&:hover.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.2)`
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.disabled
          },
          '&.Mui-focused': {
            boxShadow: theme.shadows[2]
          }
        })
      }
    },

    // Radio, Checkbox & Switch
    MuiFormControlLabel: {
      styleOverrides: {
        label: ({ theme }) => ({
          color: theme.palette.text.secondary
        })
      }
    }
  }
}

export default input
