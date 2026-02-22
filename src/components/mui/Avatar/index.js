import { forwardRef } from 'react'
import MuiAvatar from '@mui/material/Avatar'
import { lighten, useTheme } from '@mui/material/styles'
import useBgColor from 'src/hooks/useBgColor'

/**
 * CustomAvatar
 *
 * Extends MUI Avatar with `skin` and `color` props so you can render
 * colored/light avatars without writing sx every time.
 *
 * @prop {'filled'|'light'|'light-static'} skin  - filled = solid bg, light = tinted bg
 * @prop {'primary'|'secondary'|'success'|'error'|'warning'|'info'} color
 *
 * @example
 * <CustomAvatar skin='light' color='success'><Icon icon='tabler:check' /></CustomAvatar>
 * <CustomAvatar skin='filled' color='error' src='/img/avatar.png' />
 */
const CustomAvatar = forwardRef((props, ref) => {
  const { sx, src, skin, color, ...rest } = props

  const theme    = useTheme()
  const bgColors = useBgColor()

  const getStyles = (skin, color) => {
    if (skin === 'light')        return { ...bgColors[`${color}Light`] }
    if (skin === 'light-static') return {
      color:           bgColors[`${color}Light`].color,
      backgroundColor: lighten(theme.palette[color].main, 0.88)
    }
    return { ...bgColors[`${color}Filled`] } // 'filled' (default)
  }

  const colorStyles = !src && skin && color ? getStyles(skin, color) : {}

  return (
    <MuiAvatar
      ref={ref}
      {...rest}
      src={src}
      sx={{ ...colorStyles, ...sx }}
    />
  )
})

CustomAvatar.displayName = 'CustomAvatar'

CustomAvatar.defaultProps = {
  skin:  'filled',
  color: 'primary'
}

export default CustomAvatar
