-- Migration: Track which product page an order item came from
-- Purpose: Affiliates sell via product pages (1 page → 1 product, 1 product → many pages).
--          product_page_id is nullable so existing order_item rows remain valid.

ALTER TABLE order_item
  ADD COLUMN IF NOT EXISTS product_page_id INTEGER NULL
  REFERENCES product_pages(id) ON DELETE SET NULL;

COMMENT ON COLUMN order_item.product_page_id IS
  'Product page this order line originated from. Nullable for legacy rows.';

CREATE INDEX IF NOT EXISTS idx_order_item_product_page_id
  ON order_item(product_page_id);
