# Complete Database Structure Analysis

## Overview

This document provides a comprehensive analysis of the current database structure for the print-on-demand affiliate platform, covering products, designs, orders, commissions, and their relationships.

---

## 1. Products Structure

### ✅ **Excellent Hierarchy**

```
product_templates (Hoodie, T-Shirt)
    ↓
products (Black Hoodie, White T-Shirt) + gallery_urls
    ↓
product_sizes (S, M, L, XL, XXL)
    ↓
raw_inventory (quantity per product + size)
```

**Strengths:**

- ✅ Clear separation: templates → products → sizes → inventory
- ✅ Product galleries stored properly (JSONB for flexibility)
- ✅ Each product (color variant) has its own gallery
- ✅ Size management is clean and extensible

**Considerations:**

- ⚠️ `product_sizes` table might be overkill if sizes are consistent across products
  - Consider: Could sizes just be an ENUM or array stored on `product_template`?
  - But current approach allows per-product size customization (good for flexibility)

---

## 2. Designs Structure

### ✅ **Clean and Flexible**

```
designs (artwork)
    ↓
product_designs (design + product combination)
    ↓
design_gallery_urls (AI-generated images)
```

**Strengths:**

- ✅ Designs are independent of products (can be reused)
- ✅ `product_designs` properly combines design + product + print_placement
- ✅ AI gallery integration is well-structured (JSONB)
- ✅ Print placement flexibility (front, back, sleeve, full)

**Issues Found:**

#### ⚠️ **Issue 1: `product_designs.price` Should Reference `products.base_price`**

Currently: `product_designs.price` is stored independently.

**Problem**: If `products.base_price` changes, `product_designs.price` won't reflect it.

**Options**:

1. **Keep current** (denormalized) - Price at design creation time
2. **Calculate dynamically** - `price = products.base_price + design_markup`
3. **Version prices** - Track price history

**Recommendation**: Keep denormalized for historical accuracy, but consider adding `price_updated_at` for tracking.

#### ⚠️ **Issue 2: `product_designs.commission_rate` Should Be on Product or Design?**

Currently: `product_designs.commission_rate` stored per product_design.

**Question**: Is commission rate:

- Per design? (Same commission for Sharingan regardless of product)
- Per product? (Same commission for all designs on Hoodie)
- Per product_design? (Different rates for different combinations)

**Recommendation**: If commission rates vary by combination, current approach is correct. Otherwise, move to `products` or `designs` table.

---

## 3. Orders Structure

### ✅ **Well Normalized (After Fixes)**

```
orders (customer info embedded, shipping, total)
    ↓
order_items (product_design_id, size, quantity, prices)
```

**Strengths:**

- ✅ Customer info properly embedded (no customer accounts)
- ✅ `subtotal` correctly removed from orders (calculated from items)
- ✅ Order status tracking is clear
- ✅ Delivery tracking fields are present

**Remaining Considerations:**

#### ⚠️ **Issue: `orders.total` Should Match Sum of Items**

Currently: `orders.total` is stored but should equal:

```
SUM(order_items.total_price) + shipping_cost - discount_amount
```

**Options**:

1. **Remove `total`** - Calculate in queries/views
2. **Use trigger** - Auto-update when items/shipping/discount changes
3. **Use generated column** - PostgreSQL 12+

**Recommendation**: Keep with trigger to maintain consistency, or use generated column.

---

## 4. Order Items Structure

### ✅ **Good but Needs Trigger**

```sql
order_items (
  product_design_id,  -- ✅ References product_design
  size,               -- ⚠️ Denormalized (but OK for audit)
  quantity,           -- ✅ Core field
  unit_price,         -- ✅ Snapshot at order time
  total_price         -- ⚠️ Calculated (unit_price * quantity)
)
```

**Strengths:**

- ✅ References `product_design_id` correctly
- ✅ Size denormalized for historical accuracy (good)
- ✅ Prices are snapshots at order time (good for audit)

**Issues:**

#### ❌ **Issue: `total_price` Must Be Calculated via Trigger**

Currently: `total_price = unit_price * quantity` but no trigger enforces this.

**Required Fix:**

```sql
CREATE TRIGGER calculate_order_item_total
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  WHEN (NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL)
  EXECUTE FUNCTION update_total_price();
```

#### ⚠️ **Issue: `size` Might Be Redundant**

**Question**: Does `product_design_id` uniquely determine the size?

Looking at schema: `product_designs` doesn't have a `size` field. The size comes from:

- `products` → `product_sizes` → size options available
- Customer selects size when ordering

**Answer**: Size is NOT redundant - it's the customer's choice. A product_design (Sharingan Black Hoodie) can be ordered in any available size.

**Verdict**: ✅ Keep `size` in `order_items` - it's the selected size at order time.

---

## 5. Commissions Structure

### ⚠️ **Needs Improvements**

```sql
commissions (
  affiliate_id,       -- ✅ Correct
  order_id,          -- ✅ References order
  product_id,        -- ⚠️ Why product_id? Should be order_item_id
  order_amount,      -- ⚠️ Denormalized (OK for audit)
  qty,               -- ⚠️ Denormalized (OK for audit)
  commission_rate,   -- ✅ OK
  amount             -- ⚠️ Calculated (order_amount * rate)
)
```

**Issues Found:**

#### ❌ **Issue 1: Missing `order_item_id` Reference**

**Problem**: If commissions are per order item (which they likely are), you need:

- `order_item_id UUID REFERENCES order_items(id)`

**Current**: Only has `order_id` and `product_id` (which product? The order might have multiple items).

**Fix**: Add `order_item_id` and make commissions per item, not per order.

#### ❌ **Issue 2: `product_id` Should Come from Order Item**

**Problem**: `product_id` in commissions doesn't make sense. Commissions are for:

- `order_item_id` → `product_design_id` → `product_id`

**Fix**: Remove `product_id` from commissions, get it via JOIN if needed.

#### ⚠️ **Issue 3: Calculated Fields Need Triggers**

**Problem**: `amount = order_amount * commission_rate` but no trigger.

**Fix**: Add trigger to auto-calculate `amount`.

#### ⚠️ **Issue 4: `order_amount` and `qty` Should Come from Order Item**

**Problem**: If commission is per order item:

- `order_amount` should be `order_items.total_price`
- `qty` should be `order_items.quantity`

**Recommendation**: Keep denormalized for audit trail, but add `order_item_id` and use it as source of truth.

### ✅ Recommended Commissions Schema (STEP 1 COMPLETE)

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL REFERENCES orders(id),           -- ✅ Kept for easier queries
  order_item_id UUID NOT NULL REFERENCES order_items(id), -- ✅ Added: Per-item commission
  -- product_id removed ✅ (get via JOIN: order_item → product_design → product)

  -- Commission calculation
  base_commission_rate DECIMAL(5,4) NOT NULL,  -- ✅ From product_designs.commission_rate (STEP 3)
  commission_rate DECIMAL(5,4) NOT NULL,        -- Final effective rate (base × multipliers)

  -- Historical snapshots (denormalized for audit trail)
  order_amount DECIMAL(10,2) NOT NULL, -- From order_item.total_price at creation
  qty INTEGER NOT NULL,                 -- From order_item.quantity at creation
  amount DECIMAL(10,2) NOT NULL,        -- Calculated in application (allows special rates/bonuses, no trigger)

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending (on order creation) → approved (on delivery) → paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Commission Workflow:
-- 1. Order created → Commissions created (status='pending')
-- 2. Order delivered → Commission status = 'approved'
-- 3. Commission paid → Commission status = 'paid'

-- Note: amount is NOT auto-calculated via trigger
-- Reason: Special commission rates (e.g., +50% rewards) need to override standard calculation
-- Calculate amount in application layer to allow for bonuses and promotional rates
```

---

## 6. Inventory Structure

### ✅ **Excellent Separation**

```
raw_inventory (empty garments)
    ↓
physical_printed_inventory (printed products)
```

**Strengths:**

- ✅ Clear separation of raw vs printed inventory
- ✅ Reserve system (`reserved_quantity`) prevents overselling
- ✅ Return handling in `physical_printed_inventory` (resale logic)
- ✅ Quality control fields present

**Considerations:**

- ✅ `raw_inventory` correctly tracks by `product_id + size`
- ✅ `physical_printed_inventory` correctly tracks printed products with SKU

---

## 7. Overall Architecture Assessment

### ✅ **Strengths**

1. **Clear Separation of Concerns**
   - Templates → Products → Designs → Product Designs
   - Raw inventory vs Printed inventory
   - Orders → Order Items → Commissions

2. **Proper Normalization (Mostly)**
   - Removed `subtotal` from orders ✅
   - Customer data embedded (appropriate for no-accounts) ✅
   - Prices snapshotted at order time (good for audit) ✅

3. **Flexible Design System**
   - Designs can be reused across products
   - Multiple print placements supported
   - AI gallery integration ready

4. **Good Inventory Management**
   - Reserve system prevents overselling
   - Return/resale handling built in
   - Quality control tracking

### ⚠️ **Areas Needing Attention**

1. **Missing Triggers** ✅ **FIXED IN STEP 2**
   - ✅ `order_items.total_price` calculation - **TRIGGER ADDED**
   - ✅ `orders.total` calculation - **TRIGGER ADDED**
   - ⚠️ `commissions.amount` calculation - **NO TRIGGER** (manual calculation to allow special rates/bonuses)

2. **Commissions Structure** ✅ **FIXED IN STEP 1**
   - ✅ Add `order_item_id` reference - **COMPLETE**
   - ✅ Remove `product_id` (get via JOIN) - **COMPLETE**
   - ✅ Make commissions per-item, not per-order - **COMPLETE**

3. **Price Management**
   - Consider price versioning/history
   - Document pricing strategy (static vs dynamic)

4. **Commission Rate Strategy**
   - Clarify: rate per design, product, or product_design?
   - Consider: Should rate come from `product_designs` or be overrideable per commission?

---

## 8. Data Flow Analysis

### Order Creation Flow

```
1. Affiliate creates order
   ↓
2. order_items created (references product_design_id, captures size/price)
   ↓
3. raw_inventory.reserved_quantity++ (reserve stock)
   ↓
4. print_jobs created (for fulfillment)
   ↓
5. After printing: physical_printed_inventory created
   ↓
6. raw_inventory.quantity-- (consume stock)
   ↓
7. commissions created (per order_item, pending until delivery)
   ↓
8. On delivery: commission.status = 'approved'
```

**Potential Issues:**

#### ⚠️ **Issue: When Are Commissions Created?**

**Current Flow**: Commissions likely created when order is created.

**Problem**: If order is cancelled, commissions need cleanup.

**Recommendation**: Create commissions when order status = 'delivered' (or approved), not at creation.

---

## 9. Recommendations Summary

### 🔴 **Critical Fixes**

1. ✅ **Add `order_item_id` to commissions table** - **COMPLETE (STEP 1)**
2. ✅ **Add triggers for calculated fields** - **COMPLETE (STEP 2)**
   - ✅ `order_items.total_price = unit_price * quantity` - **TRIGGER ADDED**
   - ⚠️ `commissions.amount` - **NO TRIGGER** (manual calculation in app for special rates/bonuses)
   - ✅ `orders.total = SUM(items) + shipping - discount` - **TRIGGER ADDED**

### 🟡 **Important Improvements**

1. ✅ **Remove `product_id` from commissions** (get via JOIN) - **COMPLETE (STEP 1)**
2. ✅ **Clarify commission creation timing** (on delivery vs on order) - **COMPLETE (STEP 1)**
3. ✅ **Commission rate multiplier system** - **COMPLETE (STEP 3)**
   - Base rate from `product_designs.commission_rate`
   - Multipliers (tier, promo, rewards) applied in application
   - `base_commission_rate` tracked for audit
4. ✅ **Pricing strategy implementation** - **COMPLETE (STEP 4)**
   - Formula: `price = base_price + design_markup`
   - `design_markup` field added to product_designs
   - `price_updated_at` added for price change tracking
   - Trigger to auto-update timestamp on price changes

### 🟢 **Nice-to-Haves**

1. ✅ Add `price_updated_at` to `product_designs` - **COMPLETE (STEP 4)**
2. Add `commission_rate_override` to commissions (if needed) - Not needed (multipliers handle this)
3. Commission tiers/structures - **Implemented via multiplier system (STEP 3)**

---

## 10. Final Verdict

### Overall Rating: **9.5/10** ⭐⭐⭐⭐⭐

**Excellent structure** with all critical improvements complete! The database is:

- ✅ Well-normalized (calculated fields properly handled)
- ✅ Properly separated (products, designs, orders, commissions)
- ✅ Audit-trail ready (prices and rates snapshotted)
- ✅ Triggers for calculated fields - **COMPLETE (STEP 2)**
- ✅ Commissions structure fixed - **COMPLETE (STEP 1)**
- ✅ Commission multiplier system - **COMPLETE (STEP 3)**
- ✅ Pricing strategy implemented - **COMPLETE (STEP 4)**

**All Improvements Complete:**

1. ✅ Fix commissions table (add `order_item_id`, remove `product_id`) - **COMPLETE (STEP 1)**
2. ✅ Add triggers for calculated fields - **COMPLETE (STEP 2)**
3. ✅ Document commission creation workflow - **COMPLETE (STEP 1)**
4. ✅ Commission rate multiplier system - **COMPLETE (STEP 3)**
5. ✅ Pricing strategy with markup and tracking - **COMPLETE (STEP 4)**

**The schema is production-ready!** 🚀

See `DATABASE_IMPROVEMENTS_SUMMARY.md` for complete overview.
