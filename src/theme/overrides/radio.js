// ** MUI Import
import { useTheme } from '@mui/material/styles'

const CheckedIcon = () => {
  const theme = useTheme()

  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='12' cy='12' r='9' fill={theme.palette.primary.main} />
      <circle cx='12' cy='12' r='5' fill={theme.palette.common.white} />
    </svg>
  )
}

const Icon = () => {
  const theme = useTheme()

  return (
    <svg
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      stroke={theme.palette.text.disabled}
    >
      <circle cx='12' cy='12' r='8.5' />
    </svg>
  )
}

const Radio = () => {
  return {
    MuiRadio: {
      defaultProps: {
        icon: <Icon />,
        checkedIcon: <CheckedIcon />
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-checked': {
            '& svg': {
              filter: `drop-shadow(0 2px 3px rgba(${
                theme.palette.mode === 'light' ? theme.palette.customColors.main : '12, 16, 27'
              }, 0.16))`
            },
            '&.Mui-disabled svg': {
              filter: 'none',
              '& circle:first-of-type': {
                fill: theme.palette.action.disabled
              }
            }
          },
          '&.Mui-disabled:not(.Mui-checked) svg': {
            stroke: theme.palette.action.disabled
          },
          '&.Mui-checked.MuiRadio-colorSecondary svg circle:first-of-type': {
            fill: theme.palette.secondary.main
          },
          '&.Mui-checked.MuiRadio-colorSuccess svg circle:first-of-type': {
            fill: theme.palette.success.main
          },
          '&.Mui-checked.MuiRadio-colorError svg circle:first-of-type': {
            fill: theme.palette.error.main
          },
          '&.Mui-checked.MuiRadio-colorWarning svg circle:first-of-type': {
            fill: theme.palette.warning.main
          },
          '&.Mui-checked.MuiRadio-colorInfo svg circle:first-of-type': {
            fill: theme.palette.info.main
          }
        })
      }
    }
  }
}

export default Radio
