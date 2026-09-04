-- ============================================================================
-- SEED: Realistic test data for test partners 42 & 45
-- ============================================================================
--
-- Targets:
--   partner 42  (hannemanrichard7@gmail.com) — "established" affiliate
--   partner 45  (valorios80@gmail.com)       — "newer" affiliate
--
-- What it creates (per run):
--   partner 42: 8 orders, 9 order_item lines, 8 commissions, 6 parcels,
--               2 withdraws (1 paid, 1 pending)
--   partner 45: 4 orders, 4 order_item lines, 4 commissions, 3 parcels,
--               1 pending withdraw
--
-- Safety / isolation (how cleanup finds ONLY this data):
--   orders        -> channel = 'test-seed' AND partner_id IN (42,45)
--   parcels       -> tracking LIKE 'TESTSEED-%' AND partner_id IN (42,45)
--   commissions   -> removed automatically via ON DELETE CASCADE from orders
--   order_item    -> removed via parent order join
--   withdraws     -> exact sentinel created_at timestamps (see below); the app
--                    always writes NOW() with microseconds, so exact-to-the-second
--                    sentinel values cannot collide with real rows.
--
-- Sentinel withdraw timestamps (must stay in sync with 002_cleanup):
--   '2026-07-20 10:00:00+00'  (partner 42, paid)
--   '2026-08-28 10:00:00+00'  (partner 42, pending)
--   '2026-08-30 10:00:00+00'  (partner 45, pending)
--
-- Products / items / product_pages are NOT created: the seed reuses the
-- existing catalog (products with retail_commission > 0 that have at least
-- one item, preferring products with an active affiliate-friendly page).
--
-- The script is IDEMPOTENT: it starts by deleting any previous seed run
-- (same marker scope as the cleanup script), then inserts fresh rows.
--
-- Business rules enforced (mirrors src/features/orders orderApplicationService):
--   * commissions.unit_commission = products.retail_commission at order time
--   * commissions.unit_discount   = LEAST(discount, unit_commission)
--   * commissions.amount          = (unit_commission - unit_discount) * quantity
--   * orders.product_price        = retail_price - unit_discount (customer pays less)
--   * commissions.is_earned       = TRUE only for delivered orders
--     (the DB trigger only fires on UPDATE OF status, so direct INSERTs must
--      set it explicitly — done here)
--   * "ready to withdraw"         = order.dc_recent_status = 'encaisse'
--   * withdraw totals             <= ready total per partner
--
-- HOW TO RUN:
--   Supabase Dashboard -> SQL Editor -> paste whole file -> Run.
--   (Runs as postgres role, bypassing RLS. Do NOT run via the anon client.)
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- STEP 0 · Pre-flight checks: the two test partners must exist
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM partners WHERE id = 42) THEN
    RAISE EXCEPTION 'Seed aborted: partner 42 (hannemanrichard7@gmail.com) does not exist.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM partners WHERE id = 45) THEN
    RAISE EXCEPTION 'Seed aborted: partner 45 (valorios80@gmail.com) does not exist.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- STEP 1 · Remove any previous seed run (idempotency) — marker-scoped only
-- ---------------------------------------------------------------------------
DELETE FROM order_item
 WHERE order_id IN (
   SELECT id FROM orders WHERE channel = 'test-seed' AND partner_id IN (42, 45)
 );

DELETE FROM parcels
 WHERE tracking LIKE 'TESTSEED-%' AND partner_id IN (42, 45);

-- commissions are deleted by ON DELETE CASCADE together with the orders.
DELETE FROM orders
 WHERE channel = 'test-seed' AND partner_id IN (42, 45);

DELETE FROM withdraws
 WHERE partner_id IN (42, 45)
   AND created_at IN (
         TIMESTAMPTZ '2026-07-20 10:00:00+00',
         TIMESTAMPTZ '2026-08-28 10:00:00+00',
         TIMESTAMPTZ '2026-08-30 10:00:00+00'
       );

-- ---------------------------------------------------------------------------
-- STEP 2 · Pick existing catalog products to sell (nothing is created here)
-- ---------------------------------------------------------------------------
-- Up to 3 products that have a positive retail commission and at least one
-- item variant. Products with an active affiliate-friendly page are preferred,
-- because those are the ones affiliates can actually sell in the app.
CREATE TEMP TABLE seed_products ON COMMIT DROP AS
SELECT
  p.id,
  p.name,
  p.retail_price,
  p.retail_commission,
  p.store_id,
  ROW_NUMBER() OVER (
    ORDER BY EXISTS (
      SELECT 1 FROM product_pages pp
      WHERE pp.product_id = p.id
        AND pp.is_affiliate_friendly = TRUE
        AND pp.is_active = TRUE
    ) DESC,
    p.id
  ) AS rn
FROM products p
WHERE p.retail_commission IS NOT NULL
  AND p.retail_commission > 0
  AND p.retail_price IS NOT NULL
  AND p.retail_price > 0
  AND EXISTS (SELECT 1 FROM items i WHERE i.product_id = p.id)
ORDER BY rn
LIMIT 3;

-- First variant (item) of each picked product.
CREATE TEMP TABLE seed_items ON COMMIT DROP AS
SELECT
  sp.rn AS product_rn,
  i.id  AS item_id,
  i.color,
  i.size
FROM seed_products sp
JOIN LATERAL (
  SELECT id, color, size
  FROM items
  WHERE product_id = sp.id
  ORDER BY id
  LIMIT 1
) i ON TRUE;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM seed_products) < 3 THEN
    RAISE EXCEPTION 'Seed aborted: need at least 3 existing products with retail_commission > 0 and at least one item. Found %.',
      (SELECT COUNT(*) FROM seed_products);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- STEP 3 · Order specifications (the whole scenario lives in this table)
-- ---------------------------------------------------------------------------
-- qty            = total quantity on the order (orders.product_qty)
-- discount       = per-unit affiliate discount requested (capped at commission)
-- has_tracking   = whether a ZR parcel/tracking exists for the order
-- age_days       = created_at = NOW() - age_days
-- modified_days  = modified_at = NOW() - modified_days (NULL for initial)
-- second_*       = optional second order line (multi-item order)
CREATE TEMP TABLE seed_order_specs (
  seed_key           TEXT PRIMARY KEY,
  partner_id         INT     NOT NULL,
  product_rn         INT     NOT NULL,
  status             TEXT    NOT NULL,
  first_name         TEXT    NOT NULL,
  last_name          TEXT    NOT NULL,
  phone              TEXT    NOT NULL,
  phone2             TEXT,
  address            TEXT,
  commune            TEXT,
  wilaya             TEXT,
  qty                INT     NOT NULL,
  discount           NUMERIC NOT NULL DEFAULT 0,
  delivery_fees      NUMERIC NOT NULL,
  dc_recent_status   TEXT,
  has_tracking       BOOLEAN NOT NULL DEFAULT FALSE,
  age_days           INT     NOT NULL,
  modified_days      INT,
  second_product_rn  INT,
  second_qty         INT
) ON COMMIT DROP;

INSERT INTO seed_order_specs (
  seed_key, partner_id, product_rn, status,
  first_name, last_name, phone, phone2,
  address, commune, wilaya,
  qty, discount, delivery_fees, dc_recent_status,
  has_tracking, age_days, modified_days,
  second_product_rn, second_qty
) VALUES
  -- ---------------- partner 42 — established affiliate ----------------
  ('O42-01', 42, 1, 'delivered',  'Amine',   'Benali',     '0550123467', NULL,         'Cité 120 logements, Bt 14, Apt 3', 'Bab Ezzouar',  'Alger',       1, 0,   500, 'encaisse', TRUE, 55, 50, NULL, NULL),
  ('O42-02', 42, 2, 'delivered',  'Yasmine', 'Haddad',     '0661234578', NULL,         'Rue des Frères Bouadou N°27',      'Bir El Djir',  'Oran',        2, 100, 600, 'encaisse', TRUE, 42, 38, NULL, NULL),
  ('O42-03', 42, 1, 'delivered',  'Mohamed', 'Larbi',      '0770123459', '0554987612', 'Hay El Naser, Rue 5 N°12',         'El Khroub',    'Constantine', 2, 0,   550, NULL,       TRUE, 30, 26, 2,    1),
  ('O42-04', 42, 3, 'processing', 'Sara',    'Boumediene', '0555123460', NULL,         'Cité Boufarik N°45',               'Boufarik',     'Blida',       1, 0,   500, NULL,       TRUE, 12, 12, NULL, NULL),
  ('O42-05', 42, 2, 'processing', 'Karim',   'Ziani',      '0662123461', NULL,         'Rue Didouche Mourad N°8',         'El Eulma',     'Sétif',       1, 50,  500, NULL,       TRUE, 8,  8,  NULL, NULL),
  ('O42-06', 42, 1, 'returned',   'Nadia',   'Cherif',     '0773123462', NULL,         'Cité des Oliviers N°21',           'El Bouni',     'Annaba',      1, 0,   600, NULL,       TRUE, 35, 31, NULL, NULL),
  ('O42-07', 42, 3, 'cancelled',  'Walid',   'Mansouri',   '0554123463', NULL,         'Hay Essalem N°17',                 'Azazga',       'Tizi Ouzou',  1, 0,   450, NULL,       FALSE, 20, 19, NULL, NULL),
  ('O42-08', 42, 2, 'initial',    'Lina',    'Kaci',       '0665123464', NULL,         'Rue de la Plage N°3',              'Akbou',        'Béjaïa',      1, 0,   500, NULL,       FALSE, 1,  1,  NULL, NULL),
  -- ---------------- partner 45 — newer affiliate ----------------------
  ('O45-01', 45, 1, 'delivered',  'Rania',   'Belkacem',   '0556123465', NULL,         'Cité 500 logements N°88',          'Bab Ezzouar',  'Alger',       1, 0,   500, 'encaisse', TRUE, 18, 15, NULL, NULL),
  ('O45-02', 45, 2, 'delivered',  'Sofiane', 'Meziane',    '0667123466', NULL,         'Rue Emir Abdelkader N°14',         'Bir El Djir',  'Oran',        1, 75,  600, NULL,       TRUE, 10, 7,  NULL, NULL),
  ('O45-03', 45, 1, 'processing', 'Imene',   'Saadi',      '0778123467', NULL,         'Cité Zouaghi N°30',               'El Khroub',    'Constantine', 1, 0,   550, NULL,       TRUE, 4,  4,  NULL, NULL),
  ('O45-04', 45, 3, 'initial',    'Djamel',  'Bouzid',     '0559123468', NULL,         'Hay El Badr N°6',                  'Boufarik',     'Blida',       1, 0,   500, NULL,       FALSE, 0,  0,  NULL, NULL);

-- ---------------------------------------------------------------------------
-- STEP 4 · Orders
-- ---------------------------------------------------------------------------
-- Mirrors mapCreateInputToInsert + app defaults:
--   agent_id = 1, tracker_id = 1, delivery_company = 'zr',
--   is_free_shipping = TRUE, shipping_price = delivery_fees,
--   product_price reduced by the (capped) affiliate discount.
INSERT INTO orders (
  partner_id, store_id, status,
  first_name, last_name, phone, phone2,
  address, commune, wilaya,
  product, product_color, product_size, product_price, product_qty,
  delivery_fees, shipping_price, delivery_company,
  agent_id, tracker_id,
  is_free_shipping, is_stopdesk,
  is_auto_delivered, is_exchange_required, has_defect, return_processed,
  channel, comment,
  dc_recent_status, tracking_id, parcel_id,
  created_at, modified_at
)
SELECT
  s.partner_id,
  sp.store_id,
  s.status,
  s.first_name,
  s.last_name,
  s.phone,
  s.phone2,
  s.address,
  s.commune,
  s.wilaya,
  sp.name,
  si.color,
  si.size,
  sp.retail_price - LEAST(s.discount, sp.retail_commission),
  s.qty,
  s.delivery_fees,
  s.delivery_fees,
  'zr',
  1,
  1,
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  'test-seed',
  '[TESTSEED] ' || s.seed_key,
  s.dc_recent_status,
  CASE WHEN s.has_tracking THEN 'TESTSEED-' || s.seed_key END,
  CASE WHEN s.has_tracking THEN md5('testseed-zr-' || s.seed_key)::uuid END,
  NOW() - make_interval(days => s.age_days),
  CASE WHEN s.status = 'initial' OR s.modified_days IS NULL THEN NULL
       ELSE NOW() - make_interval(days => s.modified_days) END
FROM seed_order_specs s
JOIN seed_products sp ON sp.rn = s.product_rn
JOIN seed_items    si ON si.product_rn = s.product_rn;

-- ---------------------------------------------------------------------------
-- STEP 5 · Order items (one line per order, plus the multi-item extra line)
-- ---------------------------------------------------------------------------
INSERT INTO order_item (order_id, item_id, qty, product_page_id)
SELECT
  o.id,
  si.item_id,
  s.qty - COALESCE(s.second_qty, 0),
  (SELECT pp.id
     FROM product_pages pp
    WHERE pp.product_id = sp.id
      AND pp.is_affiliate_friendly = TRUE
    ORDER BY pp.id
    LIMIT 1)
FROM seed_order_specs s
JOIN seed_products sp ON sp.rn = s.product_rn
JOIN seed_items    si ON si.product_rn = s.product_rn
JOIN orders o
  ON o.partner_id = s.partner_id
 AND o.channel = 'test-seed'
 AND o.comment = '[TESTSEED] ' || s.seed_key

UNION ALL

SELECT
  o.id,
  si2.item_id,
  s.second_qty,
  (SELECT pp.id
     FROM product_pages pp
    WHERE pp.product_id = sp2.id
      AND pp.is_affiliate_friendly = TRUE
    ORDER BY pp.id
    LIMIT 1)
FROM seed_order_specs s
JOIN seed_products sp2 ON sp2.rn = s.second_product_rn
JOIN seed_items    si2 ON si2.product_rn = s.second_product_rn
JOIN orders o
  ON o.partner_id = s.partner_id
 AND o.channel = 'test-seed'
 AND o.comment = '[TESTSEED] ' || s.seed_key
WHERE s.second_product_rn IS NOT NULL;

-- ---------------------------------------------------------------------------
-- STEP 6 · Commission snapshots (exactly one per order — unique index)
-- ---------------------------------------------------------------------------
-- amount = (unit_commission - unit_discount) * quantity
-- is_earned is set explicitly because the DB trigger only fires on
-- UPDATE OF status, not on INSERT.
INSERT INTO commissions (
  partner_id, order_id, product_id, product_name,
  quantity, unit_commission, unit_discount, amount,
  is_earned, created_at
)
SELECT
  s.partner_id,
  o.id,
  sp.id,
  sp.name,
  s.qty,
  sp.retail_commission,
  LEAST(s.discount, sp.retail_commission),
  (sp.retail_commission - LEAST(s.discount, sp.retail_commission)) * s.qty,
  (s.status = 'delivered'),
  o.created_at
FROM seed_order_specs s
JOIN seed_products sp ON sp.rn = s.product_rn
JOIN orders o
  ON o.partner_id = s.partner_id
 AND o.channel = 'test-seed'
 AND o.comment = '[TESTSEED] ' || s.seed_key;

-- ---------------------------------------------------------------------------
-- STEP 7 · Parcels (delivery mirror for shipped orders)
-- ---------------------------------------------------------------------------
INSERT INTO parcels (
  tracking, partner_id,
  first_name, last_name, phone,
  address, commune, wilaya,
  product, price, delivery_fee,
  last_status, payment_status,
  is_stopdesk, tracker_id, zr_parcel_id,
  created_at, date_last_status
)
SELECT
  'TESTSEED-' || s.seed_key,
  s.partner_id,
  s.first_name,
  s.last_name,
  s.phone,
  s.address,
  s.commune,
  s.wilaya,
  sp.name,
  (sp.retail_price - LEAST(s.discount, sp.retail_commission)) * s.qty,
  s.delivery_fees,
  CASE s.status
    WHEN 'delivered'  THEN 'Livré'
    WHEN 'processing' THEN 'En transit'
    WHEN 'returned'   THEN 'Retour au vendeur'
    ELSE 'En attente'
  END,
  CASE WHEN LOWER(COALESCE(s.dc_recent_status, '')) = 'encaisse'
       THEN 'paid' ELSE 'unpaid' END,
  FALSE,
  1,
  md5('testseed-zr-' || s.seed_key)::uuid,
  NOW() - make_interval(days => s.age_days),
  NOW() - make_interval(days => COALESCE(s.modified_days, s.age_days))
FROM seed_order_specs s
JOIN seed_products sp ON sp.rn = s.product_rn
WHERE s.has_tracking;

-- ---------------------------------------------------------------------------
-- STEP 8 · Withdraws (sentinel timestamps — see header)
-- ---------------------------------------------------------------------------
-- Amounts are derived from the actual seeded commissions so the invariant
-- "total withdrawn <= ready (encaissé) total" always holds, whatever the
-- catalog commission rates are.

-- Partner 42 · PAID — 80% of the first encaissé order's commission
-- (chronologically the only commission that was ready on 2026-07-20).
INSERT INTO withdraws (partner_id, amount, is_paid, created_at)
SELECT
  42,
  FLOOR(c.amount * 0.8 / 100) * 100,
  TRUE,
  TIMESTAMPTZ '2026-07-20 10:00:00+00'
FROM commissions c
JOIN orders o ON o.id = c.order_id
WHERE o.channel = 'test-seed'
  AND o.comment = '[TESTSEED] O42-01'
  AND FLOOR(c.amount * 0.8 / 100) * 100 > 0;

-- Partner 42 · PENDING — 50% of the remaining ready balance.
INSERT INTO withdraws (partner_id, amount, is_paid, created_at)
SELECT
  42,
  FLOOR((SUM(c.amount) - COALESCE(w.paid_total, 0)) * 0.5 / 100) * 100,
  FALSE,
  TIMESTAMPTZ '2026-08-28 10:00:00+00'
FROM commissions c
JOIN orders o ON o.id = c.order_id
CROSS JOIN LATERAL (
  SELECT SUM(amount) AS paid_total
  FROM withdraws
  WHERE partner_id = 42
    AND created_at = TIMESTAMPTZ '2026-07-20 10:00:00+00'
) w
WHERE c.partner_id = 42
  AND o.channel = 'test-seed'
  AND LOWER(COALESCE(o.dc_recent_status, '')) = 'encaisse'
GROUP BY w.paid_total
HAVING FLOOR((SUM(c.amount) - COALESCE(w.paid_total, 0)) * 0.5 / 100) * 100 > 0;

-- Partner 45 · PENDING — 40% of the ready balance.
INSERT INTO withdraws (partner_id, amount, is_paid, created_at)
SELECT
  45,
  FLOOR(SUM(c.amount) * 0.4 / 100) * 100,
  FALSE,
  TIMESTAMPTZ '2026-08-30 10:00:00+00'
FROM commissions c
JOIN orders o ON o.id = c.order_id
WHERE c.partner_id = 45
  AND o.channel = 'test-seed'
  AND LOWER(COALESCE(o.dc_recent_status, '')) = 'encaisse'
HAVING FLOOR(SUM(c.amount) * 0.4 / 100) * 100 > 0;

-- ---------------------------------------------------------------------------
-- STEP 9 · Payment settings on the partners (only if currently empty)
-- ---------------------------------------------------------------------------
-- COALESCE guard: never overwrites details the partner already filled in.
-- The cleanup script deliberately does NOT touch the partners table.
UPDATE partners
SET baridimob_rib    = COALESCE(baridimob_rib, '00799999002001234567'),
    redotpay_account = COALESCE(redotpay_account, 'hannemanrichard7@gmail.com'),
    usdt_address     = COALESCE(usdt_address, 'TQm8yS3XZzYqHvZ7k2JdT4fG9eXwN1pAbC')
WHERE id = 42;

UPDATE partners
SET baridimob_rib    = COALESCE(baridimob_rib, '00799999002009876543'),
    redotpay_account = COALESCE(redotpay_account, 'valorios80@gmail.com'),
    usdt_address     = COALESCE(usdt_address, 'TQr4mX7wZpY2uK8sD5fH1jN3bV6cE9gLM')
WHERE id = 45;

-- ---------------------------------------------------------------------------
-- STEP 10 · Integrity checks — any failure rolls the whole seed back
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_missing_commissions INT;
  v_bad_amounts         INT;
  v_bad_earned          INT;
  v_bad_withdraws       INT;
BEGIN
  -- every test order must have exactly one commission snapshot
  SELECT COUNT(*) INTO v_missing_commissions
  FROM orders o
  WHERE o.channel = 'test-seed'
    AND o.partner_id IN (42, 45)
    AND NOT EXISTS (SELECT 1 FROM commissions c WHERE c.order_id = o.id);
  IF v_missing_commissions > 0 THEN
    RAISE EXCEPTION 'Seed integrity failed: % test orders have no commission row', v_missing_commissions;
  END IF;

  -- amount = (unit_commission - unit_discount) * quantity
  SELECT COUNT(*) INTO v_bad_amounts
  FROM commissions c
  JOIN orders o ON o.id = c.order_id
  WHERE o.channel = 'test-seed'
    AND c.amount <> (c.unit_commission - c.unit_discount) * c.quantity;
  IF v_bad_amounts > 0 THEN
    RAISE EXCEPTION 'Seed integrity failed: % commissions violate the amount formula', v_bad_amounts;
  END IF;

  -- is_earned must match the delivered status
  SELECT COUNT(*) INTO v_bad_earned
  FROM commissions c
  JOIN orders o ON o.id = c.order_id
  WHERE o.channel = 'test-seed'
    AND c.is_earned <> (LOWER(COALESCE(o.status, '')) = 'delivered');
  IF v_bad_earned > 0 THEN
    RAISE EXCEPTION 'Seed integrity failed: % commissions with is_earned not matching order status', v_bad_earned;
  END IF;

  -- total withdrawn must never exceed the ready (encaissé) total
  SELECT COUNT(*) INTO v_bad_withdraws
  FROM (
    SELECT c.partner_id,
           SUM(c.amount) AS ready_total
    FROM commissions c
    JOIN orders o ON o.id = c.order_id
    WHERE o.channel = 'test-seed'
      AND LOWER(COALESCE(o.dc_recent_status, '')) = 'encaisse'
    GROUP BY c.partner_id
  ) ready
  JOIN (
    SELECT partner_id, SUM(amount) AS withdrawn_total
    FROM withdraws
    WHERE partner_id IN (42, 45)
      AND created_at IN (
            TIMESTAMPTZ '2026-07-20 10:00:00+00',
            TIMESTAMPTZ '2026-08-28 10:00:00+00',
            TIMESTAMPTZ '2026-08-30 10:00:00+00'
          )
    GROUP BY partner_id
  ) w ON w.partner_id = ready.partner_id
  WHERE w.withdrawn_total > ready.ready_total;
  IF v_bad_withdraws > 0 THEN
    RAISE EXCEPTION 'Seed integrity failed: withdraws exceed ready balance for % partners', v_bad_withdraws;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- STEP 11 · Report
-- ---------------------------------------------------------------------------
SELECT 'orders' AS entity, partner_id::text AS partner, COUNT(*) AS row_count
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

-- Earnings cross-check (what the earnings page should show for each partner):
SELECT
  c.partner_id,
  SUM(c.amount) FILTER (
    WHERE LOWER(COALESCE(o.dc_recent_status, '')) = 'encaisse'
  ) AS ready_total,
  SUM(c.amount) FILTER (
    WHERE c.is_earned AND LOWER(COALESCE(o.dc_recent_status, '')) <> 'encaisse'
  ) AS not_ready_total,
  COALESCE((
    SELECT SUM(w.amount) FROM withdraws w
    WHERE w.partner_id = c.partner_id
      AND w.created_at IN (
            TIMESTAMPTZ '2026-07-20 10:00:00+00',
            TIMESTAMPTZ '2026-08-28 10:00:00+00',
            TIMESTAMPTZ '2026-08-30 10:00:00+00'
          )
  ), 0) AS withdrawn_total
FROM commissions c
JOIN orders o ON o.id = c.order_id
WHERE o.channel = 'test-seed'
GROUP BY c.partner_id
ORDER BY 1;

COMMIT;
