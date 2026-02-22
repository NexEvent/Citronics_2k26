const Autocomplete = skin => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({
          ...(skin === 'bordered' && { boxShadow: 'none', border: `1px solid ${theme.palette.divider}` })
        }),
        listbox: ({ theme }) => ({
          padding: theme.spacing(1.25, 0),
          '& .MuiAutocomplete-option': {
            padding: theme.spacing(2, 4),
            margin: theme.spacing(0, 2, 1),
            borderRadius: theme.shape.borderRadius,
            '&:last-child': {
              marginBottom: 0
            },
            '&[aria-selected="true"]': {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.main,
              '&.Mui-focused, &.Mui-focusVisible': {
                backgroundColor: theme.palette.primary.dark
              }
            }
          },
          '& .MuiAutocomplete-option.Mui-focusVisible:not([aria-selected="true"])': {
            backgroundColor: theme.palette.action.hover
          }
        })
      }
    }
  }
}

export default Autocomplete
