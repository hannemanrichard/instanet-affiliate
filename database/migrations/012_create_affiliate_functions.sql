-- Migration: Create Affiliate Management Functions
-- Purpose: Add helper functions for affiliate operations
-- Date: 2024-01-XX
-- Description: Creates functions for common affiliate operations

-- Function to get affiliate statistics (handles nullable affiliate_id)
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_leads BIGINT,
  total_orders BIGINT,
  total_commissions DECIMAL(10,2),
  total_withdrawals DECIMAL(10,2),
  pending_commissions DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(leads.count, 0) as total_leads,
    COALESCE(orders.count, 0) as total_orders,
    COALESCE(commissions.total, 0) as total_commissions,
    COALESCE(withdrawals.total, 0) as total_withdrawals,
    COALESCE(pending_commissions.total, 0) as pending_commissions
  FROM (
    SELECT COUNT(*) as count
    FROM leads 
    WHERE affiliate_id = affiliate_id_param
  ) leads
  CROSS JOIN (
    SELECT COUNT(*) as count
    FROM orders 
    WHERE affiliate_id = affiliate_id_param
  ) orders
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) commissions
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM withdraws 
    WHERE affiliate_id = affiliate_id_param
  ) withdrawals
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param 
    AND status = 'pending'
  ) pending_commissions;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing affiliates
CREATE OR REPLACE FUNCTION get_top_affiliates(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  affiliate_id INTEGER,
  fullname VARCHAR(255),
  email VARCHAR(255),
  total_commissions DECIMAL(10,2),
  total_orders BIGINT,
  conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as affiliate_id,
    a.fullname,
    a.email,
    COALESCE(commissions.total, 0) as total_commissions,
    COALESCE(orders.count, 0) as total_orders,
    CASE 
      WHEN COALESCE(leads.count, 0) > 0 
      THEN ROUND((COALESCE(orders.count, 0)::DECIMAL / leads.count::DECIMAL) * 100, 2)
      ELSE 0 
    END as conversion_rate
  FROM affiliates a
  LEFT JOIN (
    SELECT affiliate_id, COUNT(*) as count
    FROM leads 
    WHERE affiliate_id IS NOT NULL
    GROUP BY affiliate_id
  ) leads ON a.id = leads.affiliate_id
  LEFT JOIN (
    SELECT affiliate_id, COUNT(*) as count
    FROM orders 
    WHERE affiliate_id IS NOT NULL
    GROUP BY affiliate_id
  ) orders ON a.id = orders.affiliate_id
  LEFT JOIN (
    SELECT affiliate_id, SUM(amount) as total
    FROM commissions 
    WHERE affiliate_id IS NOT NULL
    GROUP BY affiliate_id
  ) commissions ON a.id = commissions.affiliate_id
  WHERE a.status = 'active'
  ORDER BY total_commissions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update affiliate status
CREATE OR REPLACE FUNCTION update_affiliate_status(
  affiliate_id_param INTEGER,
  new_status VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate status
  IF new_status NOT IN ('active', 'inactive', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  -- Update affiliate status
  UPDATE affiliates 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = affiliate_id_param;
  
  -- Return true if row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate affiliate commission (order_id is UUID)
-- Commission is created as "pending" and remains pending until order delivery
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
  affiliate_id_param INTEGER,
  order_id_param VARCHAR(255), -- UUID string
  order_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 10.0,
  qty_param INTEGER DEFAULT 1
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  commission_amount DECIMAL(10,2);
BEGIN
  -- Calculate commission
  commission_amount := order_amount * (commission_rate / 100);
  
  -- Insert commission record (always starts as "pending")
  INSERT INTO commissions (
    affiliate_id,
    order_id,
    amount,
    commission_rate,
    order_amount,
    qty,
    status,
    created_at,
    updated_at
  ) VALUES (
    affiliate_id_param,
    order_id_param,
    commission_amount,
    commission_rate,
    order_amount,
    qty_param,
    'pending', -- Always pending until delivery
    NOW(),
    NOW()
  );
  
  RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to get order statistics (handles nullable affiliate_id)
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL(10,2),
  orders_with_affiliate BIGINT,
  orders_without_affiliate BIGINT,
  affiliate_orders_revenue DECIMAL(10,2),
  non_affiliate_orders_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(total.count, 0) as total_orders,
    COALESCE(total.revenue, 0) as total_revenue,
    COALESCE(affiliate.count, 0) as orders_with_affiliate,
    COALESCE(non_affiliate.count, 0) as orders_without_affiliate,
    COALESCE(affiliate.revenue, 0) as affiliate_orders_revenue,
    COALESCE(non_affiliate.revenue, 0) as non_affiliate_orders_revenue
  FROM (
    SELECT COUNT(*) as count, SUM(total) as revenue
    FROM orders 
    WHERE deleted_at IS NULL
  ) total
  CROSS JOIN (
    SELECT COUNT(*) as count, SUM(total) as revenue
    FROM orders 
    WHERE affiliate_id IS NOT NULL AND deleted_at IS NULL
  ) affiliate
  CROSS JOIN (
    SELECT COUNT(*) as count, SUM(total) as revenue
    FROM orders 
    WHERE affiliate_id IS NULL AND deleted_at IS NULL
  ) non_affiliate;
END;
$$ LANGUAGE plpgsql;

-- Function to get commission statistics for an affiliate
CREATE OR REPLACE FUNCTION get_commission_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_commissions BIGINT,
  total_amount DECIMAL(10,2),
  pending_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  average_commission_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(total.count, 0) as total_commissions,
    COALESCE(total.amount, 0) as total_amount,
    COALESCE(pending.amount, 0) as pending_amount,
    COALESCE(paid.amount, 0) as paid_amount,
    COALESCE(avg_rate.rate, 0) as average_commission_rate
  FROM (
    SELECT COUNT(*) as count, SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) total
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param AND status = 'pending'
  ) pending
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param AND status = 'paid'
  ) paid
  CROSS JOIN (
    SELECT AVG(commission_rate) as rate
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) avg_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get withdrawal statistics for an affiliate
CREATE OR REPLACE FUNCTION get_withdrawal_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_withdrawals BIGINT,
  total_amount DECIMAL(10,2),
  pending_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  rejected_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(total.count, 0) as total_withdrawals,
    COALESCE(total.amount, 0) as total_amount,
    COALESCE(pending.amount, 0) as pending_amount,
    COALESCE(paid.amount, 0) as paid_amount,
    COALESCE(rejected.amount, 0) as rejected_amount
  FROM (
    SELECT COUNT(*) as count, SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param
  ) total
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'pending'
  ) pending
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'paid'
  ) paid
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'rejected'
  ) rejected;
END;
$$ LANGUAGE plpgsql;

-- Function to process a withdrawal request
CREATE OR REPLACE FUNCTION process_withdrawal(
  withdrawal_id_param INTEGER,
  processed_by_param INTEGER,
  new_status VARCHAR(50),
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate status
  IF new_status NOT IN ('approved', 'paid', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  -- Update withdrawal status
  UPDATE affiliate_withdrawals 
  SET 
    status = new_status,
    processed_at = NOW(),
    processed_by = processed_by_param,
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = withdrawal_id_param;
  
  -- Return true if row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to approve commission when order is delivered
CREATE OR REPLACE FUNCTION approve_commission_on_delivery(order_id_param VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  -- Update commission status to approved when order is delivered
  UPDATE commissions 
  SET 
    status = 'approved',
    updated_at = NOW()
  WHERE order_id = order_id_param 
    AND status = 'pending';
  
  -- Return true if any commission was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get affiliate available balance (approved commissions only)
CREATE OR REPLACE FUNCTION get_affiliate_available_balance(affiliate_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  available_balance DECIMAL(10,2);
BEGIN
  -- Calculate available balance (approved commissions minus paid withdrawals)
  SELECT COALESCE(
    (SELECT SUM(amount) FROM commissions 
     WHERE affiliate_id = affiliate_id_param AND status = 'approved') -
    (SELECT SUM(amount) FROM affiliate_withdrawals 
     WHERE affiliate_id = affiliate_id_param AND status IN ('paid', 'pending')),
    0
  ) INTO available_balance;
  
  RETURN COALESCE(available_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION get_affiliate_stats(INTEGER) IS 'Get comprehensive statistics for an affiliate';
COMMENT ON FUNCTION get_top_affiliates(INTEGER) IS 'Get top performing affiliates by commission';
COMMENT ON FUNCTION update_affiliate_status(INTEGER, VARCHAR) IS 'Update affiliate status with validation';
COMMENT ON FUNCTION calculate_affiliate_commission(INTEGER, DECIMAL, DECIMAL) IS 'Calculate and record affiliate commission';
COMMENT ON FUNCTION get_order_stats() IS 'Get order statistics including affiliate vs non-affiliate breakdown';
COMMENT ON FUNCTION get_commission_stats(INTEGER) IS 'Get commission statistics for an affiliate';
COMMENT ON FUNCTION get_withdrawal_stats(INTEGER) IS 'Get withdrawal statistics for an affiliate';
COMMENT ON FUNCTION process_withdrawal(INTEGER, INTEGER) IS 'Process a withdrawal request';
COMMENT ON FUNCTION approve_commission_on_delivery(VARCHAR) IS 'Approve commission when order is delivered';
COMMENT ON FUNCTION get_affiliate_available_balance(INTEGER) IS 'Get affiliate available balance (approved commissions only)';
