# Component Writing Guide

---

## Two Types of Components

| Type | Location | Rule |
|------|----------|------|
| **Generic** — no business logic, fully reusable (e.g. `Spinner`, `Icon`, `ScrollToTop`) | `src/@core/components/` | Must work in any project |
| **App-specific** — knows about EventHub concepts (e.g. `FileUpload`, `PWAPrompts`) | `src/components/` | Can import from store/configs |

> Never put domain-specific logic (event titles, ticket statuses) inside `@core/`.

---

## Component File Structure

```
src/components/EventCard/
├── index.js          ← The component (default export)
├── EventCard.styles.js  ← (optional) extracted sx/styled-component objects
└── EventCard.utils.js   ← (optional) local pure helpers
```

For simple single-file components, just `index.js` is fine.

---

## Component Template

```js
// src/components/EventCard/index.js
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Icon from 'src/@core/components/icon'
import { formatEventDate } from 'src/@core/utils/formatDate'

/**
 * EventCard
 * Displays a compact summary of an event for listing pages.
 *
 * Props:
 *   event   – event object from the store
 *   onClick – optional click handler
 */
const EventCard = ({ event, onClick }) => {
  if (!event) return null

  return (
    <Card
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default', '&:hover': { boxShadow: 4 } }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} noWrap>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {formatEventDate(event.start_date)}
        </Typography>
        <Chip label={event.status} size="small" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )
}

export default EventCard
```

---

## Naming Rules

| Thing | Convention | Example |
|-------|-----------|---------|
| Component | PascalCase | `EventCard`, `TicketBadge` |
| Props | camelCase | `onClose`, `isLoading` |
| Handlers inside component | `handle` prefix | `handleSubmit`, `handleDelete` |
| Boolean props | `is` / `has` / `can` prefix | `isLoading`, `hasError`, `canEdit` |

---

## Props Rules

1. **Destructure props at the top** of the function — never access `props.something` inline.
2. **Provide defaults** for optional props to avoid undefined errors.
3. **Document every prop** in a JSDoc comment above the component.
4. **Never pass raw session/store objects** as props when only a single value is needed.

```js
// ✅ Pass only what the component needs
<EventCard eventId={event.id} title={event.title} status={event.status} />

// ❌ Don't pass the whole object if only 3 fields are used
<EventCard event={entireEventObjectWithBlob} />
```

---

## Styling Rules

Use **MUI `sx` prop** for most styles. Extract to a `styles` object when reused:

```js
// Inline sx — fine for one-off styles
<Box sx={{ display: 'flex', gap: 2, p: 2 }}>

// Extracted — for repeated or complex styles
const cardSx = {
  borderRadius: 2,
  transition: 'box-shadow 0.2s',
  '&:hover': { boxShadow: 6 }
}
<Card sx={cardSx}>
```

Use `styled()` from `@mui/material/styles` only when you need variant-based styles or `shouldForwardProp`.

---

## Hooks in Components

- **Data fetching** → dispatch in `useEffect` in the parent **view**, not inside leaf components.
- **UI state** (open/closed, active tab) → `useState` is fine inside any component.
- **Shared logic** → extract to `src/hooks/` (app) or `src/@core/hooks/` (generic).

---

## Common @core Components

| Import | Usage |
|--------|-------|
| `src/@core/components/icon` | `<Icon icon="tabler:calendar" fontSize={20} />` |
| `src/@core/components/spinner` | Full-page loading fallback |
| `src/@core/components/scroll-to-top` | Drop into layout, works automatically |

### Icon Usage

We use **Iconify** for icons. Always import from `src/@core/components/icon`:

```js
import Icon from 'src/@core/components/icon'

// Usage
<Icon icon="tabler:calendar-event" fontSize={24} />
<Icon icon="tabler:ticket" color="primary" />
```

Browse icons at [icones.js.org](https://icones.js.org) — use `tabler:` prefix for consistency.

---

## Do & Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Keep components under 200 lines | Write 500-line god components |
| One component per file | Export multiple components from one file |
| Import MUI components individually | Import from `@mui/material` barrel (`import { ... } from '@mui/material'`) |
| Use `react-hot-toast` for feedback | Use `alert()` or custom inline toast logic |
| Wrap forms in `react-hook-form` | Use uncontrolled refs for forms |
