/**
 * CustomChip — Role-agnostic status chip
 *
 * Replaces AdminStatusChip. Renders colored chips for events, roles, verification.
 * Uses CustomChip from components/mui for consistent styling.
 *
 * Props:
 *  status  string — status value (e.g. 'draft', 'admin', 'true')
 *  type    string — 'event' | 'role' | 'verified' | 'payment' | 'ticket'
 *  size    string — 'small' | 'medium'
 */
import Icon from 'src/components/Icon'
import MuiCustomChip from 'src/components/mui/Chip'

const EVENT_STATUS = {
  draft:     { label: 'Draft',     color: 'warning',   icon: 'tabler:pencil' },
  published: { label: 'Published', color: 'success',   icon: 'tabler:world' },
  active:    { label: 'Active',    color: 'success',   icon: 'tabler:player-play' },
  cancelled: { label: 'Cancelled', color: 'error',     icon: 'tabler:x' },
  completed: { label: 'Completed', color: 'info',      icon: 'tabler:flag-3' }
}

const ROLE_CONFIG = {
  owner:     { label: 'Owner',     color: 'warning',   icon: 'tabler:crown' },
  admin:     { label: 'Admin',     color: 'primary',   icon: 'tabler:shield' },
  organizer: { label: 'Organizer', color: 'success',   icon: 'tabler:calendar-event' },
  student:   { label: 'Student',   color: 'secondary', icon: 'tabler:user' }
}

const VERIFIED_CONFIG = {
  true:  { label: 'Verified',   color: 'success', icon: 'tabler:circle-check' },
  false: { label: 'Unverified', color: 'warning', icon: 'tabler:clock' }
}

const PAYMENT_STATUS = {
  paid:     { label: 'Paid',     color: 'success', icon: 'tabler:circle-check' },
  pending:  { label: 'Pending',  color: 'warning', icon: 'tabler:clock' },
  failed:   { label: 'Failed',   color: 'error',   icon: 'tabler:x' },
  refunded: { label: 'Refunded', color: 'info',    icon: 'tabler:arrow-back' },
  free:     { label: 'Free',     color: 'secondary', icon: 'tabler:tag' }
}

const TICKET_STATUS = {
  available: { label: 'Available', color: 'success',   icon: 'tabler:ticket' },
  sold:      { label: 'Sold Out',  color: 'error',     icon: 'tabler:ticket-off' },
  reserved:  { label: 'Reserved',  color: 'warning',   icon: 'tabler:clock' },
  used:      { label: 'Used',      color: 'info',      icon: 'tabler:check' }
}

const TYPE_MAP = {
  event: EVENT_STATUS,
  role: ROLE_CONFIG,
  verified: VERIFIED_CONFIG,
  payment: PAYMENT_STATUS,
  ticket: TICKET_STATUS
}

const CustomChip = ({ status, type = 'event', size = 'small', sx, ...rest }) => {
  const map = TYPE_MAP[type] || EVENT_STATUS
  const key = String(status ?? '').toLowerCase()
  const config = map[key] || { label: status ?? '—', color: 'secondary', icon: 'tabler:circle' }

  return (
    <MuiCustomChip
      skin='light'
      rounded
      size={size}
      color={config.color}
      label={config.label}
      icon={<Icon icon={config.icon} fontSize={12} />}
      sx={{ fontWeight: 600, textTransform: 'capitalize', ...sx }}
      {...rest}
    />
  )
}

export { EVENT_STATUS, ROLE_CONFIG, VERIFIED_CONFIG, PAYMENT_STATUS, TICKET_STATUS }
export default CustomChip
