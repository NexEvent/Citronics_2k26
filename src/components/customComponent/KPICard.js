/**
 * KPICard — Dashboard metric card
 *
 * Centered square card with stacked icon and value layout.
 * Replaces AdminKpiCard. Clean, minimal, responsive.
 *
 * Props:
 *  title     string  — metric label
 *  value     any     — main value (numbers auto locale-formatted)
 *  icon      string  — tabler icon name
 *  color     string  — MUI palette key: 'primary' | 'success' | 'warning' | 'info' | 'error'
 *  prefix    string  — text before value (e.g. '₹')
 *  suffix    string  — text after value
 *  subtitle  string  — small muted text below value
 *  loading   bool    — show skeleton
 *  onClick   fn      — makes card clickable
 */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'
import Icon from 'src/components/Icon'

const KPICard = ({
  title = 'Metric',
  value,
  icon = 'tabler:table',
  color = 'primary',
  prefix = '',
  suffix = '',
  subtitle,
  loading = false,
  onClick
}) => {
  const theme = useTheme()
  const palette = theme.palette[color] || theme.palette.primary

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': onClick
          ? { transform: 'translateY(-2px)', boxShadow: theme.shadows[6] }
          : {}
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 1 }, textAlign: 'center'}}>
        {/* Icon */}
        <Box
          sx={{
            mb: 1.5,
            p: 1.75,
            borderRadius: 1,
            bgcolor: alpha(palette.main, 0.1),
            color: palette.main,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon={icon} fontSize={28} />
        </Box>

        {/* Title */}
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            display: 'block',
            mb: 1
          }}
        >
          {title}
        </Typography>

        {/* Value */}
        {loading ? (
          <>
            <Skeleton width='60%' height={32} sx={{ mx: 'auto', mb: subtitle ? 0.5 : 0 }} />
            {subtitle && <Skeleton width='50%' height={12} sx={{ mx: 'auto', mt: 0.5 }} />}
          </>
        ) : (
          <>
            <Typography
              variant='h5'
              fontWeight={700}
              color='text.primary'
              sx={{
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}
            >
              {prefix}
              {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
              {suffix}
            </Typography>
            {subtitle && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default KPICard
