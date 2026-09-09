-- Affiliate support claims (separate from ops `claims` table)

CREATE TABLE affiliate_claims (
  id BIGSERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT affiliate_claims_category_check CHECK (
    category IN (
      'delivery_delay',
      'lost_parcel',
      'damaged',
      'wrong_item',
      'exchange_request',
      'contact_delivery_company',
      'other'
    )
  ),
  CONSTRAINT affiliate_claims_status_check CHECK (
    status IN ('open', 'in_progress', 'resolved', 'rejected')
  )
);

CREATE TABLE affiliate_claim_attachments (
  id BIGSERIAL PRIMARY KEY,
  claim_id BIGINT NOT NULL REFERENCES affiliate_claims(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_claims_partner_created_at
  ON affiliate_claims(partner_id, created_at DESC);

CREATE INDEX idx_affiliate_claims_status_created_at
  ON affiliate_claims(status, created_at DESC);

CREATE INDEX idx_affiliate_claims_order_id
  ON affiliate_claims(order_id);

CREATE INDEX idx_affiliate_claim_attachments_claim_id
  ON affiliate_claim_attachments(claim_id);
