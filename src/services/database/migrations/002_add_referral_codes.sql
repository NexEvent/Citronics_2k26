-- ============================================================================
-- Migration 002: Add referral codes & support Google OAuth
-- ============================================================================

-- Allow NULL password_hash for Google OAuth users (no password)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add unique referral code column to students
ALTER TABLE students ADD COLUMN referral_code VARCHAR(10) UNIQUE;

-- Index for fast referral lookups
CREATE INDEX idx_students_referral_code ON students(referral_code);
