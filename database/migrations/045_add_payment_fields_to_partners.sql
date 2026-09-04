-- Migration: Add payment method fields to partners
-- Purpose: Allow affiliates to store their preferred payout method details.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS baridimob_rib VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS redotpay_account VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS usdt_address VARCHAR(255) DEFAULT NULL;

COMMENT ON COLUMN partners.baridimob_rib IS 'BaridiMob RIB (20-digit account number) for DZD payouts';
COMMENT ON COLUMN partners.redotpay_account IS 'RedotPay account ID or email for card-based payouts';
COMMENT ON COLUMN partners.usdt_address IS 'USDT (TRC-20/ERC-20) wallet address for crypto payouts';
