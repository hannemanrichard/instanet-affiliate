-- SQL aggregates for partner/admin summary cards (avoids loading all rows into JS).

CREATE OR REPLACE FUNCTION public.get_order_summary(p_partner_id integer DEFAULT NULL)
RETURNS TABLE (
  total_orders bigint,
  total_processing bigint,
  total_delivered bigint,
  total_value numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::bigint AS total_orders,
    COUNT(*) FILTER (WHERE status = 'processing')::bigint AS total_processing,
    COUNT(*) FILTER (WHERE status = 'delivered')::bigint AS total_delivered,
    COALESCE(
      SUM(COALESCE(product_price, 0) * COALESCE(product_qty, 0)),
      0
    )::numeric AS total_value
  FROM public.orders
  WHERE p_partner_id IS NULL OR partner_id = p_partner_id;
$$;

CREATE OR REPLACE FUNCTION public.get_lead_summary(p_partner_id integer DEFAULT NULL)
RETURNS TABLE (
  total_leads bigint,
  total_pending bigint,
  total_confirmed bigint,
  total_wholesale bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::bigint AS total_leads,
    COUNT(*) FILTER (WHERE status IN ('new', 'contacted'))::bigint AS total_pending,
    COUNT(*) FILTER (WHERE status = 'converted')::bigint AS total_confirmed,
    COUNT(*) FILTER (WHERE is_wholesale IS TRUE)::bigint AS total_wholesale
  FROM public.leads
  WHERE p_partner_id IS NULL OR partner_id = p_partner_id;
$$;

COMMENT ON FUNCTION public.get_order_summary(integer) IS
  'Aggregate order summary for a partner (or all partners when null)';

COMMENT ON FUNCTION public.get_lead_summary(integer) IS
  'Aggregate lead summary for a partner (or all partners when null)';
