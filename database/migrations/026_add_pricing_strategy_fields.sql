-- Migration: Add Pricing Strategy Fields
-- Purpose: Track design markup and price change history
-- Date: 2024-01-XX
-- Description:
--   - Add design_markup to product_designs (markup over products.base_price)
--   - Add price_updated_at to track when prices change
--   - Pricing formula: price = products.base_price + design_markup

-- ==============================================
-- STEP 1: Add design_markup column
-- ==============================================

ALTER TABLE product_designs 
ADD COLUMN design_markup DECIMAL(10,2) NOT NULL DEFAULT 0.00;

COMMENT ON COLUMN product_designs.design_markup IS 'Markup amount added to products.base_price to calculate price';

-- ==============================================
-- STEP 2: Add price_updated_at column
-- ==============================================

ALTER TABLE product_designs 
ADD COLUMN price_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN product_designs.price_updated_at IS 'Timestamp when price was last updated (NULL if never updated, defaults to created_at)';

-- ==============================================
-- STEP 3: Set initial price_updated_at for existing records
-- ==============================================

-- Set price_updated_at = created_at for existing product_designs
-- (assuming they were created with their initial price)
UPDATE product_designs 
SET price_updated_at = created_at 
WHERE price_updated_at IS NULL;

-- ==============================================
-- STEP 4: Calculate design_markup for existing records (if possible)
-- ==============================================

-- If you have existing product_designs with prices, calculate markup:
-- UPDATE product_designs pd
-- SET design_markup = pd.price - p.base_price
-- FROM products p
-- WHERE pd.product_id = p.id
--   AND pd.design_markup = 0.00;  -- Only update if still at default

-- ==============================================
-- STEP 5: Create trigger to update price_updated_at when price changes
-- ==============================================

CREATE OR REPLACE FUNCTION update_product_design_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update timestamp if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    NEW.price_updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_design_price_timestamp
  BEFORE UPDATE ON product_designs
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price)
  EXECUTE FUNCTION update_product_design_price_timestamp();

COMMENT ON FUNCTION update_product_design_price_timestamp() IS 'Updates price_updated_at when product_designs.price changes';

-- ==============================================
-- STEP 6: Optional: Create trigger to auto-calculate price from base_price + markup
-- ==============================================

-- Option A: Auto-calculate price when design_markup or base_price changes
-- Uncomment if you want automatic price calculation:
-- 
-- CREATE OR REPLACE FUNCTION calculate_product_design_price()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   base_price DECIMAL(10,2);
-- BEGIN
--   -- Get base_price from products table
--   SELECT p.base_price INTO base_price
--   FROM products p
--   WHERE p.id = NEW.product_id;
--   
--   -- Calculate price = base_price + design_markup
--   IF base_price IS NOT NULL THEN
--     NEW.price = base_price + COALESCE(NEW.design_markup, 0);
--   END IF;
--   
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- CREATE TRIGGER trigger_calculate_product_design_price
--   BEFORE INSERT OR UPDATE ON product_designs
--   FOR EACH ROW
--   EXECUTE FUNCTION calculate_product_design_price();
-- 
-- NOTE: If you enable this trigger, price will be auto-calculated and you can't manually override it.
-- Recommendation: Keep price manual for flexibility, use design_markup as reference.

-- ==============================================
-- STEP 7: Add index for price tracking queries
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_product_designs_price_updated_at 
ON product_designs(price_updated_at);

