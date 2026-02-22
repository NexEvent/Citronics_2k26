/**
 * Citronics Custom MUI Components
 * ─────────────────────────────────────────────────────────────────────────────
 * All wrappers extend standard MUI components with our design-system defaults.
 * Import from here for clean, consistent usage across the codebase.
 *
 * @example
 * import CustomTextField from 'src/components/mui/TextField'
 * import { CustomAvatar, StatusChip, ConfirmDialog } from 'src/components/mui'
 */

export { default as CustomAvatar }       from './Avatar'
export { default as CustomBadge }        from './Badge'
export { default as CustomChip }         from './Chip'
export { default as CustomTextField }    from './TextField'
export { default as CustomAutocomplete } from './Autocomplete'
export { default as StatusChip }         from './StatusChip'
export { default as EventCard }          from './EventCard'
export { default as ConfirmDialog }      from './ConfirmDialog'

// Re-export the status maps for when you need to derive color outside a component
export {
  EVENT_STATUS,
  TICKET_STATUS,
  REGISTRATION_STATUS,
  PAYMENT_STATUS
} from './StatusChip'
