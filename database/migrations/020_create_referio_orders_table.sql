-- Create Referio Orders Table
-- Migration: 020_create_referio_orders_table.sql
-- Purpose: Dedicated orders table for Referio affiliate platform
--          Affiliates create orders directly with customer info (no customer accounts)

-- ==============================================
-- 1. CREATE REFERIO_ORDERS TABLE
-- ==============================================

CREATE TABLE referio_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Affiliate (required - the affiliate creating the order)
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  
  -- Customer Information (stored directly - no customer accounts)
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  customer_address_line_1 VARCHAR(255) NOT NULL,
  customer_address_line_2 VARCHAR(255),
  customer_city VARCHAR(100) NOT NULL,
  customer_state_province VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_country VARCHAR(100) DEFAULT 'Algeria',
  
  -- Order Details
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Order Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending, confirmed, processing, shipped, delivered, cancelled, returned
  
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  -- unpaid, paid, partially_paid, refunded, failed
  
  payment_method VARCHAR(50),
  -- cash_on_delivery, bank_transfer, credit_card, etc.
  
  -- Delivery Information
  delivery_company VARCHAR(100),
  tracking_number VARCHAR(100),
  
  -- Commission Information
  commission_rate DECIMAL(5,4) DEFAULT 0.10, -- Default 10%
  commission_amount DECIMAL(10,2), -- Calculated: total * commission_rate
  commission_status VARCHAR(50) DEFAULT 'pending',
  -- pending, approved, paid, cancelled
  
  -- Notes and Additional Info
  notes TEXT,
  internal_notes TEXT, -- For admin/internal use only
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by INTEGER REFERENCES affiliates(id), -- Usually same as affiliate_id, but could be admin
  updated_by INTEGER, -- Could be admin or system
  cancelled_by INTEGER,
  cancellation_reason TEXT
);

-- ==============================================
-- 2. CREATE INDEXES
-- ==============================================

CREATE INDEX idx_referio_orders_affiliate_id ON referio_orders(affiliate_id);
CREATE INDEX idx_referio_orders_status ON referio_orders(status);
CREATE INDEX idx_referio_orders_payment_status ON referio_orders(payment_status);
CREATE INDEX idx_referio_orders_commission_status ON referio_orders(commission_status);
CREATE INDEX idx_referio_orders_created_at ON referio_orders(created_at DESC);
CREATE INDEX idx_referio_orders_customer_phone ON referio_orders(customer_phone);
CREATE INDEX idx_referio_orders_tracking_number ON referio_orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Composite index for common affiliate queries
CREATE INDEX idx_referio_orders_affiliate_status ON referio_orders(affiliate_id, status);
CREATE INDEX idx_referio_orders_affiliate_created ON referio_orders(affiliate_id, created_at DESC);

-- ==============================================
-- 3. CREATE ORDER_ITEMS TABLE (if not exists)
-- ==============================================

-- Note: This assumes we have a products table or items table
-- Adjust references as needed

CREATE TABLE IF NOT EXISTS referio_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES referio_orders(id) ON DELETE CASCADE,
  
  -- Product Information
  product_id INTEGER, -- Reference to products table (if exists)
  product_name VARCHAR(255) NOT NULL, -- Denormalized for historical accuracy
  product_sku VARCHAR(100),
  
  -- Variants
  size VARCHAR(50),
  color VARCHAR(50),
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL, -- unit_price * quantity
  
  -- Additional Info
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referio_order_items_order_id ON referio_order_items(order_id);
CREATE INDEX idx_referio_order_items_product_id ON referio_order_items(product_id) WHERE product_id IS NOT NULL;

-- ==============================================
-- 4. CREATE TRIGGERS
-- ==============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_referio_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referio_orders_updated_at
  BEFORE UPDATE ON referio_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_referio_orders_updated_at();

-- Auto-calculate commission_amount when total or commission_rate changes
CREATE OR REPLACE FUNCTION calculate_referio_order_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total IS NOT NULL AND NEW.commission_rate IS NOT NULL THEN
    NEW.commission_amount = NEW.total * NEW.commission_rate;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_referio_order_commission
  BEFORE INSERT OR UPDATE ON referio_orders
  FOR EACH ROW
  WHEN (NEW.total IS NOT NULL AND NEW.commission_rate IS NOT NULL)
  EXECUTE FUNCTION calculate_referio_order_commission();

-- Auto-calculate order total from items
CREATE OR REPLACE FUNCTION update_referio_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE referio_orders
  SET subtotal = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM referio_order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ),
  total = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM referio_order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ) + COALESCE((
    SELECT shipping_cost - discount_amount
    FROM referio_orders
    WHERE id = COALESCE(NEW.order_id, OLD.order_id)
  ), 0)
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referio_order_total
  AFTER INSERT OR UPDATE OR DELETE ON referio_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_referio_order_total();

-- ==============================================
-- 5. COMMENTS
-- ==============================================

COMMENT ON TABLE referio_orders IS 'Orders created by affiliates in Referio platform. Customer info stored directly (no customer accounts).';
COMMENT ON COLUMN referio_orders.affiliate_id IS 'The affiliate who created this order (required)';
COMMENT ON COLUMN referio_orders.customer_name IS 'Customer name entered by affiliate';
COMMENT ON COLUMN referio_orders.customer_phone IS 'Customer phone number for contact';
COMMENT ON COLUMN referio_orders.commission_rate IS 'Commission rate for this order (e.g., 0.10 = 10%)';
COMMENT ON COLUMN referio_orders.commission_amount IS 'Calculated commission: total * commission_rate';
COMMENT ON COLUMN referio_orders.commission_status IS 'Commission payment status: pending until order delivered';

COMMENT ON TABLE referio_order_items IS 'Items/products in each order';
COMMENT ON COLUMN referio_order_items.product_name IS 'Denormalized product name for historical accuracy even if product is deleted';

