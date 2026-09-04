-- Migration: Verify and Complete Database Improvements
-- Purpose: Final verification and completion of migrations 022-026
-- Date: 2024-01-XX
-- Description:
--   This migration verifies the current state and completes any missing pieces
--   from migrations 022-026. Safe to run multiple times (uses IF EXISTS/NOT EXISTS).

BEGIN;

-- ==============================================
-- STEP 1: Complete Migration 022 - Make order_item_id NOT NULL
-- ==============================================

-- First, update any NULL values (if they exist) - SET YOUR LOGIC HERE
-- Example: Link to first order_item for each order (if needed)
-- UPDATE commissions c
-- SET order_item_id = (
--   SELECT oi.id 
--   FROM order_items oi 
--   WHERE oi.order_id = c.order_id 
--   LIMIT 1
-- )
-- WHERE order_item_id IS NULL;

-- Make order_item_id NOT NULL (will fail if NULL values exist)
-- Uncomment after ensuring all commissions have order_item_id:
-- ALTER TABLE commissions 
-- ALTER COLUMN order_item_id SET NOT NULL;

-- Add index if missing
CREATE INDEX IF NOT EXISTS idx_commissions_order_item_id 
ON commissions(order_item_id);

-- Add comments
COMMENT ON COLUMN commissions.order_item_id IS 'Reference to order item - commissions are per order item, not per order';
COMMENT ON COLUMN commissions.order_id IS 'Reference to order - kept for easier queries and aggregations';
COMMENT ON COLUMN commissions.base_commission_rate IS 'The base commission rate from product_designs at the time of commission creation.';

-- ==============================================
-- STEP 2: Verify Migration 023 - Add Calculated Field Triggers
-- ==============================================

-- Create function to calculate order item total
CREATE OR REPLACE FUNCTION calculate_order_item_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate total_price from unit_price and quantity
  IF NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
    NEW.total_price = NEW.unit_price * NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order_items.total_price (drop if exists first)
DROP TRIGGER IF EXISTS trigger_calculate_order_item_total ON order_items;
CREATE TRIGGER trigger_calculate_order_item_total
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  WHEN (NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL)
  EXECUTE FUNCTION calculate_order_item_total();

COMMENT ON FUNCTION calculate_order_item_total() IS 'Auto-calculates order_items.total_price = unit_price * quantity';

-- Create function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  items_total DECIMAL(10,2);
BEGIN
  -- Calculate sum of all order_items.total_price for this order
  SELECT COALESCE(SUM(total_price), 0)
  INTO items_total
  FROM order_items
  WHERE order_id = COALESCE(NEW.id, OLD.id);
  
  -- Calculate total: items_total + shipping_cost - discount_amount
  NEW.total = items_total + COALESCE(NEW.shipping_cost, 0) - COALESCE(NEW.discount_amount, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders.total (drop if exists first)
DROP TRIGGER IF EXISTS trigger_calculate_order_total ON orders;
CREATE TRIGGER trigger_calculate_order_total
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_total();

COMMENT ON FUNCTION calculate_order_total() IS 'Auto-calculates orders.total = SUM(order_items.total_price) + shipping_cost - discount_amount';

-- Create function to update order total when items change
CREATE OR REPLACE FUNCTION update_order_total_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
  items_total DECIMAL(10,2);
  target_order_id UUID;
BEGIN
  -- Get the order_id from NEW or OLD
  target_order_id := COALESCE(NEW.order_id, OLD.order_id);
  
  -- Calculate new total from all items
  SELECT COALESCE(SUM(total_price), 0)
  INTO items_total
  FROM order_items
  WHERE order_id = target_order_id;
  
  -- Update the order total
  UPDATE orders
  SET total = items_total + COALESCE(shipping_cost, 0) - COALESCE(discount_amount, 0),
      updated_at = NOW()
  WHERE id = target_order_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for order total updates (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_order_total_on_item_insert ON order_items;
CREATE TRIGGER trigger_update_order_total_on_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total_on_item_change();

DROP TRIGGER IF EXISTS trigger_update_order_total_on_item_update ON order_items;
CREATE TRIGGER trigger_update_order_total_on_item_update
  AFTER UPDATE ON order_items
  FOR EACH ROW
  WHEN (OLD.unit_price IS DISTINCT FROM NEW.unit_price 
    OR OLD.quantity IS DISTINCT FROM NEW.quantity
    OR OLD.total_price IS DISTINCT FROM NEW.total_price)
  EXECUTE FUNCTION update_order_total_on_item_change();

DROP TRIGGER IF EXISTS trigger_update_order_total_on_item_delete ON order_items;
CREATE TRIGGER trigger_update_order_total_on_item_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total_on_item_change();

DROP TRIGGER IF EXISTS trigger_update_order_total_on_shipping_change ON orders;
CREATE TRIGGER trigger_update_order_total_on_shipping_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.shipping_cost IS DISTINCT FROM NEW.shipping_cost 
    OR OLD.discount_amount IS DISTINCT FROM NEW.discount_amount)
  EXECUTE FUNCTION calculate_order_total();

COMMENT ON FUNCTION update_order_total_on_item_change() IS 'Updates orders.total when order_items change (insert/update/delete)';

-- ==============================================
-- STEP 3: Migration 024 - Remove Commission Trigger (Safe)
-- ==============================================

DROP TRIGGER IF EXISTS trigger_calculate_commission_amount ON commissions;
DROP FUNCTION IF EXISTS calculate_commission_amount();

-- ==============================================
-- STEP 4: Migration 026 - Verify Price Update Trigger
-- ==============================================

-- Create function to update price_updated_at when price changes
CREATE OR REPLACE FUNCTION update_product_design_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price OR NEW.design_markup IS DISTINCT FROM OLD.design_markup THEN
    NEW.price_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_product_design_price_timestamp ON product_designs;
CREATE TRIGGER trigger_update_product_design_price_timestamp
  BEFORE UPDATE ON product_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_product_design_price_timestamp();

COMMENT ON FUNCTION update_product_design_price_timestamp() IS 'Updates price_updated_at timestamp on product_designs when price or design_markup changes.';

-- ==============================================
-- STEP 5: Ensure order_id is NOT NULL in commissions
-- ==============================================

-- Verify and set NOT NULL if needed
-- ALTER TABLE commissions 
-- ALTER COLUMN order_id SET NOT NULL;

COMMIT;

-- ==============================================
-- VERIFICATION QUERIES (Run separately to verify)
-- ==============================================

-- Check triggers exist
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'public'
--   AND event_object_table IN ('order_items', 'orders', 'product_designs')
--   AND trigger_name LIKE '%total%' OR trigger_name LIKE '%price%';

-- Check commissions structure
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'commissions'
--   AND column_name IN ('order_item_id', 'order_id', 'base_commission_rate');

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename = 'commissions'
--   AND indexname = 'idx_commissions_order_item_id';
