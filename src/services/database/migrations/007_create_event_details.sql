-- ============================================================================
-- Migration 007: Create event_details table
-- Date: 2026-03-03
-- Description: Creates a new event_details table with a 1:1 relationship to
--              events. Stores extended event information (prizes, rules,
--              rounds, brief, team size, hero image) separately from the
--              core events table for clean separation of concerns.
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_details (
    event_id    BIGINT PRIMARY KEY
                REFERENCES events(id) ON DELETE CASCADE,

    prize       TEXT[]    NOT NULL DEFAULT '{}',
    image_url   TEXT,
    brief       TEXT,
    rules       TEXT[]    NOT NULL DEFAULT '{}',
    rounds      TEXT[]    NOT NULL DEFAULT '{}',
    team_size   INTEGER ,

    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track this migration
INSERT INTO _migrations (name)
VALUES ('007_create_event_details')
ON CONFLICT (name) DO NOTHING;
