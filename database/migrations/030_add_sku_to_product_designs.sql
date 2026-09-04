-- Migration: Add SKU column to product_designs table
-- Purpose: Enable SKU-based search for product designs
-- Date: 2024-12-XX
-- Description:
--   Adds a nullable SKU column to product_designs table to improve product search experience.
--   SKU is optional and can be set for product designs that need to be searchable by SKU.

BEGIN;

-- Add SKU column to product_designs table
ALTER TABLE product_designs 
ADD COLUMN IF NOT EXISTS sku VARCHAR(255) NULL;

-- Add unique index on SKU (only for non-null values)
-- This ensures SKU uniqueness when provided, but allows multiple NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_designs_sku_unique 
ON product_designs(sku) 
WHERE sku IS NOT NULL;

-- Add regular index for SKU searches (even when NULL)
CREATE INDEX IF NOT EXISTS idx_product_designs_sku 
ON product_designs(sku);

-- Add comment
COMMENT ON COLUMN product_designs.sku IS 'Optional SKU for product design search and identification';

COMMIT;

