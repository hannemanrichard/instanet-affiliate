DROP FUNCTION IF EXISTS public.bulk_update_product_inventory(integer, jsonb);
DROP FUNCTION IF EXISTS public.bulk_update_product_inventory(integer, json);

CREATE OR REPLACE FUNCTION public.bulk_update_product_inventory(
  product_id_in integer,
  adjustments_in jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adjustment_record RECORD;
BEGIN
  IF adjustments_in IS NULL OR jsonb_typeof(adjustments_in) <> 'array' THEN
    RAISE EXCEPTION 'adjustments_in must be a JSON array';
  END IF;

  FOR adjustment_record IN
    SELECT
      (value ->> 'item_id')::integer AS item_id,
      GREATEST(0, COALESCE((value ->> 'quantity')::integer, 0)) AS quantity
    FROM jsonb_array_elements(adjustments_in) AS value
  LOOP
    UPDATE public.inventory AS inv
    SET quantity = adjustment_record.quantity
    WHERE inv.item_id = adjustment_record.item_id;
  END LOOP;
END;
$$;
