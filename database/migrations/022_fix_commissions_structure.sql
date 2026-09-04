-- Migration: Fix Commissions Table Structure
-- Purpose: Add order_item_id, remove product_id, ensure proper per-item commission tracking
-- Date: 2024-01-XX
-- Description: 
--   - Commissions are per order_item (not per order)
--   - Remove product_id (get via JOIN from order_item → product_design → product)
--   - Keep order_id for easier queries
--   - Commissions created when order is created (status='pending')
--   - Status changes to 'approved' when order is delivered

-- ==============================================
-- STEP 1: Add order_item_id column
-- ==============================================

-- Add order_item_id column (nullable initially for migration)
ALTER TABLE commissions 
ADD COLUMN order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE;

-- ==============================================
-- STEP 2: Migrate existing data (if any)
-- ==============================================

-- If you have existing commissions data, link them to order_items
-- Note: This assumes one commission per order. You may need to adjust based on your data.
-- UPDATE commissions c
-- SET order_item_id = (
--   SELECT oi.id 
--   FROM order_items oi 
--   WHERE oi.order_id = c.order_id 
--   LIMIT 1
-- )
-- WHERE order_item_id IS NULL;

-- ==============================================
-- STEP 3: Make order_item_id required (after data migration)
-- ==============================================

-- Uncomment after data migration is complete:
-- ALTER TABLE commissions 
-- ALTER COLUMN order_item_id SET NOT NULL;

-- ==============================================
-- STEP 4: Remove product_id column
-- ==============================================

-- Drop the product_id column (can get it via JOIN if needed)
ALTER TABLE commissions 
DROP COLUMN IF EXISTS product_id;

-- ==============================================
-- STEP 5: Update indexes
-- ==============================================

-- Add index for order_item_id
CREATE INDEX IF NOT EXISTS idx_commissions_order_item_id 
ON commissions(order_item_id);

-- ==============================================
-- STEP 6: Add comments for documentation
-- ==============================================

COMMENT ON COLUMN commissions.order_item_id IS 'Reference to order item - commissions are per order item, not per order';
COMMENT ON COLUMN commissions.order_id IS 'Reference to order - kept for easier queries and aggregations';
COMMENT ON COLUMN commissions.status IS 'Commission status: pending (created with order), approved (when order delivered), paid, cancelled';

-- ==============================================
-- STEP 7: Ensure order_id is NOT NULL (for easier queries)
-- ==============================================

-- Make sure order_id is NOT NULL (it should be since commissions come from orders)
ALTER TABLE commissions 
ALTER COLUMN order_id SET NOT NULL;

