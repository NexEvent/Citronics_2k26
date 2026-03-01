-- Migration: Add user_id directly to payments table for easier querying
-- The user is already traceable via payments.booking_id → bookings.user_id,
-- but a direct column makes dashboard queries and lookups much faster.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Backfill user_id from existing bookings
UPDATE payments p
SET user_id = b.user_id
FROM bookings b
WHERE p.booking_id = b.id
  AND p.user_id IS NULL;

-- Index for fast user payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
