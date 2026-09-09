-- Affiliate Marketplace post tracking (Instanet Helper activity)

CREATE TABLE affiliate_marketplace_posts (
  id BIGSERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  partner_email TEXT NOT NULL,
  product_page_id INTEGER NOT NULL REFERENCES product_pages(id),
  product_title TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DZD',
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft_opened',
  marketplace_post_url TEXT,
  extension_version TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT affiliate_marketplace_posts_status_check CHECK (
    status IN ('draft_opened', 'published', 'failed')
  )
);

CREATE INDEX idx_affiliate_marketplace_posts_partner_created_at
  ON affiliate_marketplace_posts(partner_id, created_at DESC);

CREATE INDEX idx_affiliate_marketplace_posts_status_created_at
  ON affiliate_marketplace_posts(status, created_at DESC);

CREATE INDEX idx_affiliate_marketplace_posts_product_page_id
  ON affiliate_marketplace_posts(product_page_id);
