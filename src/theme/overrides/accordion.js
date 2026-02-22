const Accordion = () => {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: theme.spacing(2, 0),
          borderRadius: theme.shape.borderRadius,
          boxShadow: `${theme.shadows[1]} !important`,
          transition: 'box-shadow .3s ease, margin .3s ease, border-radius .3s ease',
          '&:before': { display: 'none' },
          '&.Mui-disabled': {
            backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.12)`
          },
          '&.Mui-expanded': {
            margin: theme.spacing(2, 0),
            boxShadow: `${theme.shadows[3]} !important`
          },
          '&:first-of-type, &:last-of-type': {
            borderRadius: theme.shape.borderRadius
          }
        })
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 50,
          borderRadius: 'inherit',
          padding: theme.spacing(0, 5),
          '&.Mui-expanded': {
            minHeight: 50,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          },
          '& + .MuiCollapse-root': {
            '& .MuiAccordionDetails-root:first-child': {
              paddingTop: 0
            }
          }
        }),
        content: ({ theme }) => ({
          margin: `${theme.spacing(2.5)} 0`
        }),
        expandIconWrapper: ({ theme }) => ({
          color: theme.palette.text.primary
        })
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '& + .MuiAccordionDetails-root': {
            paddingTop: 0
          }
        })
      }
    }
  }
}

export default Accordion
