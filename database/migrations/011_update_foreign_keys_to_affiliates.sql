-- Migration: Update Foreign Key References to Affiliates
-- Purpose: Update tables that reference partners to use affiliates instead
-- Date: 2024-01-XX
-- Description: Updates commissions, leads, orders, parcels, and withdraws tables

-- 1. Update Commissions Table
-- Add new affiliate_id column
ALTER TABLE commissions ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint
ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_affiliate_id 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_commissions_affiliate_id ON commissions(affiliate_id);

-- 2. Update Leads Table
-- Add new affiliate_id column
ALTER TABLE leads ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint
ALTER TABLE leads 
ADD CONSTRAINT fk_leads_affiliate_id 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_leads_affiliate_id ON leads(affiliate_id);

-- 3. Update Orders Table
-- Add new affiliate_id column (nullable for orders from other ecosystem apps)
ALTER TABLE orders ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint (nullable)
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_affiliate_id 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_orders_affiliate_id ON orders(affiliate_id);

-- 4. Update Parcels Table
-- Add new affiliate_id column
ALTER TABLE parcels ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint
ALTER TABLE parcels 
ADD CONSTRAINT fk_parcels_affiliate_id 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_parcels_affiliate_id ON parcels(affiliate_id);

-- 5. Update Withdraws Table
-- Add new affiliate_id column
ALTER TABLE withdraws ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint
ALTER TABLE withdraws 
ADD CONSTRAINT fk_withdraws_affiliate_id 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_withdraws_affiliate_id ON withdraws(affiliate_id);

-- Add comments for documentation
COMMENT ON COLUMN commissions.affiliate_id IS 'Reference to affiliate who earned this commission';
COMMENT ON COLUMN leads.affiliate_id IS 'Reference to affiliate who generated this lead';
COMMENT ON COLUMN orders.affiliate_id IS 'Reference to affiliate who generated this order';
COMMENT ON COLUMN parcels.affiliate_id IS 'Reference to affiliate for this parcel';
COMMENT ON COLUMN withdraws.affiliate_id IS 'Reference to affiliate requesting this withdrawal';
