-- Migration: Add video_url to product pages

ALTER TABLE product_pages
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN product_pages.video_url IS 'URL to the video file for the product page';

