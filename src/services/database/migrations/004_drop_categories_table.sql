-- ── Migration 004: Drop categories table and related constraints ──────────

-- Drop the foreign key constraint first
ALTER TABLE events DROP CONSTRAINT IF EXISTS fk_events_category;

-- Drop indexes that reference categories
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_categories_sort_order;
DROP INDEX IF EXISTS idx_events_category_id;

-- Drop the categories table
DROP TABLE IF EXISTS categories CASCADE;

-- ── Record this migration ──────────────────────────────────────────────────
INSERT INTO _migrations (name) VALUES ('004_drop_categories_table')
  ON CONFLICT (name) DO NOTHING;
