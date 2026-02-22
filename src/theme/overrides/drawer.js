const Drawer = skin => {
  return {
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow: theme.shadows[skin === 'bordered' ? 0 : 7],
          ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
        })
      }
    }
  }
}

export default Drawer
