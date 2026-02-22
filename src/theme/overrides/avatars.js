const Avatar = () => {
  return {
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: theme.typography.body1.fontSize
        }),
        colorDefault: ({ theme }) => ({
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.customColors.avatarBg
        })
      }
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.pull-up': {
            '& .MuiAvatar-root': {
              cursor: 'pointer',
              transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              '&:hover': {
                zIndex: 2,
                boxShadow: theme.shadows[3],
                transform: 'translateY(-4px)'
              }
            }
          },
          justifyContent: 'flex-end',
          '.MuiCard-root & .MuiAvatar-root': {
            borderColor: theme.palette.background.paper
          }
        })
      }
    }
  }
}

export default Avatar
