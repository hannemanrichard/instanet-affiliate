# Database Improvements - Step 1: Fix Commissions Structure ✅

## Changes Made

### ✅ Added `order_item_id` Column

**Why**: Commissions are per order_item, not per order. This ensures each commission is properly linked to the specific item that generated it.

```sql
ALTER TABLE commissions
ADD COLUMN order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE;
```

**Benefits**:

- Proper one-to-one relationship: one commission per order item
- Can track which specific product/design generated the commission
- Enables proper commission calculation per item

### ✅ Removed `product_id` Column

**Why**: `product_id` is redundant - we can get it via JOIN:

```
commissions.order_item_id
  → order_items.product_design_id
  → product_designs.product_id
```

**Benefits**:

- Eliminates data redundancy
- Single source of truth (product comes from order_item)
- Easier to maintain data consistency

### ✅ Kept `order_id` Column

**Why**: You confirmed keeping it for easier queries and aggregations.

**Benefits**:

- Can query all commissions for an order without JOINs
- Easier to aggregate commission totals per order
- Maintains backward compatibility

## Updated Commissions Schema

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL REFERENCES orders(id),           -- ✅ Kept for easier queries
  order_item_id UUID NOT NULL REFERENCES order_items(id), -- ✅ NEW: Per-item commission
  -- product_id removed ✅

  -- Commission calculation
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,

  -- Historical snapshots (denormalized for audit trail)
  order_amount DECIMAL(10,2) NOT NULL, -- From order_item.total_price at creation
  qty INTEGER NOT NULL,                 -- From order_item.quantity at creation
  amount DECIMAL(10,2) NOT NULL,        -- Auto-calculated: order_amount * commission_rate

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending → approved (on delivery) → paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

## Commission Workflow (Confirmed)

```
1. Order created
   ↓
2. Order items created
   ↓
3. Commissions created (one per order_item, status='pending')
   ↓
4. Order fulfilled and delivered
   ↓
5. Commission status changed to 'approved'
   ↓
6. Commission paid (status='paid', paid_at set)
```

**Key Points**:

- ✅ Commissions created when order is created (not on delivery)
- ✅ Status starts as 'pending'
- ✅ Status changes to 'approved' when order is delivered
- ✅ Status changes to 'paid' when commission is paid out

## Migration Steps

1. ✅ Migration file created: `database/migrations/022_fix_commissions_structure.sql`
2. ⏳ **Next**: Run the migration on your database
3. ⏳ **Then**: Update application code to:
   - Create commissions per order_item (not per order)
   - Set `order_item_id` when creating commissions
   - Remove any references to `product_id` in commissions

## Next Steps

Ready for **Step 2**: Add triggers for calculated fields?

- `order_items.total_price = unit_price * quantity`
- `commissions.amount = order_amount * commission_rate`
- `orders.total` calculation (if keeping it stored)
