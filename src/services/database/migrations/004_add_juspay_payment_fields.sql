-- Migration: Add HDFC SmartGateway (Juspay) payment integration fields
-- Adds juspay_order_id to payments and creates ticket generation infrastructure

-- Add Juspay-specific columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS juspay_order_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gateway_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gateway_response_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gateway_response_message TEXT,
  ADD COLUMN IF NOT EXISTS sdk_payload JSONB;

-- Index for fast Juspay order lookups
CREATE INDEX IF NOT EXISTS idx_payments_juspay_order_id ON payments(juspay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Ensure tickets table has all needed columns (safe to re-run)
-- The base schema already has the tickets table, so nothing to add here.
