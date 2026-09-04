-- Migration: Add is_earned to commissions
-- Purpose: Track whether a snapshotted commission is earned yet.
--          false at order create; true when the linked order status becomes delivered.
--          A DB trigger keeps Bellami and affiliate apps in sync (shared DB).

-- ==============================================
-- STEP 1: Column
-- ==============================================

ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS is_earned BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN commissions.is_earned IS
  'false when commission is snapshotted at order create; true once order.status is delivered';

CREATE INDEX IF NOT EXISTS idx_commissions_partner_is_earned
  ON commissions(partner_id, is_earned);

-- ==============================================
-- STEP 2: Backfill existing delivered orders
-- ==============================================

UPDATE commissions c
SET is_earned = TRUE
FROM orders o
WHERE c.order_id = o.id
  AND LOWER(COALESCE(o.status, '')) = 'delivered'
  AND c.is_earned = FALSE;

-- ==============================================
-- STEP 3: Trigger — mark earned when order becomes delivered
-- ==============================================

CREATE OR REPLACE FUNCTION mark_commission_earned_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF LOWER(COALESCE(NEW.status, '')) = 'delivered'
     AND LOWER(COALESCE(OLD.status, '')) IS DISTINCT FROM 'delivered' THEN
    UPDATE commissions
    SET is_earned = TRUE
    WHERE order_id = NEW.id
      AND is_earned = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_commission_earned_on_delivery ON orders;

CREATE TRIGGER trigger_mark_commission_earned_on_delivery
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION mark_commission_earned_on_delivery();
