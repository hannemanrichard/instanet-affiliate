-- Printed Products Inventory Tracking
-- Migration: 008_add_printed_products_tracking.sql
-- This migration adds tracking for printed products as physical inventory items

-- ==============================================
-- 1. PRINTED PRODUCTS INVENTORY
-- ==============================================

-- Track printed products as physical inventory items
CREATE TABLE printed_products_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  design_product_id UUID NOT NULL REFERENCES design_products(id),
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  design_id UUID NOT NULL REFERENCES designs(id),
  
  -- Physical product details
  sku VARCHAR(100) NOT NULL UNIQUE, -- Generated SKU for this specific printed product
  batch_number VARCHAR(50), -- Print batch for quality tracking
  print_job_id UUID REFERENCES print_jobs(id),
  
  -- Product status
  status VARCHAR(50) NOT NULL DEFAULT 'printed', -- "printed", "shipped", "delivered", "returned", "damaged", "sold"
  condition VARCHAR(50) DEFAULT 'new', -- "new", "used", "damaged", "defective"
  
  -- Quality control
  quality_check_passed BOOLEAN DEFAULT NULL, -- NULL = not checked, true = passed, false = failed
  quality_notes TEXT,
  quality_checked_by INTEGER REFERENCES partners(id),
  quality_checked_at TIMESTAMP WITH TIME ZONE,
  
  -- Physical tracking
  weight_grams DECIMAL(5,2), -- Actual weight after printing
  dimensions JSONB DEFAULT '{}', -- {"length": 70, "width": 50, "height": 2}
  
  -- Location tracking
  warehouse_location VARCHAR(100), -- Physical location in warehouse
  shelf_location VARCHAR(50), -- Specific shelf/bin location
  
  -- Financial tracking
  cost_of_goods DECIMAL(10,2), -- Total COG including printing
  print_cost DECIMAL(10,2), -- Cost of printing this specific item
  material_cost DECIMAL(10,2), -- Cost of blank garment
  
  -- Timestamps
  printed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. PRINTED PRODUCT MOVEMENTS
-- ==============================================

-- Track movements of printed products
CREATE TABLE printed_product_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printed_product_id UUID NOT NULL REFERENCES printed_products_inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- "printed", "shipped", "delivered", "returned", "damaged", "sold", "transferred"
  from_status VARCHAR(50), -- Previous status
  to_status VARCHAR(50), -- New status
  from_location VARCHAR(100), -- Previous location
  to_location VARCHAR(100), -- New location
  
  -- Reference information
  reference_type VARCHAR(50), -- "order", "return", "transfer", "quality_check"
  reference_id UUID, -- Order ID, return ID, etc.
  
  -- Movement details
  quantity INTEGER DEFAULT 1, -- Usually 1 for printed products
  notes TEXT,
  created_by INTEGER REFERENCES partners(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. RETURNED PRODUCTS TRACKING
-- ==============================================

-- Track returned printed products
CREATE TABLE returned_printed_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printed_product_id UUID NOT NULL REFERENCES printed_products_inventory(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  return_reason VARCHAR(100) NOT NULL, -- "defective", "wrong_size", "customer_change_mind", "damaged_shipping"
  return_condition VARCHAR(50) NOT NULL, -- "new", "used", "damaged", "defective"
  return_notes TEXT,
  
  -- Quality assessment
  can_resell BOOLEAN DEFAULT NULL, -- NULL = not assessed, true = can resell, false = cannot resell
  resell_price DECIMAL(10,2), -- If can be resold, what price
  disposal_reason TEXT, -- If cannot be resold, why
  
  -- Processing
  processed_by INTEGER REFERENCES partners(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_notes TEXT,
  
  -- Financial impact
  refund_amount DECIMAL(10,2),
  restocking_fee DECIMAL(10,2),
  disposal_cost DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. RESALE INVENTORY
-- ==============================================

-- Track returned products that can be resold
CREATE TABLE resale_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printed_product_id UUID NOT NULL REFERENCES printed_products_inventory(id),
  return_id UUID NOT NULL REFERENCES returned_printed_products(id),
  
  -- Resale details
  resale_price DECIMAL(10,2) NOT NULL,
  resale_commission DECIMAL(5,2) DEFAULT 0.0,
  resale_min_price DECIMAL(10,2),
  
  -- Marketing
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  discount_percentage DECIMAL(5,2) DEFAULT 0.0,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- "available", "reserved", "sold", "removed"
  condition_notes TEXT,
  
  -- Location
  warehouse_location VARCHAR(100),
  shelf_location VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. QUALITY CONTROL TRACKING
-- ==============================================

-- Track quality control for printed products
CREATE TABLE quality_control_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printed_product_id UUID NOT NULL REFERENCES printed_products_inventory(id),
  check_type VARCHAR(50) NOT NULL, -- "print_quality", "material_quality", "size_accuracy", "color_accuracy"
  
  -- Check results
  passed BOOLEAN NOT NULL,
  score INTEGER, -- 1-10 quality score
  notes TEXT,
  
  -- Check details
  checked_by INTEGER REFERENCES partners(id),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Photos/evidence
  evidence_photos TEXT[] DEFAULT '{}',
  measurements JSONB DEFAULT '{}', -- {"print_size": {"width": 12, "height": 16}, "garment_size": "L"}
  
  -- Follow-up
  requires_reprint BOOLEAN DEFAULT false,
  reprint_reason TEXT,
  reprint_completed BOOLEAN DEFAULT false
);

-- ==============================================
-- 6. UPDATE EXISTING TABLES
-- ==============================================

-- Add printed product reference to order items
ALTER TABLE order_items ADD COLUMN printed_product_id UUID REFERENCES printed_products_inventory(id);

-- Add tracking to print jobs
ALTER TABLE print_jobs ADD COLUMN batch_number VARCHAR(50);
ALTER TABLE print_jobs ADD COLUMN quality_notes TEXT;
ALTER TABLE print_jobs ADD COLUMN print_settings JSONB DEFAULT '{}';

-- ==============================================
-- 7. ADD CONSTRAINTS AND INDEXES
-- ==============================================

-- Add check constraints
ALTER TABLE printed_products_inventory ADD CONSTRAINT printed_product_status_check 
  CHECK (status IN ('printed', 'shipped', 'delivered', 'returned', 'damaged', 'sold'));

ALTER TABLE printed_products_inventory ADD CONSTRAINT printed_product_condition_check 
  CHECK (condition IN ('new', 'used', 'damaged', 'defective'));

ALTER TABLE printed_product_movements ADD CONSTRAINT movement_type_check 
  CHECK (movement_type IN ('printed', 'shipped', 'delivered', 'returned', 'damaged', 'sold', 'transferred'));

ALTER TABLE returned_printed_products ADD CONSTRAINT return_reason_check 
  CHECK (return_reason IN ('defective', 'wrong_size', 'customer_change_mind', 'damaged_shipping', 'quality_issue'));

ALTER TABLE returned_printed_products ADD CONSTRAINT return_condition_check 
  CHECK (return_condition IN ('new', 'used', 'damaged', 'defective'));

ALTER TABLE resale_inventory ADD CONSTRAINT resale_status_check 
  CHECK (status IN ('available', 'reserved', 'sold', 'removed'));

ALTER TABLE quality_control_checks ADD CONSTRAINT quality_score_check 
  CHECK (score >= 1 AND score <= 10);

-- Create indexes for performance
CREATE INDEX idx_printed_products_order_item ON printed_products_inventory(order_item_id);
CREATE INDEX idx_printed_products_design_product ON printed_products_inventory(design_product_id);
CREATE INDEX idx_printed_products_status ON printed_products_inventory(status);
CREATE INDEX idx_printed_products_sku ON printed_products_inventory(sku);
CREATE INDEX idx_printed_products_batch ON printed_products_inventory(batch_number);
CREATE INDEX idx_printed_products_location ON printed_products_inventory(warehouse_location, shelf_location);

CREATE INDEX idx_printed_product_movements_product ON printed_product_movements(printed_product_id);
CREATE INDEX idx_printed_product_movements_type ON printed_product_movements(movement_type);
CREATE INDEX idx_printed_product_movements_created ON printed_product_movements(created_at);

CREATE INDEX idx_returned_products_printed_product ON returned_printed_products(printed_product_id);
CREATE INDEX idx_returned_products_order ON returned_printed_products(order_id);
CREATE INDEX idx_returned_products_reason ON returned_printed_products(return_reason);
CREATE INDEX idx_returned_products_can_resell ON returned_printed_products(can_resell);

CREATE INDEX idx_resale_inventory_printed_product ON resale_inventory(printed_product_id);
CREATE INDEX idx_resale_inventory_status ON resale_inventory(status);
CREATE INDEX idx_resale_inventory_featured ON resale_inventory(is_featured);

CREATE INDEX idx_quality_checks_printed_product ON quality_control_checks(printed_product_id);
CREATE INDEX idx_quality_checks_type ON quality_control_checks(check_type);
CREATE INDEX idx_quality_checks_passed ON quality_control_checks(passed);

-- ==============================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for printed products with full details
CREATE VIEW printed_products_view AS
SELECT 
  ppi.id as printed_product_id,
  ppi.sku,
  ppi.batch_number,
  ppi.status,
  ppi.condition,
  ppi.quality_check_passed,
  ppi.warehouse_location,
  ppi.shelf_location,
  ppi.cost_of_goods,
  ppi.printed_at,
  ppi.shipped_at,
  ppi.delivered_at,
  
  -- Order details
  oi.order_id,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  
  -- Product details
  dp.name as design_product_name,
  d.title as design_title,
  pt.name as template_name,
  c.name as color_name,
  s.name as size_name,
  
  -- Order information
  o.order_number,
  o.status as order_status,
  o.created_at as order_date
FROM printed_products_inventory ppi
JOIN order_items oi ON ppi.order_item_id = oi.id
JOIN design_products dp ON ppi.design_product_id = dp.id
JOIN designs d ON ppi.design_id = d.id
JOIN product_templates pt ON ppi.product_template_id = pt.id
JOIN colors c ON ppi.color_id = c.id
JOIN sizes s ON ppi.size_id = s.id
JOIN orders o ON oi.order_id = o.id;

-- View for resale inventory
CREATE VIEW resale_inventory_view AS
SELECT 
  ri.id as resale_id,
  ri.resale_price,
  ri.resale_commission,
  ri.status as resale_status,
  ri.is_featured,
  ri.discount_percentage,
  ri.condition_notes,
  
  -- Printed product details
  ppi.sku,
  ppi.batch_number,
  ppi.condition,
  ppi.quality_check_passed,
  
  -- Product details
  dp.name as design_product_name,
  d.title as design_title,
  pt.name as template_name,
  c.name as color_name,
  s.name as size_name,
  
  -- Return details
  rpp.return_reason,
  rpp.return_condition,
  rpp.return_notes,
  rpp.refund_amount,
  rpp.restocking_fee
FROM resale_inventory ri
JOIN printed_products_inventory ppi ON ri.printed_product_id = ppi.id
JOIN returned_printed_products rpp ON ri.return_id = rpp.id
JOIN design_products dp ON ppi.design_product_id = dp.id
JOIN designs d ON ppi.design_id = d.id
JOIN product_templates pt ON ppi.product_template_id = pt.id
JOIN colors c ON ppi.color_id = c.id
JOIN sizes s ON ppi.size_id = s.id;

-- View for quality control summary
CREATE VIEW quality_control_summary_view AS
SELECT 
  qcc.printed_product_id,
  ppi.sku,
  ppi.batch_number,
  COUNT(qcc.id) as total_checks,
  COUNT(CASE WHEN qcc.passed = true THEN 1 END) as passed_checks,
  COUNT(CASE WHEN qcc.passed = false THEN 1 END) as failed_checks,
  AVG(qcc.score) as average_score,
  MAX(qcc.checked_at) as last_check_date,
  BOOL_OR(qcc.requires_reprint) as requires_reprint,
  BOOL_OR(qcc.reprint_completed) as reprint_completed
FROM quality_control_checks qcc
JOIN printed_products_inventory ppi ON qcc.printed_product_id = ppi.id
GROUP BY qcc.printed_product_id, ppi.sku, ppi.batch_number;
