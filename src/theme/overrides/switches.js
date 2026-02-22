const Switches = () => {
  return {
    MuiSwitch: {
      styleOverrides: {
        root: ({ theme }) => ({
          width: 54,
          height: 42,
          '& .MuiSwitch-track': {
            width: 30,
            height: 18,
            opacity: 1,
            borderRadius: 30,
            backgroundColor: theme.palette.action.selected
          }
        }),
        switchBase: ({ theme }) => ({
          top: 5,
          left: 6,
          padding: `${theme.spacing(2.5)} !important`,
          color: `rgba(${theme.palette.customColors.mainRgb}, 0.6)`,
          transition: theme.transitions.create(['left', 'transform', 'color'], {
            duration: theme.transitions.duration.shortest
          }),
          '&:hover': {
            backgroundColor: 'transparent !important'
          },
          '&.Mui-disabled': {
            color: `rgba(${theme.palette.customColors.mainRgb}, 0.4)`,
            '& + .MuiSwitch-track': {
              opacity: 0.5
            },
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                opacity: 0.4
              }
            }
          },
          '&.Mui-checked': {
            left: -4,
            color: `${theme.palette.common.white} !important`,
            '& + .MuiSwitch-track': {
              opacity: 1,
              boxShadow: 'none'
            },
            '&.MuiSwitch-colorPrimary + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main
            },
            '&.MuiSwitch-colorSecondary + .MuiSwitch-track': {
              backgroundColor: theme.palette.secondary.main
            },
            '&.MuiSwitch-colorSuccess + .MuiSwitch-track': {
              backgroundColor: theme.palette.success.main
            },
            '&.MuiSwitch-colorError + .MuiSwitch-track': {
              backgroundColor: theme.palette.error.main
            },
            '&.MuiSwitch-colorWarning + .MuiSwitch-track': {
              backgroundColor: theme.palette.warning.main
            },
            '&.MuiSwitch-colorInfo + .MuiSwitch-track': {
              backgroundColor: theme.palette.info.main
            }
          }
        }),
        thumb: ({ theme }) => ({
          width: 12,
          height: 12,
          boxShadow: 'none'
        }),
        sizeSmall: ({ theme }) => ({
          width: 38,
          height: 30,
          '& .MuiSwitch-track': {
            width: 24,
            height: 16
          },
          '& .MuiSwitch-thumb': {
            width: 10,
            height: 10
          },
          '& .MuiSwitch-switchBase': {
            top: 2,
            left: 3,
            padding: `${theme.spacing(1.5)} !important`,
            '&.Mui-checked': {
              left: -4
            }
          }
        })
      }
    }
  }
}

export default Switches
