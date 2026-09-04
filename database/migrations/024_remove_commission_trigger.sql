-- Migration: Remove Commission Amount Trigger
-- Purpose: Remove auto-calculation trigger for commissions.amount to allow manual calculation
-- Date: 2024-01-XX
-- Description: 
--   - Commission amounts need manual calculation to support special rates/bonuses
--   - Remove trigger_calculate_commission_amount trigger
--   - Remove calculate_commission_amount() function

-- ==============================================
-- STEP 1: Drop Commission Trigger (if exists)
-- ==============================================

DROP TRIGGER IF EXISTS trigger_calculate_commission_amount ON commissions;

-- ==============================================
-- STEP 2: Drop Commission Calculation Function (if exists)
-- ==============================================

DROP FUNCTION IF EXISTS calculate_commission_amount();

-- ==============================================
-- STEP 3: Verify Remaining Triggers (Optional - for reference)
-- ==============================================

-- The following triggers should remain active:
-- ✅ trigger_calculate_order_item_total (on order_items)
-- ✅ trigger_calculate_order_total (on orders)
-- ✅ trigger_update_order_total_on_item_insert (on order_items)
-- ✅ trigger_update_order_total_on_item_update (on order_items)
-- ✅ trigger_update_order_total_on_item_delete (on order_items)
-- ✅ trigger_update_order_total_on_shipping_change (on orders)

-- To verify triggers exist:
-- SELECT trigger_name, event_object_table, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
--   AND event_object_table IN ('order_items', 'orders', 'commissions')
-- ORDER BY event_object_table, trigger_name;

