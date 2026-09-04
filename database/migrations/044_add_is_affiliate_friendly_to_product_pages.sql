-- Migration: Mark which product pages affiliates can sell
-- Purpose: 1 product can have many pages; only affiliate-friendly pages
--          appear in the affiliate catalog and create-order picker.

ALTER TABLE product_pages
  ADD COLUMN IF NOT EXISTS is_affiliate_friendly BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN product_pages.is_affiliate_friendly IS
  'When true, the page is available to affiliates (catalog and create-order).';

-- Keep existing active pages visible to affiliates after this ships.
UPDATE product_pages
SET is_affiliate_friendly = TRUE
WHERE is_active IS TRUE
  AND is_affiliate_friendly = FALSE;
