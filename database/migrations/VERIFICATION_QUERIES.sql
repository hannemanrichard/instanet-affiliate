-- Verification Queries for Database Improvements
-- Run these queries in Supabase SQL Editor to check current state
-- Copy and paste each section as needed

-- ==============================================
-- 1. CHECK COMMISSIONS TABLE STRUCTURE
-- ==============================================

-- Check if order_item_id is nullable
SELECT 
  column_name, 
  is_nullable, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'commissions'
  AND column_name IN ('order_item_id', 'order_id', 'base_commission_rate', 'commission_rate', 'product_id')
ORDER BY column_name;

-- Check if product_id column still exists (should NOT exist)
SELECT 
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'commissions'
  AND column_name = 'product_id';
-- Expected: No rows returned

-- Check index on order_item_id
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'commissions'
  AND indexname = 'idx_commissions_order_item_id';
-- Expected: 1 row with index definition

-- ==============================================
-- 2. CHECK ORDER_ITEMS TRIGGERS
-- ==============================================

-- Check if order_items total_price trigger exists
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'order_items'
  AND trigger_name = 'trigger_calculate_order_item_total';
-- Expected: 1 row

-- Check all order_items triggers
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'order_items';
-- Expected: Multiple triggers including total_price calculation

-- ==============================================
-- 3. CHECK ORDERS TRIGGERS
-- ==============================================

-- Check if orders total trigger exists
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'orders'
  AND trigger_name = 'trigger_calculate_order_total';
-- Expected: 1 row

-- Check all orders triggers (should include item change triggers)
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'orders'
  AND trigger_name LIKE '%total%';
-- Expected: Multiple triggers

-- ==============================================
-- 4. CHECK COMMISSION TRIGGER (SHOULD NOT EXIST)
-- ==============================================

-- Check if commission trigger exists (should NOT exist)
SELECT 
  trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'commissions'
  AND trigger_name = 'trigger_calculate_commission_amount';
-- Expected: No rows returned

-- ==============================================
-- 5. CHECK PRODUCT_DESIGNS PRICE TRIGGER
-- ==============================================

-- Check if product_designs price update trigger exists
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'product_designs'
  AND trigger_name = 'trigger_update_product_design_price_timestamp';
-- Expected: 1 row

-- ==============================================
-- 6. CHECK ALL FUNCTIONS
-- ==============================================

-- Check if calculation functions exist
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_order_item_total',
    'calculate_order_total',
    'update_order_total_on_item_change',
    'update_product_design_price_timestamp',
    'calculate_commission_amount'
  )
ORDER BY routine_name;
-- Expected: 4 functions (calculate_commission_amount should NOT exist)

-- ==============================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- ==============================================

-- Check commissions foreign keys
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS foreign_table,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE conrelid = 'commissions'::regclass
  AND contype = 'f'
ORDER BY constraint_name;
-- Expected: Should see foreign keys for affiliate_id, order_id, order_item_id

-- ==============================================
-- 8. SUMMARY - CURRENT STATE
-- ==============================================

-- Quick summary of what's implemented
SELECT 
  'Commissions Structure' AS check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'commissions' 
        AND column_name = 'order_item_id'
    ) THEN '✅ order_item_id exists'
    ELSE '❌ order_item_id missing'
  END AS status
UNION ALL
SELECT 
  'Order Item Trigger',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'order_items'
        AND trigger_name = 'trigger_calculate_order_item_total'
    ) THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END
UNION ALL
SELECT 
  'Order Total Trigger',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'orders'
        AND trigger_name = 'trigger_calculate_order_total'
    ) THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END
UNION ALL
SELECT 
  'Price Update Trigger',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'product_designs'
        AND trigger_name = 'trigger_update_product_design_price_timestamp'
    ) THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END
UNION ALL
SELECT 
  'Commission Trigger Removed',
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'commissions'
        AND trigger_name = 'trigger_calculate_commission_amount'
    ) THEN '✅ Correctly removed'
    ELSE '❌ Still exists (should be removed)'
  END;
