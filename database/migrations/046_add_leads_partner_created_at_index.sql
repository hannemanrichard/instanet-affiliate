-- Index to support partner-scoped lead list pagination ordered by created_at.
CREATE INDEX IF NOT EXISTS idx_leads_partner_created_at
  ON public.leads (partner_id, created_at DESC);
