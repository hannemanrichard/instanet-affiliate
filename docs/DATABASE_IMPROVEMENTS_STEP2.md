# Database Improvements - Step 2: Add Calculated Field Triggers ✅

## Changes Made

### ✅ Trigger 1: `order_items.total_price` Auto-Calculation

**Function**: `calculate_order_item_total()`
**Trigger**: `trigger_calculate_order_item_total`

**What it does**:

- Automatically calculates `total_price = unit_price * quantity` before INSERT or UPDATE
- Ensures `total_price` is always consistent with `unit_price` and `quantity`

**Example**:

```sql
INSERT INTO order_items (order_id, product_design_id, size, quantity, unit_price)
VALUES ('order-uuid', 'design-uuid', 'L', 2, 45.99);
-- total_price automatically set to 91.98 (2 * 45.99)
```

---

### ✅ Trigger 2: `commissions.amount` Auto-Calculation

**Function**: `calculate_commission_amount()`
**Trigger**: `trigger_calculate_commission_amount`

**What it does**:

- Automatically calculates `amount = order_amount * commission_rate` before INSERT or UPDATE
- Ensures `amount` is always consistent with `order_amount` and `commission_rate`

**Example**:

```sql
INSERT INTO commissions (affiliate_id, order_id, order_item_id, order_amount, commission_rate, qty)
VALUES (1, 'order-uuid', 'item-uuid', 91.98, 0.10, 2);
-- amount automatically set to 9.198 (91.98 * 0.10)
```

---

### ✅ Trigger 3: `orders.total` Auto-Calculation

**Functions**:

- `calculate_order_total()` - Calculates total when order is inserted/updated
- `update_order_total_on_item_change()` - Updates total when items change

**Triggers**:

- `trigger_calculate_order_total` - On order INSERT/UPDATE
- `trigger_update_order_total_on_item_insert` - When order_item is inserted
- `trigger_update_order_total_on_item_update` - When order_item is updated
- `trigger_update_order_total_on_item_delete` - When order_item is deleted
- `trigger_update_order_total_on_shipping_change` - When shipping_cost/discount_amount changes

**What it does**:

- Automatically calculates `total = SUM(order_items.total_price) + shipping_cost - discount_amount`
- Updates order total whenever:
  - Order is created/updated (direct changes to shipping_cost/discount_amount)
  - Order items are added/updated/deleted
  - Order shipping_cost or discount_amount changes

**Example**:

```sql
-- Create order
INSERT INTO orders (affiliate_id, customer_name, customer_phone, customer_address, customer_city, shipping_cost, discount_amount)
VALUES (1, 'Ahmed', '+2135551234', '123 Main St', 'Algiers', 5.00, 0.00);
-- total automatically set to 5.00 (0 items + 5.00 shipping - 0.00 discount)

-- Add order item
INSERT INTO order_items (order_id, product_design_id, size, quantity, unit_price)
VALUES ('order-uuid', 'design-uuid', 'L', 1, 45.99);
-- order.total automatically updated to 50.99 (45.99 + 5.00 - 0.00)
```

---

## Benefits

### ✅ **Data Consistency**

- Calculated fields are always correct
- No risk of manual errors in calculations
- Single source of truth enforced at database level

### ✅ **Performance**

- Calculations happen at database level (fast)
- No need to calculate in application code
- Reduces complexity in application layer

### ✅ **Audit Trail**

- Values are stored (denormalized) for historical accuracy
- But maintained automatically (normalized behavior)
- Best of both worlds

---

## How It Works

### Order Item Total Calculation

```
User inserts order_item:
  ↓
Trigger fires BEFORE INSERT
  ↓
calculate_order_item_total() executes
  ↓
total_price = unit_price * quantity
  ↓
Row inserted with calculated total_price
```

### Commission Amount Calculation (Manual)

```
User inserts commission:
  ↓
Application calculates amount (allows special rates/bonuses)
  ↓
Amount can be:
  - Standard: order_amount * commission_rate
  - With bonus: order_amount * (commission_rate + bonus_rate)
  - Fixed bonus: (order_amount * commission_rate) + fixed_bonus
  - Custom: Any calculation for special promotions
  ↓
Row inserted with manually calculated amount
```

### Order Total Calculation

```
User creates/updates order OR order_items change:
  ↓
Trigger fires
  ↓
calculate_order_total() / update_order_total_on_item_change() executes
  ↓
total = SUM(items.total_price) + shipping_cost - discount_amount
  ↓
order.total updated
```

---

## Testing the Triggers

### Test Order Item Total

```sql
-- Insert order item (should auto-calculate total_price)
INSERT INTO order_items (order_id, product_design_id, size, quantity, unit_price)
VALUES ('test-order-uuid', 'test-design-uuid', 'L', 2, 45.99);

-- Check result (total_price should be 91.98)
SELECT id, quantity, unit_price, total_price
FROM order_items
WHERE id = 'inserted-item-id';
-- Expected: total_price = 91.98
```

### Test Commission Amount

```sql
-- Insert standard commission (amount calculated in application: 91.98 * 0.10 = 9.198)
INSERT INTO commissions (affiliate_id, order_id, order_item_id, order_amount, commission_rate, qty, amount)
VALUES (1, 'test-order-uuid', 'test-item-uuid', 91.98, 0.10, 2, 9.198);

-- Insert special reward commission (+50% bonus, amount = 91.98 * 0.60 = 55.188)
INSERT INTO commissions (affiliate_id, order_id, order_item_id, order_amount, commission_rate, qty, amount)
VALUES (1, 'test-order-uuid-2', 'test-item-uuid-2', 91.98, 0.10, 2, 55.188);

-- Check results
SELECT id, order_amount, commission_rate, amount,
       ROUND((amount / order_amount) * 100, 2) as effective_rate_percent
FROM commissions
WHERE id IN ('inserted-commission-id-1', 'inserted-commission-id-2');
-- Expected:
--   Standard: amount = 9.198, effective_rate = 10.00%
--   Bonus: amount = 55.188, effective_rate = 60.00%
```

### Test Order Total

```sql
-- Create order
INSERT INTO orders (affiliate_id, customer_name, customer_phone, customer_address, customer_city, shipping_cost, discount_amount)
VALUES (1, 'Test User', '+2135551234', '123 Test St', 'Test City', 5.00, 2.00);

-- Add item (should auto-update order.total)
INSERT INTO order_items (order_id, product_design_id, size, quantity, unit_price)
VALUES ('test-order-uuid', 'test-design-uuid', 'L', 1, 50.00);

-- Check order total (should be 53.00 = 50.00 + 5.00 - 2.00)
SELECT id, shipping_cost, discount_amount, total
FROM orders
WHERE id = 'test-order-uuid';
-- Expected: total = 53.00
```

---

## Migration Steps

1. ✅ Migration file created: `database/migrations/023_add_calculated_field_triggers.sql`
2. ⏳ **Next**: Run the migration on your database
3. ⏳ **Then**: Test the triggers with sample data
4. ⏳ **Finally**: Update application code to remove manual calculations (optional - triggers will override anyway)

---

## Next Steps

Ready for **Step 3**: Any other improvements needed?

- Price management strategy documentation?
- Commission rate strategy clarification?
- Any other schema refinements?
