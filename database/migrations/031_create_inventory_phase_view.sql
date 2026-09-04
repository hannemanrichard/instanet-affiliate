DROP FUNCTION IF EXISTS public.get_product_phase_summary(integer);
DROP FUNCTION IF EXISTS public.get_product_phase_details(integer, text);
DROP FUNCTION IF EXISTS public.refresh_product_inventory_phase_details();
DROP MATERIALIZED VIEW IF EXISTS public.product_inventory_phase_details;


CREATE MATERIALIZED VIEW public.product_inventory_phase_details
WITH (fillfactor = 100) AS
SELECT
  i.product_id,
  lower(COALESCE(i.product, ''::text)) AS product_name,
  COALESCE(i.color, 'unspecified'::text) AS color,
  i.color_hex,
  COALESCE(i.size, 'unsized'::text) AS size,
  CASE
    WHEN o.status = 'initial' THEN 'ordered'
    WHEN o.status = 'processing' THEN 'in_delivery'
    WHEN o.status = 'returned'
      AND o.yalidine_status IS DISTINCT FROM 'Retour à retirer'
      AND o.dc_recent_status IS DISTINCT FROM 'recupere_par_fournisseur'
      THEN 'in_delivery'
    WHEN o.status = 'delivered' THEN 'delivered'
    ELSE 'other'
  END AS phase,
  sum(COALESCE(oi.qty, 1::bigint))::bigint AS units
FROM public.order_item AS oi
JOIN public.items AS i ON i.id = oi.item_id
JOIN public.orders AS o ON o.id = oi.order_id
WHERE COALESCE(o.is_exchange, false) = false
GROUP BY
  i.product_id,
  lower(COALESCE(i.product, ''::text)),
  COALESCE(i.color, 'unspecified'::text),
  i.color_hex,
  COALESCE(i.size, 'unsized'::text),
  CASE
    WHEN o.status = 'initial' THEN 'ordered'
    WHEN o.status = 'processing' THEN 'in_delivery'
    WHEN o.status = 'returned'
      AND o.yalidine_status IS DISTINCT FROM 'Retour à retirer'
      AND o.dc_recent_status IS DISTINCT FROM 'recupere_par_fournisseur'
      THEN 'in_delivery'
    WHEN o.status = 'delivered' THEN 'delivered'
    ELSE 'other'
  END
WITH NO DATA;


CREATE INDEX product_inventory_phase_details_product_idx
  ON public.product_inventory_phase_details (product_id, phase, color, size);


CREATE UNIQUE INDEX product_inventory_phase_details_group_idx
  ON public.product_inventory_phase_details (
    product_id,
    product_name,
    color,
    size,
    phase
  );


GRANT SELECT ON public.product_inventory_phase_details TO anon;
GRANT SELECT ON public.product_inventory_phase_details TO authenticated;
GRANT SELECT ON public.product_inventory_phase_details TO service_role;


CREATE OR REPLACE FUNCTION public.refresh_product_inventory_phase_details()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_inventory_phase_details;
$$;


CREATE OR REPLACE FUNCTION public.get_product_phase_details(
  product_id_in integer,
  phase_in text
)
RETURNS TABLE (
  color text,
  color_hex text,
  size text,
  units bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    d.color,
    d.color_hex,
    d.size,
    d.units
  FROM public.product_inventory_phase_details AS d
  WHERE d.product_id = product_id_in
    AND d.phase = phase_in;
$$;


CREATE OR REPLACE FUNCTION public.get_product_phase_summary(
  product_id_in integer
)
RETURNS TABLE (
  phase text,
  units bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    d.phase,
    SUM(d.units) AS units
  FROM public.product_inventory_phase_details AS d
  WHERE d.product_id = product_id_in
  GROUP BY d.phase;
$$;


-- First population must be non-concurrent (CONCURRENTLY requires existing data).
REFRESH MATERIALIZED VIEW public.product_inventory_phase_details;
