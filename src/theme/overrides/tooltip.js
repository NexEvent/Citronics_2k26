// ** Util Import
import { hexToRGBA } from 'src/lib/hexToRgba'

const Tooltip = () => {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 6,
          lineHeight: 1.455,
          backgroundColor: hexToRGBA(theme.palette.customColors.tooltipBg, 0.9)
        }),
        arrow: ({ theme }) => ({
          color: hexToRGBA(theme.palette.customColors.tooltipBg, 0.9)
        })
      }
    }
  }
}

export default Tooltip
