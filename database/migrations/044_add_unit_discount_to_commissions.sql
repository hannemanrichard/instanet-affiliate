-- Migration: Add unit_discount to commissions
-- Purpose: Store the per-unit discount the affiliate applied from their commission.
--          unit_commission stores the ORIGINAL (base) commission rate.
--          amount = (unit_commission − unit_discount) × quantity.

ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS unit_discount NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN commissions.unit_discount IS
  'Per-unit discount the affiliate sacrificed from their commission. 0 when no discount applied.';
