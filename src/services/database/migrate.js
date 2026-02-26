/**
 * Database Migration Runner — Citronics
 *
 * Usage:
 *   node src/services/database/migrate.js          Run all pending migrations
 *   node src/services/database/migrate.js status    Show migration status
 *   node src/services/database/migrate.js reset     Drop all tables & re-run (DEV ONLY)
 *
 * Requires DATABASE_URL env var (or individual DB_HOST etc.).
 * Reads .sql files from ./migrations/ in alphabetical order.
 */

const pgp = require('pg-promise')({ noWarnings: true })
const fs = require('fs')
const path = require('path')

// ── Resolve connection ─────────────────────────────────────────────────────────
require('dotenv').config();
// Do not log DATABASE_URL or any credentials to avoid leaking secrets in logs.
// Support dotenv if available
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (_) {}

function getConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 10_000
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'citronics',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 3,
    connectionTimeoutMillis: 10_000
  }
}

const db = pgp(getConnectionConfig())

// ── Helpers ────────────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

/** Ensure the _migrations tracking table exists */
async function ensureMigrationsTable() {
  await db.none(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

/** Get list of already-applied migration names */
async function getAppliedMigrations() {
  const rows = await db.any('SELECT name FROM _migrations ORDER BY id')

  return new Set(rows.map(r => r.name))
}

/** Get all .sql migration files sorted by name */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return []

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()
}

// ── Commands ───────────────────────────────────────────────────────────────────

async function runMigrations() {
  await ensureMigrationsTable()
  const applied = await getAppliedMigrations()
  const files = getMigrationFiles()

  const pending = files.filter(f => {
    const name = f.replace('.sql', '')

    return !applied.has(name)
  })

  if (pending.length === 0) {
    console.log('✓ All migrations are up to date.')

    return
  }

  console.log(`⏳ Running ${pending.length} pending migration(s)...\n`)

  for (const file of pending) {
    const name = file.replace('.sql', '')
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')

    try {
      console.log(`  → ${file}`)
      await db.tx(async t => {
        await t.none(sql)

        // Ensure migration is recorded (in case the SQL already does it, use ON CONFLICT)
        await t.none(
          `INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
          [name]
        )
      })
      console.log(`    ✓ Applied successfully`)
    } catch (err) {
      console.error(`    ✗ FAILED: ${err.message}`)
      process.exit(1)
    }
  }

  console.log(`\n✓ Done — ${pending.length} migration(s) applied.`)
}

async function showStatus() {
  await ensureMigrationsTable()
  const applied = await getAppliedMigrations()
  const files = getMigrationFiles()

  console.log('\n  Migration Status\n  ─────────────────────────────────────')

  for (const file of files) {
    const name = file.replace('.sql', '')
    const status = applied.has(name) ? '✓ applied' : '○ pending'
    console.log(`  ${status}  ${file}`)
  }

  if (files.length === 0) {
    console.log('  (no migration files found)')
  }

  console.log()
}

async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('✗ Cannot reset in production!')
    process.exit(1)
  }

  console.log('⚠  Dropping all tables and re-running migrations...\n')

  // Drop everything in the public schema
  await db.none(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      -- Drop all tables
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      -- Drop all custom types
      FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$;
  `)

  console.log('  ✓ All tables and types dropped.')

  await runMigrations()
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2] || 'run'

  try {
    // Test connection first
    const { now } = await db.one('SELECT NOW() AS now')
    console.log(`\n🔌 Connected to database (server time: ${now})\n`)

    switch (command) {
      case 'status':
        await showStatus()
        break
      case 'reset':
        await resetDatabase()
        break
      case 'run':
      default:
        await runMigrations()
        break
    }
  } catch (err) {
    console.error(`\n✗ Database error: ${err.message}\n`)
    process.exit(1)
  } finally {
    pgp.end()
  }
}

main()
