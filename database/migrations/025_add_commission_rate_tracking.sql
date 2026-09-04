-- Migration: Add Base Commission Rate Tracking
-- Purpose: Track base commission rate from product_designs for audit and multiplier calculations
-- Date: 2024-01-XX
-- Description:
--   - Add base_commission_rate to track original rate from product_designs
--   - commission_rate will store the final effective rate (base × multipliers)
--   - Allows tracking multipliers and effective rates for audit purposes

-- ==============================================
-- STEP 1: Add base_commission_rate column
-- ==============================================

ALTER TABLE commissions 
ADD COLUMN base_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10;

COMMENT ON COLUMN commissions.base_commission_rate IS 'Base commission rate from product_designs.commission_rate at commission creation time';
COMMENT ON COLUMN commissions.commission_rate IS 'Final effective commission rate (base_rate × multipliers) used for calculation';

-- ==============================================
-- STEP 2: Update existing commissions (if any)
-- ==============================================

-- If you have existing commissions, set base_commission_rate = commission_rate
-- (assuming existing commission_rate values are the base rates)
-- UPDATE commissions 
-- SET base_commission_rate = commission_rate
-- WHERE base_commission_rate = 0.10; -- Only update if still at default

-- ==============================================
-- STEP 3: Add index for reporting (optional)
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_commissions_base_rate 
ON commissions(base_commission_rate);

-- ==============================================
-- STEP 4: Example Commission Calculation
-- ==============================================

-- Commission calculation example:
-- base_commission_rate = 0.10 (10% from product_designs)
-- tier_multiplier = 0.70 (Gold tier: +70%)
-- promo_multiplier = 0.30 (Holiday: +30%)
-- total_multiplier = 1 + 0.70 + 0.30 = 2.0
-- commission_rate = base_commission_rate × total_multiplier = 0.10 × 2.0 = 0.20 (20%)
-- amount = order_amount × commission_rate

-- Note: Multipliers are calculated in application layer, not stored in database
-- The base_commission_rate and commission_rate (final effective rate) are stored for audit

