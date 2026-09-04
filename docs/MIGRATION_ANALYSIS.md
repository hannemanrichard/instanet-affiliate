# Migration Analysis: Current Database State vs Required Migrations

## Current Database State (from `supabase/types.ts`)

### ✅ **Commissions Table** - MOSTLY COMPLETE

**Already in Database**:

- ✅ `order_item_id: string | null` - **EXISTS** (but nullable)
- ✅ `base_commission_rate: number` - **EXISTS**
- ✅ `commission_rate: number` - **EXISTS**
- ✅ `order_amount: number` - **EXISTS**
- ✅ `qty: number | null` - **EXISTS**
- ✅ `amount: number` - **EXISTS**
- ✅ Foreign key relationship to `order_items` - **EXISTS**
- ✅ No `product_id` column - **CONFIRMED**

**Missing/Needs Update**:

- ⚠️ `order_item_id` is **NULLABLE** but should be **NOT NULL** (per-item commissions)

---

### ✅ **Product Designs Table** - COMPLETE

**Already in Database**:

- ✅ `design_markup: number` - **EXISTS**
- ✅ `price_updated_at: string | null` - **EXISTS**
- ✅ `price: number` - **EXISTS**
- ✅ `commission_rate: number | null` - **EXISTS**

**Status**: ✅ **Migration 026 already applied!**

---

### ✅ **Order Items Table** - STRUCTURE COMPLETE

**Already in Database**:

- ✅ `total_price: number` - **EXISTS**
- ✅ `unit_price: number` - **EXISTS**
- ✅ `quantity: number` - **EXISTS**
- ✅ All other fields present

**Unknown**:

- ❓ **Triggers may or may not exist** (cannot determine from types)

---

### ✅ **Orders Table** - STRUCTURE COMPLETE

**Already in Database**:

- ✅ `total: number` - **EXISTS**
- ✅ `shipping_cost: number` - **EXISTS**
- ✅ `discount_amount: number` - **EXISTS**
- ✅ Simplified structure (no subtotal) - **CONFIRMED**
- ✅ Customer fields embedded - **CONFIRMED**

**Unknown**:

- ❓ **Triggers may or may not exist** (cannot determine from types)

---

## Migration Analysis

### **Migration 022**: Fix Commissions Structure

**Status**: ⚠️ **PARTIALLY APPLIED**

**What's Needed**:

```sql
-- Make order_item_id NOT NULL (if it's nullable)
ALTER TABLE commissions
ALTER COLUMN order_item_id SET NOT NULL;

-- Verify product_id is removed (already confirmed via types)
-- Add index if missing
CREATE INDEX IF NOT EXISTS idx_commissions_order_item_id
ON commissions(order_item_id);
```

**Recommendation**: ✅ **NEEDS TO RUN** (to make `order_item_id` NOT NULL)

---

### **Migration 023**: Add Calculated Field Triggers

**Status**: ❓ **UNKNOWN** (cannot determine from types)

**What's Needed**:

1. Trigger: `trigger_calculate_order_item_total` for `order_items.total_price`
2. Function: `calculate_order_item_total()`
3. Trigger: `trigger_calculate_order_total` for `orders.total`
4. Function: `calculate_order_total()`
5. Function: `update_order_total_on_item_change()`
6. Multiple triggers for order total updates

**How to Check**:

```sql
-- Check if triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('order_items', 'orders')
  AND trigger_name IN (
    'trigger_calculate_order_item_total',
    'trigger_calculate_order_total',
    'trigger_update_order_total_on_item_insert',
    'trigger_update_order_total_on_item_update',
    'trigger_update_order_total_on_item_delete',
    'trigger_update_order_total_on_shipping_change'
  );
```

**Recommendation**: ⚠️ **NEEDS VERIFICATION** - Run check query first, then apply if missing

---

### **Migration 024**: Remove Commission Trigger

**Status**: ❓ **UNKNOWN** (may have been removed already)

**What's Needed**:

```sql
-- Remove if exists
DROP TRIGGER IF EXISTS trigger_calculate_commission_amount ON commissions;
DROP FUNCTION IF EXISTS calculate_commission_amount();
```

**How to Check**:

```sql
-- Check if trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'commissions'
  AND trigger_name = 'trigger_calculate_commission_amount';
```

**Recommendation**: ✅ **SAFE TO RUN** (uses `IF EXISTS`, won't error if already removed)

---

### **Migration 025**: Add Commission Rate Tracking

**Status**: ✅ **ALREADY APPLIED**

**Evidence**: `base_commission_rate: number` exists in types

**Recommendation**: ❌ **SKIP** - Already applied

---

### **Migration 026**: Add Pricing Strategy Fields

**Status**: ✅ **ALREADY APPLIED**

**Evidence**:

- `design_markup: number` exists
- `price_updated_at: string | null` exists

**Unknown**:

- ❓ **Trigger may or may not exist** for `price_updated_at`

**How to Check**:

```sql
-- Check if trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'product_designs'
  AND trigger_name = 'trigger_update_product_design_price_timestamp';
```

**Recommendation**: ⚠️ **CHECK TRIGGER** - Fields exist, but trigger may be missing

---

## Final Recommendations

### ✅ **MUST RUN**:

1. **Migration 022** (partial) - Make `order_item_id` NOT NULL:

   ```sql
   ALTER TABLE commissions
   ALTER COLUMN order_item_id SET NOT NULL;
   ```

2. **Migration 023** (if triggers missing) - Add calculated field triggers:
   - Verify triggers exist first
   - Run if missing

3. **Migration 024** (safe) - Remove commission trigger:
   - Safe to run (uses IF EXISTS)
   - Won't cause errors if already removed

---

### ⚠️ **VERIFY FIRST**:

4. **Migration 026** (trigger check) - Verify price update trigger:
   ```sql
   -- Check if trigger exists, add if missing
   -- (fields already exist)
   ```

---

### ❌ **SKIP**:

5. **Migration 025** - Already applied (`base_commission_rate` exists)

---

## Verification Queries

Run these to check current state:

```sql
-- 1. Check commissions.order_item_id is nullable
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'commissions'
  AND column_name = 'order_item_id';

-- 2. Check if order_items triggers exist
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'order_items'
  AND trigger_name LIKE '%total%';

-- 3. Check if orders triggers exist
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'orders'
  AND trigger_name LIKE '%total%';

-- 4. Check if commission trigger exists (to remove)
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'commissions'
  AND trigger_name = 'trigger_calculate_commission_amount';

-- 5. Check if product_designs price trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'product_designs'
  AND trigger_name = 'trigger_update_product_design_price_timestamp';
```

---

## Suggested Actions

1. **Run verification queries** to check trigger status
2. **Run Migration 022** (partial) to make `order_item_id` NOT NULL
3. **Run Migration 023** if triggers are missing
4. **Run Migration 024** (safe, uses IF EXISTS)
5. **Verify Migration 026 trigger** and add if missing

---

## Additional Suggestions

### 🔍 **Potential Improvements**:

1. **Index on `commissions.order_item_id`**:

   ```sql
   CREATE INDEX IF NOT EXISTS idx_commissions_order_item_id
   ON commissions(order_item_id);
   ```

2. **Ensure `commissions.order_id` is NOT NULL**:

   ```sql
   -- Verify
   SELECT is_nullable
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'commissions'
     AND column_name = 'order_id';

   -- Fix if needed
   ALTER TABLE commissions
   ALTER COLUMN order_id SET NOT NULL;
   ```

3. **Add comments for documentation**:

   ```sql
   COMMENT ON COLUMN commissions.order_item_id IS 'Reference to order item - commissions are per order item, not per order';
   COMMENT ON COLUMN commissions.base_commission_rate IS 'The base commission rate from product_designs at the time of commission creation.';
   ```

4. **Verify foreign key constraints**:
   ```sql
   -- Check that order_item_id references order_items
   SELECT
     conname AS constraint_name,
     conrelid::regclass AS table_name,
     confrelid::regclass AS foreign_table
   FROM pg_constraint
   WHERE conrelid = 'commissions'::regclass
     AND contype = 'f'
     AND conname LIKE '%order_item%';
   ```
