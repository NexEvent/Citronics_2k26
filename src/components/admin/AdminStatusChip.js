/**
 * AdminStatusChip — Standardized status chip for events and users
 *
 * Props:
 *  status  string  — 'draft' | 'published' | 'active' | 'cancelled' | 'completed'
 *                    OR for users: 'verified' | 'unverified'
 *  type    string  — 'event' | 'user'  (optional, inferred from status)
 *  size    string  — 'small' | 'medium'
 */

import Chip from '@mui/material/Chip'
import Icon from 'src/components/Icon'

const EVENT_STATUS = {
  draft:     { label: 'Draft',     color: 'default',   icon: 'tabler:pencil'       },
  published: { label: 'Published', color: 'info',      icon: 'tabler:world'        },
  active:    { label: 'Active',    color: 'success',   icon: 'tabler:player-play'  },
  cancelled: { label: 'Cancelled', color: 'error',     icon: 'tabler:x'            },
  completed: { label: 'Completed', color: 'secondary', icon: 'tabler:flag-3'       }
}

const ROLE_CONFIG = {
  owner:     { label: 'Owner',     color: 'warning',   icon: 'tabler:crown'        },
  admin:     { label: 'Admin',     color: 'primary',   icon: 'tabler:shield'       },
  executive: { label: 'Executive', color: 'info',      icon: 'tabler:user-check'   },
  organizer: { label: 'Organizer', color: 'success',   icon: 'tabler:calendar-event' },
  student:   { label: 'Student',   color: 'default',   icon: 'tabler:user'         }
}

const VERIFIED_CONFIG = {
  true:  { label: 'Verified',   color: 'success', icon: 'tabler:circle-check' },
  false: { label: 'Unverified', color: 'default', icon: 'tabler:clock'        }
}

const AdminStatusChip = ({ status, type = 'event', size = 'small' }) => {
  let config

  if (type === 'role') {
    config = ROLE_CONFIG[status?.toLowerCase()] || { label: status, color: 'default', icon: 'tabler:user' }
  } else if (type === 'verified') {
    config = VERIFIED_CONFIG[String(status)] || VERIFIED_CONFIG.false
  } else {
    config = EVENT_STATUS[status?.toLowerCase()] || { label: status, color: 'default', icon: 'tabler:circle' }
  }

  return (
    <Chip
      icon={<Icon icon={config.icon} fontSize={12} />}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
    />
  )
}

export default AdminStatusChip
