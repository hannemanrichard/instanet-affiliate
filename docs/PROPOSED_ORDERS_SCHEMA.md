# Orders Table Schema

## Simplified Orders Schema for Print-on-Demand Platform

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Affiliate tracking
  affiliate_id INTEGER NULL REFERENCES affiliates(id) ON DELETE SET NULL,

  -- Customer information (embedded, no customer accounts)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_state_province TEXT NULL,

  -- Order amounts
  -- NOTE: subtotal should be calculated from order_items (SUM of item totals)
  -- Storing it here would violate 3NF. Use a view or calculated field instead.
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0, -- Can be stored for audit OR calculated

  -- Order status and tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'printed', 'shipped', 'delivered', 'cancelled', 'returned'
  delivery_company TEXT NULL,
  tracking_number TEXT NULL,

  -- Additional information
  notes TEXT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for performance
CREATE INDEX idx_orders_affiliate_id ON public.orders(affiliate_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);

-- View to calculate subtotal from order_items (normalized approach)
CREATE VIEW order_with_subtotal AS
SELECT
  o.*,
  COALESCE(SUM(oi.total_price), 0) AS subtotal,
  COALESCE(SUM(oi.total_price), 0) + o.shipping_cost - o.discount_amount AS calculated_total
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

-- Alternative: Use generated column for subtotal (PostgreSQL 12+)
-- ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2)
--   GENERATED ALWAYS AS (
--     (SELECT COALESCE(SUM(total_price), 0) FROM order_items WHERE order_id = orders.id)
--   ) STORED;
```

## Key Points

### ✅ **Simplified Customer Info**

- Only essential fields: `name`, `phone`, `email`, `address`, `city`, `state_province`
- Removed: `address_line_2`, `country`, `postal_code`

### ✅ **No Payment Fields**

- Removed: `payment_status`, `payment_method`
- Payment handling can be done separately if needed

### ✅ **No Commission Fields**

- Removed: `commission_rate`, `commission_amount`, `commission_status`
- Commissions are tracked in the separate `commissions` table

### ✅ **Normalized Subtotal**

- **Removed `subtotal` from orders table** (should come from `order_items`)
- Use view `order_with_subtotal` to calculate it, or use generated column
- This prevents 3NF violation (subtotal depends on order_items, not orders.id)

### ✅ **UUID Primary Key**

- Uses UUID instead of bigint identity
- Matches your current codebase pattern

### ✅ **Clean and Focused**

- Only fields needed for order tracking and fulfillment
- Removed marketplace-specific fields (wilaya, commune, stopdesk, etc.)
- Removed exchange/defect fields (can be tracked in order_items or physical_printed_inventory)

## Relationship with Other Tables

- **`affiliates`**: Links order to affiliate who created it (nullable for system orders)
- **`order_items`**: Order line items (references this table)
- **`commissions`**: Commission records created from orders (references `order_id`)
- **`physical_printed_inventory`**: Physical products created from order items

## Example Usage

```sql
-- Create an order
INSERT INTO orders (
  affiliate_id,
  customer_name,
  customer_phone,
  customer_email,
  customer_address,
  customer_city,
  shipping_cost,
  discount_amount,
  total,
  status
) VALUES (
  1,
  'Ahmed Benali',
  '+213555123456',
  'ahmed@example.com',
  '123 Main Street',
  'Algiers',
  5.00,
  0.00,
  50.99,
  'pending'
);

-- Update order status
UPDATE orders
SET status = 'printed',
    updated_at = NOW()
WHERE id = 'order-uuid';

-- Track delivery
UPDATE orders
SET status = 'shipped',
    delivery_company = 'DHL',
    tracking_number = '1234567890',
    updated_at = NOW()
WHERE id = 'order-uuid';
```

This schema is clean, focused, and matches your print-on-demand workflow perfectly!
