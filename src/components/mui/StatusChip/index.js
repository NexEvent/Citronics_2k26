import CustomChip from 'src/components/mui/Chip'

/**
 * STATUS MAPS
 * Each domain object (event, ticket, registration, payment) maps its status
 * strings to a MUI theme color.  Add new statuses here — no other file changes.
 */
const EVENT_STATUS = {
  published: { color: 'success', label: 'Published' },
  draft:     { color: 'warning', label: 'Draft'     },
  cancelled: { color: 'error',   label: 'Cancelled' },
  completed: { color: 'info',    label: 'Completed' },
  archived:  { color: 'secondary', label: 'Archived' }
}

const TICKET_STATUS = {
  available: { color: 'success', label: 'Available' },
  sold:      { color: 'error',   label: 'Sold Out'  },
  reserved:  { color: 'warning', label: 'Reserved'  },
  free:      { color: 'info',    label: 'Free'      }
}

const REGISTRATION_STATUS = {
  pending:   { color: 'warning', label: 'Pending'   },
  confirmed: { color: 'success', label: 'Confirmed' },
  cancelled: { color: 'error',   label: 'Cancelled' },
  attended:  { color: 'info',    label: 'Attended'  },
  waitlist:  { color: 'secondary', label: 'Waitlist' }
}

const PAYMENT_STATUS = {
  paid:    { color: 'success', label: 'Paid'    },
  pending: { color: 'warning', label: 'Pending' },
  failed:  { color: 'error',   label: 'Failed'  },
  refunded:{ color: 'info',    label: 'Refunded' },
  free:    { color: 'secondary', label: 'Free'  }
}

/**
 * StatusChip
 *
 * Renders a `<CustomChip skin='light' rounded>` whose color and label are
 * determined automatically from the status string + domain.
 *
 * @prop {'event'|'ticket'|'registration'|'payment'} type  - which domain
 * @prop {string} status  - the raw status value from the database
 * @prop {object} [sx]    - extra sx overrides
 *
 * @example
 * <StatusChip type='event'        status='published' />
 * <StatusChip type='ticket'       status='sold'      />
 * <StatusChip type='registration' status='confirmed' />
 * <StatusChip type='payment'      status='paid'      />
 */
const StatusChip = ({ type = 'event', status, sx, ...rest }) => {
  const maps = {
    event:        EVENT_STATUS,
    ticket:       TICKET_STATUS,
    registration: REGISTRATION_STATUS,
    payment:      PAYMENT_STATUS
  }

  const map = maps[type] ?? {}
  const key = (status ?? '').toLowerCase()
  const cfg = map[key] ?? { color: 'secondary', label: status ?? '—' }

  return (
    <CustomChip
      skin='light'
      rounded
      size='small'
      color={cfg.color}
      label={cfg.label}
      sx={sx}
      {...rest}
    />
  )
}

export { EVENT_STATUS, TICKET_STATUS, REGISTRATION_STATUS, PAYMENT_STATUS }
export default StatusChip
