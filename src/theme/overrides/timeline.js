const Timeline = () => {
  return {
    MuiTimelineItem: {
      styleOverrides: {
        root: {
          '&:not(:last-of-type)': {
            '& .MuiTimelineContent-root': {
              marginBottom: 4
            }
          }
        }
      }
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.divider
        })
      }
    },
    MuiTimelineContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginTop: theme.spacing(0.5)
        })
      }
    },
    MuiTimelineDot: {
      styleOverrides: {
        filledGrey: ({ theme }) => ({
          backgroundColor: theme.palette.grey[400]
        }),
        outlinedGrey: ({ theme }) => ({
          borderColor: theme.palette.grey[400]
        }),
        filledPrimary: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.primary.light : 'rgb(50, 71, 105)'
          }`
        }),
        filledSecondary: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.secondary.light : 'rgb(96, 98, 102)'
          }`
        }),
        filledSuccess: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.success.light : 'rgb(51, 104, 70)'
          }`
        }),
        filledError: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.error.light : 'rgb(115, 57, 62)'
          }`
        }),
        filledWarning: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.warning.light : 'rgb(119, 93, 44)'
          }`
        }),
        filledInfo: ({ theme }) => ({
          boxShadow: `0 0 0 3px ${
            theme.palette.mode === 'light' ? theme.palette.info.light : 'rgb(38, 86, 108)'
          }`
        })
      }
    }
  }
}

export default Timeline
