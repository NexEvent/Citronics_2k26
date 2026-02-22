const ButtonGroup = () => {
  return {
    MuiButtonGroup: {
      styleOverrides: {
        contained: ({ theme }) => ({
          boxShadow: 'none',
          '& .MuiButton-contained': {
            boxShadow: 'none',
            paddingLeft: theme.spacing(5),
            paddingRight: theme.spacing(5)
          }
        })
      }
    }
  }
}

export default ButtonGroup
