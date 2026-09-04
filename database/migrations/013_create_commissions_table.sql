-- Migration: Create Commissions Table
-- Purpose: Track affiliate commissions for orders
-- Date: 2024-01-XX
-- Description: Creates commissions table to track affiliate earnings

-- Create commissions table
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id VARCHAR(255) REFERENCES orders(id), -- UUID string from orders table
  lead_id INTEGER REFERENCES leads(id),
  product_id INTEGER REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX idx_commissions_order_id ON commissions(order_id);
CREATE INDEX idx_commissions_lead_id ON commissions(lead_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);
CREATE INDEX idx_commissions_paid_at ON commissions(paid_at);

-- Add comments for documentation
COMMENT ON TABLE commissions IS 'Affiliate commission tracking for orders and leads';
COMMENT ON COLUMN commissions.id IS 'Unique identifier for commission record';
COMMENT ON COLUMN commissions.affiliate_id IS 'Reference to affiliate who earned this commission';
COMMENT ON COLUMN commissions.order_id IS 'Reference to order (UUID) that generated this commission';
COMMENT ON COLUMN commissions.lead_id IS 'Reference to lead that generated this commission';
COMMENT ON COLUMN commissions.product_id IS 'Reference to product sold';
COMMENT ON COLUMN commissions.amount IS 'Commission amount earned';
COMMENT ON COLUMN commissions.commission_rate IS 'Commission rate percentage (e.g., 10.00 for 10%)';
COMMENT ON COLUMN commissions.order_amount IS 'Original order amount';
COMMENT ON COLUMN commissions.qty IS 'Quantity of items sold';
COMMENT ON COLUMN commissions.status IS 'Commission status (pending, approved, paid, cancelled)';
COMMENT ON COLUMN commissions.created_at IS 'Timestamp when commission was created';
COMMENT ON COLUMN commissions.updated_at IS 'Timestamp when commission was last updated';
COMMENT ON COLUMN commissions.paid_at IS 'Timestamp when commission was paid';
COMMENT ON COLUMN commissions.notes IS 'Additional notes about the commission';
