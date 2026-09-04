# Commissions and Order Items Normalization Analysis

## 1. Commissions Table Analysis

### Current Schema (from codebase)

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

### Normalization Issues

#### ❌ **Issue 1: `amount` is a Calculated Field**

```sql
amount = order_amount * commission_rate
```

**Violation**: `amount` depends on `order_amount` and `commission_rate`, not directly on `commissions.id` (3NF violation).

**Fix Options**:

1. **Remove `amount`** and calculate in queries/views (normalized)
2. **Use generated column** (PostgreSQL 12+)
3. **Use triggers** to auto-update (denormalized with safeguards)

#### ❌ **Issue 2: `order_amount` Should Come from Orders/Order Items**

**Violation**: `order_amount` should come from the order, not be stored redundantly.

- If commission is per order: `order_amount` should come from `orders.total`
- If commission is per item: `order_amount` should come from `order_items.total_price`

**Current Problem**: Storing `order_amount` creates inconsistency risk if order amounts change.

**Fix Options**:

1. **Remove `order_amount`** and JOIN to get it from `orders` or `order_items` (normalized)
2. **Keep it denormalized** for historical accuracy (order amount at commission time)

#### ❌ **Issue 3: `qty` Should Come from Order Items**

**Violation**: `qty` (quantity) should come from `order_items.quantity`, not be stored on `commissions`.

**Current Problem**: If commission is per order item, `qty` should reference the order item's quantity.

**Fix**: Remove `qty` and JOIN to `order_items` when needed, or reference `order_item_id` instead.

### Recommended Normalized Schema

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id), -- Add reference to specific item
  product_id INTEGER REFERENCES products(id),

  -- Commission calculation
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,

  -- Historical snapshots (denormalized for audit trail)
  order_amount DECIMAL(10,2) NOT NULL, -- Snapshot of amount at commission time
  qty INTEGER DEFAULT 1, -- Snapshot of quantity at commission time
  amount DECIMAL(10,2) NOT NULL, -- Snapshot of commission amount

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

**OR** (Fully Normalized):

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  product_id INTEGER REFERENCES products(id),

  -- Only store what's needed for calculation
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- View to calculate commission amounts
CREATE VIEW commission_details AS
SELECT
  c.*,
  COALESCE(oi.total_price, o.total) AS order_amount,
  COALESCE(oi.quantity, 1) AS qty,
  COALESCE(oi.total_price, o.total) * c.commission_rate AS amount
FROM commissions c
LEFT JOIN order_items oi ON oi.id = c.order_item_id
LEFT JOIN orders o ON o.id = c.order_id;
```

**Recommendation**: Keep `order_amount`, `qty`, and `amount` **denormalized** for:

- **Historical accuracy**: Commission calculated at time of order (even if order changes later)
- **Audit trail**: What was actually paid
- **Performance**: No JOINs needed for commission reports

But use **triggers** to ensure consistency:

```sql
-- Auto-calculate amount when order_amount or commission_rate changes
CREATE TRIGGER calculate_commission_amount
  BEFORE INSERT OR UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission();
```

---

## 2. Order Items Table Analysis

### Current Schema (from PRINT_ON_DEMAND_SCHEMA.md)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  size VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Fulfillment tracking
  printed_product_id UUID REFERENCES physical_printed_inventory(id),
  status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Normalization Issues

#### ❌ **Issue 1: `total_price` is a Calculated Field**

```sql
total_price = unit_price * quantity
```

**Violation**: `total_price` depends on `unit_price` and `quantity`, not directly on `order_items.id` (3NF violation).

**Fix Options**:

1. **Remove `total_price`** and calculate in queries/views (normalized)
2. **Use generated column** (PostgreSQL 12+)
3. **Use triggers** to auto-update (denormalized with safeguards)

#### ⚠️ **Issue 2: `size` May Be Redundant**

If `product_design_id` already implies the size (through the product relationship), storing `size` here might be redundant.

**However**, this might be intentional denormalization for:

- **Historical accuracy**: Size at order time (even if product_design changes)
- **Performance**: No JOIN needed
- **Clarity**: Direct access to size

**Check**: Does `product_design_id` uniquely determine the size? If yes, `size` is redundant but acceptable for audit trail.

### Recommended Schema

**Option 1: Fully Normalized**

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  -- NO total_price (calculate it)

  -- Fulfillment tracking
  printed_product_id UUID REFERENCES physical_printed_inventory(id),
  status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View to calculate total_price
CREATE VIEW order_items_with_total AS
SELECT
  oi.*,
  oi.unit_price * oi.quantity AS total_price,
  pd.size -- From product_design join
FROM order_items oi
JOIN product_designs pd ON pd.id = oi.product_design_id;
```

**Option 2: Denormalized with Triggers (Recommended)**

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  size VARCHAR(20) NOT NULL, -- Denormalized for historical accuracy
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL, -- Denormalized for performance/audit

  -- Fulfillment tracking
  printed_product_id UUID REFERENCES physical_printed_inventory(id),
  status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-calculate total_price
CREATE TRIGGER calculate_order_item_total
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  WHEN (NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL)
  EXECUTE FUNCTION update_total_price();
```

**Recommendation**: Keep `total_price` and `size` **denormalized** for:

- **Historical accuracy**: Prices and sizes at order time (even if product changes)
- **Performance**: No calculations/JOINs needed for order totals
- **Audit trail**: What was actually charged

But use **triggers** to ensure `total_price` is always correct.

---

## Summary

| Table           | Field          | Issue                                | Recommendation                    |
| --------------- | -------------- | ------------------------------------ | --------------------------------- |
| **commissions** | `amount`       | Calculated (`order_amount * rate`)   | Keep denormalized with triggers   |
| **commissions** | `order_amount` | Should come from orders/items        | Keep denormalized for audit trail |
| **commissions** | `qty`          | Should come from order_items         | Keep denormalized for audit trail |
| **order_items** | `total_price`  | Calculated (`unit_price * quantity`) | Keep denormalized with triggers   |
| **order_items** | `size`         | May be redundant                     | Keep denormalized for audit trail |

## Overall Verdict

Both tables are **appropriately denormalized** for audit trail and performance, but:

### ✅ **Commissions Table**

- Keep `order_amount`, `qty`, and `amount` denormalized for historical accuracy
- Use triggers to ensure `amount = order_amount * commission_rate`
- Consider adding `order_item_id` reference if commissions are per-item

### ✅ **Order Items Table**

- Keep `total_price` and `size` denormalized for historical accuracy
- Use triggers to ensure `total_price = unit_price * quantity`
- This matches common e-commerce patterns (order snapshots)

**Key Principle**: When dealing with financial data (orders, commissions), denormalization is often acceptable for audit trails and historical accuracy, as long as triggers/computed columns maintain consistency.
