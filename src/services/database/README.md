# Database — Citronics

## Directory Structure

```
src/services/database/
├── schema.sql           # Full canonical schema (source of truth)
├── migrate.js           # Migration runner script
├── README.md            # This file
└── migrations/
    └── 001_initial_schema.sql   # First migration — core tables
```

## How Migrations Work

1. Each migration is a numbered `.sql` file in `migrations/`
2. The runner tracks applied migrations in a `_migrations` table
3. Only new (un-applied) migrations run — safe to call repeatedly

## Naming Convention

```
NNN_short_description.sql
```

- `NNN` — 3-digit zero-padded number (001, 002, 003…)
- `short_description` — snake_case summary of the change

## Commands

```bash
# Run all pending migrations
node src/services/database/migrate.js

# Show migration status
node src/services/database/migrate.js status

# Drop everything & re-run from scratch (DEV ONLY)
node src/services/database/migrate.js reset
```

## Adding a New Migration

1. Create `migrations/NNN_description.sql`
2. Write your SQL (ALTER TABLE, CREATE TABLE, etc.)
3. End the file with:
   ```sql
   INSERT INTO _migrations (name) VALUES ('NNN_description');
   ```
4. Run `node src/services/database/migrate.js`
5. Update `schema.sql` to reflect the new state

## Environment

Requires `DATABASE_URL` or individual `DB_*` variables in `.env`:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```
