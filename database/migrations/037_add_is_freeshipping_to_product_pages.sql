-- Migration: Add free shipping flag to product pages

ALTER TABLE product_pages
  ADD COLUMN IF NOT EXISTS is_freeshipping BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN product_pages.is_freeshipping IS 'Indicates whether the product page offers free shipping';



