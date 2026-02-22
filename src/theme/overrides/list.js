// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const List = () => {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: theme.spacing(5),
          paddingRight: theme.spacing(5),
          '&:hover': {
            backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08),
            '& .MuiListItemIcon-root, & .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiListItemSecondaryAction-root .MuiIconButton-root':
              {
                color: theme.palette.primary.main
              }
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiListItemSecondaryAction-root .MuiIconButton-root':
              {
                color: theme.palette.common.white
              }
          }
        })
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          minWidth: '0 !important',
          marginRight: theme.spacing(2.25),
          color: theme.palette.text.primary
        })
      }
    },
    MuiListItemAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          minWidth: 0,
          marginRight: theme.spacing(4)
        })
      }
    },
    MuiListItemText: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginTop: theme.spacing(0.5),
          marginBottom: theme.spacing(0.5)
        }),
        dense: ({ theme }) => ({
          '& .MuiListItemText-primary': {
            color: theme.palette.text.primary
          }
        })
      }
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'uppercase',
          color: theme.palette.text.disabled
        })
      }
    }
  }
}

export default List
