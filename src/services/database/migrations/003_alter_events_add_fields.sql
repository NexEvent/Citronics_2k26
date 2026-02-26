-- ============================================================================
-- Migration 003: Alter events — add tagline, registered, prize, tags,
--                featured, images
-- Date: 2026-02-26
-- Description: Adds the new columns required by event-service.js queries.
--              registered  → live registration counter (integer)
--              prize       → prize / reward string
--              tags        → searchable tag array
--              featured    → boolean flag for highlighted events
--              images      → jsonb array of image objects
--              tagline     → short marketing subtitle
-- ============================================================================

-- Short marketing subtitle shown on cards and hero banners
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);

-- Live registration counter (incremented on each confirmed booking)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registered INTEGER NOT NULL DEFAULT 0
  CHECK (registered >= 0);

-- Prize / reward description (e.g. "₹10,000 cash prize")
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS prize VARCHAR(100);

-- Searchable tags array  (e.g. '{"robotics","ai","workshop"}')
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Featured flag — controls hero / highlights ordering
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Ordered array of image objects  [{ url, alt, caption }, ...]
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Index: fast lookup of featured published events (used in getFeaturedEvents)
CREATE INDEX IF NOT EXISTS idx_events_featured
  ON events(featured)
  WHERE featured = TRUE;

-- Index: registration count (used for sort=popular in getPublishedEvents)
CREATE INDEX IF NOT EXISTS idx_events_registered
  ON events(registered DESC);
