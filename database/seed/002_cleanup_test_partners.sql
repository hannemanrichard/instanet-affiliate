-- ============================================================================
-- CLEANUP: Remove ALL seeded test data for test partners 42 & 45
-- ============================================================================
--
-- Deletes exactly the rows created by 001_seed_test_partners.sql and nothing
-- else. Old production data and any real activity of partners 42/45 are NOT
-- touched, because every delete is scoped by the seed markers:
--
--   orders      -> channel = 'test-seed' AND partner_id IN (42,45)
--   parcels     -> tracking LIKE 'TESTSEED-%' AND partner_id IN (42,45)
--   commissions -> removed automatically via ON DELETE CASCADE from orders
--   order_item  -> removed via parent order join (no cascade on this FK)
--   withdraws   -> exact sentinel created_at timestamps only:
--                    '2026-07-20 10:00:00+00'  (partner 42, paid)
--                    '2026-08-28 10:00:00+00'  (partner 42, pending)
--                    '2026-08-30 10:00:00+00'  (partner 45, pending)
--
-- What is deliberately NOT touched:
--   * partners 42/45 themselves (including payment settings filled by the seed
--     via COALESCE — removing them could erase details a partner later edited)
--   * products / items / product_pages / inventory (the seed only READS them)
--   * everything else in the database
--
-- Note: if you manually created extra rows that reference test orders
-- (e.g. returns, payment_orders) through the UI, delete those first —
-- otherwise the orders delete will fail on the FK and roll back safely.
--
-- HOW TO RUN:
--   Supabase Dashboard -> SQL Editor -> paste whole file -> Run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PRE-DELETE REPORT — what is about to be removed
-- ---------------------------------------------------------------------------
SELECT 'orders' AS entity, partner_id::text AS partner, COUNT(*) AS rows_to_delete
  FROM orders WHERE channel = 'test-seed' AND partner_id IN (42, 45) GROUP BY partner_id
UNION ALL
SELECT 'order_item', o.partner_id::text, COUNT(*)
  FROM order_item oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.channel = 'test-seed' AND o.partner_id IN (42, 45) GROUP BY o.partner_id
UNION ALL
SELECT 'commissions', c.partner_id::text, COUNT(*)
  FROM commissions c
  JOIN orders o ON o.id = c.order_id
  WHERE o.channel = 'test-seed' GROUP BY c.partner_id
UNION ALL
SELECT 'parcels', partner_id::text, COUNT(*)
  FROM parcels WHERE tracking LIKE 'TESTSEED-%' AND partner_id IN (42, 45) GROUP BY partner_id
UNION ALL
SELECT 'withdraws', partner_id::text, COUNT(*)
  FROM withdraws
  WHERE partner_id IN (42, 45)
    AND created_at IN (
          TIMESTAMPTZ '2026-07-20 10:00:00+00',
          TIMESTAMPTZ '2026-08-28 10:00:00+00',
          TIMESTAMPTZ '2026-08-30 10:00:00+00'
        )
  GROUP BY partner_id
ORDER BY 1, 2;

BEGIN;

-- 1 · order_item lines of test orders (FK has no cascade — must go first)
DELETE FROM order_item
 WHERE order_id IN (
   SELECT id FROM orders WHERE channel = 'test-seed' AND partner_id IN (42, 45)
 );

-- 2 · parcels mirrored from test orders
DELETE FROM parcels
 WHERE tracking LIKE 'TESTSEED-%' AND partner_id IN (42, 45);

-- 3 · test orders (commissions cascade automatically)
DELETE FROM orders
 WHERE channel = 'test-seed' AND partner_id IN (42, 45);

-- 4 · seeded withdraws (sentinel timestamps only)
DELETE FROM withdraws
 WHERE partner_id IN (42, 45)
   AND created_at IN (
         TIMESTAMPTZ '2026-07-20 10:00:00+00',
         TIMESTAMPTZ '2026-08-28 10:00:00+00',
         TIMESTAMPTZ '2026-08-30 10:00:00+00'
       );

COMMIT;

-- ---------------------------------------------------------------------------
-- POST-DELETE VERIFICATION — every count must be 0
-- ---------------------------------------------------------------------------
SELECT 'orders' AS entity, COUNT(*) AS remaining
  FROM orders WHERE channel = 'test-seed' AND partner_id IN (42, 45)
UNION ALL
SELECT 'commissions', COUNT(*)
  FROM commissions c
  JOIN orders o ON o.id = c.order_id
  WHERE o.channel = 'test-seed'
UNION ALL
SELECT 'parcels', COUNT(*)
  FROM parcels WHERE tracking LIKE 'TESTSEED-%' AND partner_id IN (42, 45)
UNION ALL
SELECT 'withdraws', COUNT(*)
  FROM withdraws
  WHERE partner_id IN (42, 45)
    AND created_at IN (
          TIMESTAMPTZ '2026-07-20 10:00:00+00',
          TIMESTAMPTZ '2026-08-28 10:00:00+00',
          TIMESTAMPTZ '2026-08-30 10:00:00+00'
        )
ORDER BY 1;
