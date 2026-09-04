CREATE TABLE IF NOT EXISTS public.product_page_images (
  id bigserial PRIMARY KEY,
  product_page_id bigint NOT NULL REFERENCES public.product_pages (id) ON DELETE CASCADE,
  url text NOT NULL
);

CREATE INDEX IF NOT EXISTS product_page_images_page_idx
  ON public.product_page_images (product_page_id);

