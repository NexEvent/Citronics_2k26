import pgPromise from 'pg-promise'

const pgp = pgPromise({ noWarnings: true })

// Parse DATE columns as plain strings — prevents JS timezone shifts
pgp.pg.types.setTypeParser(1082, val => val)

// ── Connection pool ───────────────────────────────────────────────────────────
const db = pgp({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT     || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      parseInt(process.env.DB_POOLSIZE || '10'),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
})

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * dbAny — returns 0…N rows (SELECT lists).
 * Equivalent to pg-promise `db.any`.
 */
export const dbAny = (sql, params) => db.any(sql, params)

/**
 * dbOneOrNone — returns the first row or null.
 * Use for lookups that may not exist (user by email, event by id).
 * Equivalent to pg-promise `db.oneOrNone`.
 */
export const dbOneOrNone = (sql, params) => db.oneOrNone(sql, params)

/**
 * dbOne — returns exactly one row; throws QueryResultError if not found.
 * Use when the row MUST exist (foreign-key guaranteed joins).
 * Equivalent to pg-promise `db.one`.
 */
export const dbOne = (sql, params) => db.one(sql, params)

/**
 * dbNone — executes INSERT / UPDATE / DELETE that returns nothing.
 * Throws if any rows are returned unexpectedly.
 * Equivalent to pg-promise `db.none`.
 */
export const dbNone = (sql, params) => db.none(sql, params)

/**
 * dbTx — wraps multiple queries in a single DB transaction.
 * Auto-commits on success, auto-rolls-back on error.
 *
 * @param {(t: pgPromise.ITask<{}>) => Promise<any>} fn - Callback receiving the task context
 * @example
 *   const result = await dbTx(async t => {
 *     const evt = await t.one('INSERT INTO events(...) VALUES(...) RETURNING id', [...])
 *     await t.none('INSERT INTO tickets(event_id,...) VALUES($1,...)', [evt.id, ...])
 *     return evt
 *   })
 */
export const dbTx = fn => db.tx(fn)

/**
 * testConnection — fires a lightweight query to verify the pool is healthy.
 * Returns { ok: true, now: <timestamp> } or throws.
 */
export const testConnection = async () => {
  const row = await db.one('SELECT NOW() AS now')
  return { ok: true, now: row.now }
}

// ── Default export (raw pg-promise instance for advanced use) ─────────────────
export default db
