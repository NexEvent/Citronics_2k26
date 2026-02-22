import MuiChip from '@mui/material/Chip'
import { clsx } from 'clsx'
import useBgColor from 'src/hooks/useBgColor'

/**
 * CustomChip
 *
 * Extends MUI Chip with `skin` and `rounded` props.
 *
 * @prop {'light'} [skin]    - tinted background matching the color
 * @prop {boolean} [rounded] - pill shape (border-radius: 50px)
 * @prop {'primary'|'secondary'|'success'|'error'|'warning'|'info'} [color]
 *
 * @example
 * <CustomChip skin='light' color='success'  label='Published'  />
 * <CustomChip skin='light' color='warning'  label='Draft'    rounded />
 * <CustomChip skin='light' color='error'    label='Cancelled' />
 */
const CustomChip = (props) => {
  const { sx, skin, color, rounded, ...rest } = props
  const bgColors = useBgColor()

  const colors = {
    primary:   { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success:   { ...bgColors.successLight },
    error:     { ...bgColors.errorLight },
    warning:   { ...bgColors.warningLight },
    info:      { ...bgColors.infoLight }
  }

  const colorSx =
    skin === 'light' && color && colors[color]
      ? Object.assign({}, colors[color], sx)
      : sx

  return (
    <MuiChip
      {...rest}
      variant='filled'
      className={clsx({ 'MuiChip-rounded': rounded, 'MuiChip-light': skin === 'light' })}
      sx={{
        fontWeight: 500,
        fontSize: '0.75rem',
        ...(rounded && { borderRadius: '50px' }),
        ...colorSx
      }}
    />
  )
}

export default CustomChip
