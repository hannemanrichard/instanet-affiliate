# Orders Table Normalization Analysis

## Current Schema Review

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY,
  affiliate_id INTEGER NULL,

  -- Customer info (embedded)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_state_province TEXT NULL,

  -- Order amounts
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  -- Status and tracking
  status TEXT NOT NULL,
  delivery_company TEXT NULL,
  tracking_number TEXT NULL,
  notes TEXT NULL,

  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NULL
);
```

## Normalization Analysis

### ✅ 1NF (First Normal Form) - **PASS**

- All fields contain atomic values
- No repeating groups

### ✅ 2NF (Second Normal Form) - **PASS**

- Only one primary key (`id`)
- No composite keys, so no partial dependencies

### ⚠️ 3NF (Third Normal Form) - **VIOLATION**

**Issue 1: `subtotal` Should Come from `order_items`**

The `subtotal` field is redundant! It should be calculated from:

```sql
SELECT SUM(total_price) FROM order_items WHERE order_id = ?
```

Storing it on the `orders` table violates 3NF because:

- `subtotal` depends on `order_items.total_price`, not directly on `orders.id`
- This creates a transitive dependency: `orders.subtotal` → `order_items.total_price` → `order_items.id`

**Issue 2: Calculated Field (Denormalized)**

```sql
total = subtotal + shipping_cost - discount_amount
```

If `subtotal` is already denormalized, then `total` is doubly denormalized. However, storing calculated totals is **sometimes acceptable** for:

- **Audit trail**: Historical record of what was charged
- **Performance**: Avoid recalculating on every query
- **Data integrity**: If pricing logic changes, historical orders remain accurate

**However**, the real issue is storing `subtotal` when it should come from `order_items`.

**Issue 2: Customer Data Duplication**
If the same customer (same phone/email) places multiple orders, their information is duplicated:

```
Order 1: customer_name="Ahmed", customer_phone="+213555123456", customer_address="123 Main St"
Order 2: customer_name="Ahmed", customer_phone="+213555123456", customer_address="123 Main St"
Order 3: customer_name="Ahmed", customer_phone="+213555123456", customer_address="456 New St" (moved!)
```

However, this is **intentional denormalization** because:

- **No customer accounts**: Customers don't have accounts, so no customer table exists
- **Historical accuracy**: Customer info might change (they move, change phone). Storing it per order preserves what was used at order time
- **Audit trail**: Critical for compliance and dispute resolution
- **Affiliate-entered data**: Affiliates type customer info directly, may have typos or variations

## Is It Normalized Enough?

### ✅ **Yes, for your use case!**

The current schema is **appropriately denormalized** for:

1. **Historical accuracy** - Customer info at order time
2. **Audit trail** - Complete order snapshot
3. **No customer accounts** - Can't normalize to non-existent table
4. **Performance** - No joins needed for basic order queries

## Alternative: Fully Normalized Approach

If you wanted to normalize further (probably overkill for your case):

```sql
-- Option 1: Add customer table (but you said no customer accounts)
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state_province TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  affiliate_id INTEGER NULL,
  customer_id UUID REFERENCES customers(id),
  customer_address_id UUID REFERENCES customer_addresses(id),

  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL, -- Still stored for audit

  status TEXT NOT NULL,
  -- ...
);
```

**But this has problems:**

- ❌ Requires customer accounts (you explicitly said you don't want this)
- ❌ Loses historical accuracy if customer updates their info
- ❌ More complex queries with joins
- ❌ Doesn't match your workflow (affiliates typing customer info)

## Recommendation

### ⚠️ **Fix: Remove `subtotal` from orders table**

The `subtotal` should **not** be stored on the `orders` table. Instead:

**Option 1: Calculate `subtotal` from `order_items` (Normalized)**

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY,
  affiliate_id INTEGER NULL,

  -- Customer info (embedded)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  -- ... other customer fields

  -- Order amounts (NO subtotal!)
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0, -- Can be stored for audit OR calculated

  -- ... rest of fields
);

-- Calculate subtotal in queries or views
CREATE VIEW order_with_subtotal AS
SELECT
  o.*,
  COALESCE(SUM(oi.total_price), 0) AS subtotal,
  COALESCE(SUM(oi.total_price), 0) + o.shipping_cost - o.discount_amount AS calculated_total
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;
```

**Option 2: Use Generated Column for `subtotal`**

```sql
-- PostgreSQL 12+ supports generated columns
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2)
  GENERATED ALWAYS AS (
    (SELECT COALESCE(SUM(total_price), 0) FROM order_items WHERE order_id = orders.id)
  ) STORED;
```

**Option 3: Keep Current (Denormalized for Performance)**
If you want to keep `subtotal` for performance, you must:

- **Always recalculate** `subtotal` when `order_items` change (use triggers)
- **Always recalculate** `total` when `subtotal`, `shipping_cost`, or `discount_amount` change
- Accept the denormalization as intentional for performance

This is a **common denormalization** but requires careful trigger management to keep data consistent.

## Minor Optimization (Optional)

You could make `total` a computed column or remove it and calculate in application:

```sql
-- Option: Computed column (PostgreSQL)
ALTER TABLE orders ADD COLUMN total GENERATED ALWAYS AS
  (subtotal + shipping_cost - discount_amount) STORED;
```

But storing it explicitly is fine and provides audit trail benefits.

## Summary

| Normalization Level | Status           | Notes                                                             |
| ------------------- | ---------------- | ----------------------------------------------------------------- |
| 1NF                 | ✅ Pass          | All atomic values                                                 |
| 2NF                 | ✅ Pass          | Single primary key                                                |
| 3NF                 | ❌ **Violation** | `subtotal` should come from `order_items`, not stored on `orders` |
| **Overall**         | ⚠️ **Needs Fix** | Remove `subtotal` or use triggers/computed columns to maintain it |

**Verdict**: Your orders table has a **normalization violation** - `subtotal` should be calculated from `order_items`, not stored redundantly. Either:

1. **Remove `subtotal`** and calculate it in queries/views (normalized)
2. **Use triggers** to auto-update `subtotal` when `order_items` change (denormalized with safeguards)
3. **Use generated columns** if your PostgreSQL version supports it (best of both worlds)
