-- Migration: Add tiered retail pricing to products for larger order quantities.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS retail_price_2 NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS retail_price_3 NUMERIC(12,2);

COMMENT ON COLUMN products.retail_price_2 IS 'Retail price per unit when ordering two units';
COMMENT ON COLUMN products.retail_price_3 IS 'Retail price per unit when ordering three units';


