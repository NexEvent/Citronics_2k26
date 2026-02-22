const Typography = () => {
  return {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: ({ theme }) => ({
          marginBottom: theme.spacing(2)
        })
      }
    }
  }
}

export default Typography
