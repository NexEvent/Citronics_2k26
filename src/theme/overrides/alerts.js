// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const Alerts = () => {
  return {
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(1)
          },
          '& a': {
            fontWeight: 500,
            color: 'inherit'
          }
        }),
        standardSuccess: ({ theme }) => ({
          color: theme.palette.success.main,
          backgroundColor: hexToRGBA(theme.palette.success.main, 0.16),
          '& .MuiAlertTitle-root': {
            color: theme.palette.success.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.success.main
          }
        }),
        standardInfo: ({ theme }) => ({
          color: theme.palette.info.main,
          backgroundColor: hexToRGBA(theme.palette.info.main, 0.16),
          '& .MuiAlertTitle-root': {
            color: theme.palette.info.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.info.main
          }
        }),
        standardWarning: ({ theme }) => ({
          color: theme.palette.warning.main,
          backgroundColor: hexToRGBA(theme.palette.warning.main, 0.16),
          '& .MuiAlertTitle-root': {
            color: theme.palette.warning.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.warning.main
          }
        }),
        standardError: ({ theme }) => ({
          color: theme.palette.error.main,
          backgroundColor: hexToRGBA(theme.palette.error.main, 0.16),
          '& .MuiAlertTitle-root': {
            color: theme.palette.error.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.error.main
          }
        }),
        outlinedSuccess: ({ theme }) => ({
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
          '& .MuiAlertTitle-root': {
            color: theme.palette.success.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.success.main
          }
        }),
        outlinedInfo: ({ theme }) => ({
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
          '& .MuiAlertTitle-root': {
            color: theme.palette.info.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.info.main
          }
        }),
        outlinedWarning: ({ theme }) => ({
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.main,
          '& .MuiAlertTitle-root': {
            color: theme.palette.warning.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.warning.main
          }
        }),
        outlinedError: ({ theme }) => ({
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
          '& .MuiAlertTitle-root': {
            color: theme.palette.error.main
          },
          '& .MuiAlert-icon': {
            color: theme.palette.error.main
          }
        }),
        filled: ({ theme }) => ({
          fontWeight: 400,
          color: theme.palette.common.white
        })
      }
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          marginBottom: '0.25rem'
        }
      }
    }
  }
}

export default Alerts
