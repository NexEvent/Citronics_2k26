# API Conventions

> All API logic lives in `src/pages/api/`. Each route follows the same shape.

---

## Route Structure

```
src/pages/api/
├── auth/
│   └── [...nextauth].js    ← NextAuth magic route
├── events/
│   ├── index.js            ← GET (list) + POST (create)
│   └── [id].js             ← GET (detail) + PUT (update) + DELETE
├── tickets/
│   ├── index.js
│   └── [id].js
├── registrations/
│   ├── index.js
│   └── [id]/
│       └── check-in.js     ← POST /api/registrations/[id]/check-in
├── speakers/
├── venues/
├── analytics/
│   └── index.js
└── uploads/
    └── index.js
```

---

## Handler Template

Every handler follows this exact structure. Copy-paste this, don't invent your own.

```js
// src/pages/api/events/index.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/lib/nextAuthConfig'
import { getEvents, createEvent } from 'src/services/events-service'
import { z } from 'zod'

// ── Zod schemas (define once per file) ────────────────────────────────────────
const CreateEventSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().optional(),
  start_date:  z.string().datetime(),
  end_date:    z.string().datetime(),
  venue_id:    z.number().int().positive().optional(),
  capacity:    z.number().int().min(1).optional()
})

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // 1. Auth check
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Unauthorized' })

  // 2. Branch by method
  if (req.method === 'GET')  return handleGet(req, res, session)
  if (req.method === 'POST') return handlePost(req, res, session)

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}

async function handleGet(req, res, session) {
  try {
    const { page = 1, limit = 20, status, search } = req.query
    const result = await getEvents({ page: +page, limit: +limit, status, search })
    return res.status(200).json(result)
  } catch (err) {
    console.error('[API] GET /events', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

async function handlePost(req, res, session) {
  // 3. Validate input
  const parsed = CreateEventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ message: 'Validation failed', errors: parsed.error.flatten() })
  }

  try {
    const event = await createEvent({ ...parsed.data, created_by: session.user.id })
    return res.status(201).json(event)
  } catch (err) {
    console.error('[API] POST /events', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
```

---

## Response Shape

Always return JSON in one of these two shapes:

### Success
```json
// Single item
{ "id": 1, "title": "Tech Summit 2026", ... }

// List / paginated
{ "data": [...], "total": 142, "page": 1, "limit": 20 }
```

### Error
```json
{ "message": "Human-readable error" }
{ "message": "Validation failed", "errors": { "fieldErrors": { "title": ["Required"] } } }
```

---

## HTTP Status Code Rules

| Code | When |
|------|------|
| `200` | Successful GET / PUT |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no body) |
| `400` | Bad request (missing required param, wrong type) |
| `401` | Not logged in |
| `403` | Logged in but no permission |
| `404` | Resource not found |
| `422` | Zod validation failed (malformed body) |
| `500` | Unhandled server error |

---

## Auth in Every Handler

```js
const session = await getServerSession(req, res, authOptions)
if (!session) return res.status(401).json({ message: 'Unauthorized' })
```

Import `authOptions` from `src/lib/nextAuthConfig`:
```js
import { authOptions } from 'src/lib/nextAuthConfig'
```

---

## Zod Validation Rules

1. Define schemas **at the top of the file**, not inside the function.
2. Use `safeParse` — never `parse` (it throws and skips your error format).
3. Return `422` with `parsed.error.flatten()` — the frontend Redux thunk checks this shape.
4. Coerce strings to numbers in query params: `z.coerce.number().int().positive()`.

---

## File Upload Handler

```js
// src/pages/api/uploads/index.js
// Disable Next.js body parser for multipart
export const config = { api: { bodyParser: false } }
```

Use `formidable` to parse multipart. See `src/pages/api/uploads/index.js` for the full implementation.

---

## Query Parameter Conventions

| Param | Type | Meaning |
|-------|------|---------|
| `page` | number (default 1) | pagination page |
| `limit` | number (default 20, max 100) | items per page |
| `search` | string | full-text search term |
| `status` | string | filter by status enum value |
| `sort` | `field:asc` or `field:desc` | sort order |
| `startDate` / `endDate` | ISO 8601 string | date range filter |
