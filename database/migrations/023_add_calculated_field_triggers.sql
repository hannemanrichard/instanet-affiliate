-- Migration: Add Triggers for Calculated Fields
-- Purpose: Auto-calculate denormalized fields to maintain data consistency
-- Date: 2024-01-XX
-- Description:
--   - order_items.total_price = unit_price * quantity
--   - commissions.amount = order_amount * commission_rate
--   - orders.total = SUM(order_items.total_price) + shipping_cost - discount_amount

-- ==============================================
-- STEP 1: Create Function to Calculate Order Item Total
-- ==============================================

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

-- ==============================================
-- STEP 2: Create Trigger for order_items.total_price
-- ==============================================

CREATE TRIGGER trigger_calculate_order_item_total
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  WHEN (NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL)
  EXECUTE FUNCTION calculate_order_item_total();

COMMENT ON FUNCTION calculate_order_item_total() IS 'Auto-calculates order_items.total_price = unit_price * quantity';

-- ==============================================
-- STEP 3: Commission Amount Calculation
-- ==============================================
-- NOTE: commissions.amount is NOT auto-calculated via trigger
-- Reason: Special commission rates (e.g., +50% rewards) need to override standard calculation
-- The amount should be calculated in the application layer to allow for:
--   - Standard rate: amount = order_amount * commission_rate
--   - Special rates: amount = order_amount * (commission_rate + bonus_rate)
--   - Fixed bonuses: amount = standard_amount + fixed_bonus
-- 
-- The commission_rate field stores the base rate, but amount can be set independently
-- for promotional or reward commissions.

-- ==============================================
-- STEP 5: Create Function to Calculate Order Total
-- ==============================================

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

-- ==============================================
-- STEP 6: Create Trigger for orders.total
-- ==============================================

CREATE TRIGGER trigger_calculate_order_total
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_total();

COMMENT ON FUNCTION calculate_order_total() IS 'Auto-calculates orders.total = SUM(order_items.total_price) + shipping_cost - discount_amount';

-- ==============================================
-- STEP 7: Create Function to Update Order Total When Items Change
-- ==============================================

-- This trigger updates the order.total when order_items are inserted, updated, or deleted
CREATE OR REPLACE FUNCTION update_order_total_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
  items_total DECIMAL(10,2);
  order_record RECORD;
BEGIN
  -- Get the order_id from NEW or OLD
  DECLARE
    target_order_id UUID;
  BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- STEP 8: Create Triggers to Update Order Total on Item Changes
-- ==============================================

-- Update order.total when order_item is inserted
CREATE TRIGGER trigger_update_order_total_on_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total_on_item_change();

-- Update order.total when order_item is updated
CREATE TRIGGER trigger_update_order_total_on_item_update
  AFTER UPDATE ON order_items
  FOR EACH ROW
  WHEN (OLD.unit_price IS DISTINCT FROM NEW.unit_price 
     OR OLD.quantity IS DISTINCT FROM NEW.quantity
     OR OLD.total_price IS DISTINCT FROM NEW.total_price)
  EXECUTE FUNCTION update_order_total_on_item_change();

-- Update order.total when order_item is deleted
CREATE TRIGGER trigger_update_order_total_on_item_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total_on_item_change();

-- Update order.total when order shipping_cost or discount_amount changes
CREATE TRIGGER trigger_update_order_total_on_shipping_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.shipping_cost IS DISTINCT FROM NEW.shipping_cost 
     OR OLD.discount_amount IS DISTINCT FROM NEW.discount_amount)
  EXECUTE FUNCTION calculate_order_total();

COMMENT ON FUNCTION update_order_total_on_item_change() IS 'Updates orders.total when order_items change (insert/update/delete)';

