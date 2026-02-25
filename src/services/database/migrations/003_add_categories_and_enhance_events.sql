

-- ── Enhance events table ───────────────────────────────────────────────────
-- Add extra columns that the public event pages and home page need.
-- The existing departments table is used for event categorisation (no new table).
ALTER TABLE events ADD COLUMN IF NOT EXISTS tagline      VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize        VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags         TEXT[]       DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured     BOOLEAN      DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registered   INTEGER      DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS images       JSONB        DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured) WHERE featured = TRUE;

-- ── Record this migration ──────────────────────────────────────────────────
INSERT INTO _migrations (name) VALUES ('003_enhance_events')
  ON CONFLICT (name) DO NOTHING;

