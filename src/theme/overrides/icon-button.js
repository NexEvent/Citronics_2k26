const IconButton = () => {
  return {
    MuiIconButton: {
      variants: [
        {
          props: { color: 'primary' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.primary.mainChannel} / 0.08)`
            }
          })
        },
        {
          props: { color: 'secondary' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.secondary.mainChannel} / 0.08)`
            }
          })
        },
        {
          props: { color: 'success' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.success.mainChannel} / 0.08)`
            }
          })
        },
        {
          props: { color: 'error' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.error.mainChannel} / 0.08)`
            }
          })
        },
        {
          props: { color: 'warning' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.warning.mainChannel} / 0.08)`
            }
          })
        },
        {
          props: { color: 'info' },
          style: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.info.mainChannel} / 0.08)`
            }
          })
        }
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.08)`
          }
        })
      }
    }
  }
}

export default IconButton
