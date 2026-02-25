

-- ── Categories (departments / event tracks) ────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    images      JSONB        DEFAULT '[]'::jsonb,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug       ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- ── Enhance events table ───────────────────────────────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS tagline      VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize        VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags         TEXT[]       DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured     BOOLEAN      DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registered   INTEGER      DEFAULT 0;

ALTER TABLE events ADD COLUMN IF NOT EXISTS images       JSONB        DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id  BIGINT;

-- Foreign key to categories
ALTER TABLE events
  ADD CONSTRAINT fk_events_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_featured    ON events(featured) WHERE featured = TRUE;

-- ── Record this migration ──────────────────────────────────────────────────
INSERT INTO _migrations (name) VALUES ('003_add_categories_and_enhance_events')
  ON CONFLICT (name) DO NOTHING;

