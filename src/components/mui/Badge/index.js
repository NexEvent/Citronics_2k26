import MuiBadge from '@mui/material/Badge'
import useBgColor from 'src/hooks/useBgColor'

/**
 * CustomBadge
 *
 * Extends MUI Badge with a `skin='light'` prop that applies a tinted
 * background to the badge dot instead of the solid colour.
 *
 * @prop {'light'} [skin]  - when 'light', uses the tinted palette variant
 * @prop {'primary'|'secondary'|'success'|'error'|'warning'|'info'} [color]
 *
 * @example
 * <CustomBadge skin='light' color='success' badgeContent={3}>
 *   <Icon icon='tabler:bell' />
 * </CustomBadge>
 */
const CustomBadge = (props) => {
  const { sx, skin, color, ...rest } = props
  const bgColors = useBgColor()

  const colors = {
    primary:   { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success:   { ...bgColors.successLight },
    error:     { ...bgColors.errorLight },
    warning:   { ...bgColors.warningLight },
    info:      { ...bgColors.infoLight }
  }

  const badgeSx =
    skin === 'light' && color
      ? Object.assign({ '& .MuiBadge-badge': colors[color] }, sx)
      : sx

  return <MuiBadge {...rest} color={skin === 'light' ? 'default' : color} sx={badgeSx} />
}

export default CustomBadge
