-- Migration: Create Affiliate Withdrawals Table
-- Purpose: Track affiliate withdrawal requests and payments
-- Date: 2024-01-XX
-- Description: Creates affiliate_withdrawals table to manage affiliate payouts

-- Create affiliate_withdrawals table
CREATE TABLE affiliate_withdrawals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by INTEGER REFERENCES employees(id),
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);
CREATE INDEX idx_affiliate_withdrawals_requested_at ON affiliate_withdrawals(requested_at);
CREATE INDEX idx_affiliate_withdrawals_processed_at ON affiliate_withdrawals(processed_at);
CREATE INDEX idx_affiliate_withdrawals_payment_method ON affiliate_withdrawals(payment_method);

-- Add comments for documentation
COMMENT ON TABLE affiliate_withdrawals IS 'Affiliate withdrawal requests and payment tracking';
COMMENT ON COLUMN affiliate_withdrawals.id IS 'Unique identifier for withdrawal request';
COMMENT ON COLUMN affiliate_withdrawals.affiliate_id IS 'Reference to affiliate requesting withdrawal';
COMMENT ON COLUMN affiliate_withdrawals.amount IS 'Withdrawal amount requested';
COMMENT ON COLUMN affiliate_withdrawals.payment_method IS 'Payment method (bank_transfer, paypal, baridimob, etc.)';
COMMENT ON COLUMN affiliate_withdrawals.payment_details IS 'Payment details (account info, etc.) as JSON';
COMMENT ON COLUMN affiliate_withdrawals.status IS 'Withdrawal status (pending, approved, paid, rejected)';
COMMENT ON COLUMN affiliate_withdrawals.requested_at IS 'Timestamp when withdrawal was requested';
COMMENT ON COLUMN affiliate_withdrawals.processed_at IS 'Timestamp when withdrawal was processed';
COMMENT ON COLUMN affiliate_withdrawals.processed_by IS 'Reference to employee who processed the withdrawal';
COMMENT ON COLUMN affiliate_withdrawals.notes IS 'Additional notes about the withdrawal';
COMMENT ON COLUMN affiliate_withdrawals.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN affiliate_withdrawals.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN affiliate_withdrawals.updated_at IS 'Timestamp when record was last updated';
