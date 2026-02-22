# Database: Connection & Query Writing

---

## Connection Setup

We use **pg-promise** — a lightweight, Promise-based PostgreSQL client.  
The connection is a **singleton** to avoid connection pool exhaustion in Next.js (which hot-reloads in dev).

```js
// src/services/dbConnection.js
import pgPromise from 'pg-promise'

const pgp = pgPromise()

// In Next.js, module-level variables persist across hot reloads.
// Attach to global to prevent creating multiple pools in development.
const getDb = () => {
  if (!global._pgdb) {
    global._pgdb = pgp({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
      max: 10           // max pool connections
    })
  }
  return global._pgdb
}

export const db = getDb()
export default db
```

**Never** import `pgPromise` directly in an API route or service. Always import `db` from `dbConnection.js`.

---

## Environment Variables

```
# .env.local
DATABASE_URL=postgres://user:password@host:5432/eventhub_db
```

---

## Service File Pattern

Each domain has its own service file. All DB logic lives here.

```
src/services/
  events-service.js
  tickets-service.js
  venues-service.js
  ...
```

### Template for a new service

```js
// src/services/events-service.js
import db from './dbConnection'

/**
 * Get paginated events list with optional filters.
 * @param {{ page: number, limit: number, status?: string, search?: string }} opts
 */
export async function getEvents({ page = 1, limit = 20, status, search } = {}) {
  const offset = (page - 1) * limit

  // Always build WHERE conditions with parameterized values — never string concat.
  const conditions = []
  const values = {}

  if (status) {
    conditions.push('status = ${status}')
    values.status = status
  }
  if (search) {
    conditions.push('(title ILIKE ${search} OR description ILIKE ${search})')
    values.search = `%${search}%`
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return db.task(async t => {
    const [rows, [{ count }]] = await Promise.all([
      t.any(
        `SELECT * FROM events ${where} ORDER BY start_date DESC LIMIT ${limit} OFFSET ${offset}`,
        values
      ),
      t.any(`SELECT COUNT(*) FROM events ${where}`, values)
    ])
    return { data: rows, total: parseInt(count, 10), page, limit }
  })
}

/**
 * Get a single event by ID.
 * Uses oneOrNone — returns null if not found (don't crash).
 */
export async function getEventById(id) {
  return db.oneOrNone('SELECT * FROM events WHERE id = $1', [id])
}

/**
 * Create a new event.
 * pg-promise's helpers.insert handles column mapping automatically.
 */
export async function createEvent(payload) {
  const { title, description, start_date, end_date, venue_id, capacity, status = 'draft', created_by } = payload

  return db.one(
    `INSERT INTO events (title, description, start_date, end_date, venue_id, capacity, status, created_by)
     VALUES ($[title], $[description], $[start_date], $[end_date], $[venue_id], $[capacity], $[status], $[created_by])
     RETURNING *`,
    { title, description, start_date, end_date, venue_id, capacity, status, created_by }
  )
}

/**
 * Update an event.
 */
export async function updateEvent(id, payload) {
  const { title, description, start_date, end_date, venue_id, capacity, status } = payload

  return db.oneOrNone(
    `UPDATE events
     SET title=$[title], description=$[description], start_date=$[start_date],
         end_date=$[end_date], venue_id=$[venue_id], capacity=$[capacity],
         status=$[status], updated_at=NOW()
     WHERE id=$[id]
     RETURNING *`,
    { id, title, description, start_date, end_date, venue_id, capacity, status }
  )
}

/**
 * Soft-delete: mark as cancelled rather than hard DELETE.
 */
export async function deleteEvent(id) {
  return db.oneOrNone(
    `UPDATE events SET status='cancelled', updated_at=NOW() WHERE id=$1 RETURNING id`,
    [id]
  )
}
```

---

## Query Writing Rules

### 1 — Always use parameterized queries

```js
// ✅ Safe
db.any('SELECT * FROM events WHERE id = $1', [id])
db.any('SELECT * FROM events WHERE status = $[status]', { status })

// ❌ Never do this — SQL injection risk
db.any(`SELECT * FROM events WHERE id = ${id}`)
```

### 2 — Use the right pg-promise method

| Method | Returns | When to use |
|--------|---------|-------------|
| `db.one` | exactly 1 row | guaranteed single result (throws if 0 or 2+) |
| `db.oneOrNone` | 1 row or `null` | optional lookup by ID |
| `db.any` | array (0 to N rows) | lists, search results |
| `db.none` | nothing | fire-and-forget inserts/updates with no `RETURNING` |
| `db.task` | custom | multiple queries that share a connection |
| `db.tx` | custom | multiple queries that must all succeed (transaction) |

### 3 — Use `db.task` for multiple reads, `db.tx` for writes

```js
// Multiple reads — use task (no transaction overhead)
const result = await db.task(async t => {
  const event = await t.oneOrNone('SELECT * FROM events WHERE id=$1', [id])
  const tickets = await t.any('SELECT * FROM tickets WHERE event_id=$1', [id])
  return { event, tickets }
})

// Write that spans multiple tables — wrap in transaction
await db.tx(async t => {
  const event = await t.one('INSERT INTO events(...) VALUES(...) RETURNING *', [...])
  await t.none('INSERT INTO audit_log(event_id, action) VALUES($1,$2)', [event.id, 'created'])
  return event
})
```

### 4 — Named parameters `$[name]` for clarity in complex queries

Use `$1, $2` for simple 1-2 param queries and `$[name]` for anything with 3+ parameters.

### 5 — Always `RETURNING *` after INSERT/UPDATE when you need the result

```sql
INSERT INTO events (...) VALUES (...) RETURNING *
```

### 6 — SELECT only the columns you need in list queries

```sql
-- ✅ Efficient for listing
SELECT id, title, start_date, status, capacity FROM events ...

-- ❌ Avoid in wide tables with JSONB / blobs
SELECT * FROM events ...
```

### 7 — Pagination standard

Every list query must support `LIMIT` / `OFFSET` and return `total`:

```js
const offset = (page - 1) * limit
// always return { data, total, page, limit }
```

---

## Database Schema

The canonical schema is in [`schema.sql`](../schema.sql) at the project root.  
Whenever you add a table or column, update `schema.sql` first, then write the service function.

### Core Tables

```
events          – id, title, description, start_date, end_date, venue_id, status, capacity
tickets         – id, event_id, name, price, quantity, quantity_sold, sale_start, sale_end, status
registrations   – id, event_id, ticket_id, attendee_name, attendee_email, ticket_number, checked_in
speakers        – id, name, bio, job_title, company, photo_url, linkedin_url
venues          – id, name, address, city, country, capacity
event_speakers  – event_id, speaker_id (join table)
users           – id, name, email, password_hash, role
```
