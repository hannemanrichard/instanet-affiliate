-- Migration: product_page_assets
-- Purpose: Per–product-page media library (upload shelf only).
-- Does NOT replace hero_media, video_url, product_page_images, or product_page_testimonials.

CREATE TABLE IF NOT EXISTS public.product_page_assets (
  id bigserial PRIMARY KEY,
  product_page_id bigint NOT NULL REFERENCES public.product_pages (id) ON DELETE CASCADE,
  url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name text NULL
);

CREATE INDEX IF NOT EXISTS product_page_assets_page_idx
  ON public.product_page_assets (product_page_id);

COMMENT ON TABLE public.product_page_assets IS
  'Per–product-page media library. Usage slots (hero/gallery/testimonials/video) remain on existing columns/tables.';
