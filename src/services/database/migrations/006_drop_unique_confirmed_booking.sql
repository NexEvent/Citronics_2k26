-- ============================================================================
-- Migration 006: Drop unique confirmed booking constraint
-- Date: 2026-03-01
-- Description: Removes the partial unique index that prevented users from
--              purchasing additional tickets for an event they already had
--              a confirmed booking for. Users should be able to buy more
--              tickets for the same event.
-- ============================================================================

DROP INDEX IF EXISTS idx_bookings_unique_confirmed;
