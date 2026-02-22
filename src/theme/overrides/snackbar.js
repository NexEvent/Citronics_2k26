const Snackbar = skin => {
  return {
    MuiSnackbarContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: theme.spacing(1.75, 4),
          ...(skin === 'bordered' && { boxShadow: 'none' }),
          backgroundColor: `rgb(${theme.palette.customColors.mainRgb})`,
          '& .MuiSnackbarContent-message': {
            lineHeight: 1.429
          }
        })
      }
    }
  }
}

export default Snackbar
