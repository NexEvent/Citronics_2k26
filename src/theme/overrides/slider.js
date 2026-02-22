const Slider = () => {
  return {
    MuiSlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:not(.MuiSlider-vertical)': {
            height: 6
          },
          '&.MuiSlider-vertical': {
            width: 6
          }
        }),
        rail: ({ theme }) => ({
          opacity: 1,
          backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.16)`
        }),
        track: {
          border: 0
        },
        thumb: ({ theme }) => ({
          width: 14,
          height: 14,
          '&:before': {
            boxShadow: theme.shadows[3],
            border: `2px solid ${theme.palette.background.paper}`
          },
          '&:not(.Mui-active):after': {
            width: 30,
            height: 30
          },
          '&.Mui-active': {
            width: 18,
            height: 18,
            '&:before': {
              borderWidth: 3
            },
            '&:after': {
              width: 38,
              height: 38
            }
          }
        }),
        sizeSmall: {
          '&:not(.MuiSlider-vertical)': {
            height: 4
          },
          '&.MuiSlider-vertical': {
            width: 4
          },
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            '&:before': {
              boxShadow: 'none'
            },
            '&:not(.Mui-active):after': {
              width: 24,
              height: 24
            },
            '&.Mui-active': {
              width: 14,
              height: 14,
              '&:after': {
                width: 30,
                height: 30
              }
            }
          },
          '& .MuiSlider-valueLabelOpen': {
            transform: 'translateY(-100%) scale(1)'
          },
          '&.MuiSlider-vertical .MuiSlider-valueLabelOpen': {
            transform: 'translateX(-100%) scale(1)'
          }
        },
        markLabel: ({ theme }) => ({
          color: theme.palette.text.disabled
        }),
        valueLabel: ({ theme }) => ({
          borderRadius: 4,
          padding: theme.spacing(1, 2),
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[3]
        })
      }
    }
  }
}

export default Slider
