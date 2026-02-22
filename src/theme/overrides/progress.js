const Progress = () => {
  return {
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 12,
          borderRadius: '10px',
          backgroundColor: theme.palette.customColors.trackBg
        }),
        bar: {
          borderRadius: '10px'
        }
      }
    }
  }
}

export default Progress
