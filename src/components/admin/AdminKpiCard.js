/**
 * AdminKpiCard — Reusable KPI / stat card for admin portal
 *
 * Props:
 *  title     string   — metric label
 *  value     any      — main value (numbers auto locale-formatted)
 *  icon      string   — tabler icon name (e.g. 'tabler:calendar-event')
 *  color     string   — MUI palette key: 'primary' | 'success' | 'warning' | 'info' | 'error'
 *  prefix    string   — text before value (e.g. '₹')
 *  suffix    string   — text after value  (e.g. '%')
 *  subtitle  string   — small muted text below value
 *  loading   bool     — show skeleton
 *  onClick   fn       — makes card clickable
 */

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'
import Icon from 'src/components/Icon'

const COLORS = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
  secondary: 'secondary'
}

const AdminKpiCard = ({
  title = 'Metric',
  value,
  icon = 'tabler:chart-bar',
  color = 'primary',
  prefix = '',
  suffix = '',
  subtitle,
  loading = false,
  onClick
}) => {
  const theme = useTheme()
  const palette = theme.palette[COLORS[color] || 'primary']
  const iconBg = alpha(palette.main, 0.12)

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': onClick
          ? { transform: 'translateY(-3px)', boxShadow: theme.shadows[8] }
          : {}
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.75 }}
            >
              {title}
            </Typography>

            {loading ? (
              <>
                <Skeleton width={80} height={40} />
                {subtitle && <Skeleton width={60} height={16} sx={{ mt: 0.5 }} />}
              </>
            ) : (
              <>
                <Typography variant='h4' fontWeight={700} color='text.primary' noWrap>
                  {prefix}
                  {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
                  {suffix}
                </Typography>
                {subtitle && (
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* Icon */}
          <Box
            sx={{
              ml: 2,
              p: 1.25,
              borderRadius: 2,
              bgcolor: iconBg,
              color: palette.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon icon={icon} fontSize={26} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AdminKpiCard
