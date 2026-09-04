-- Update Orders Structure for Design-Centric Model
-- Migration: 006_update_orders_for_design_products.sql
-- This migration updates the existing orders structure to support design products

-- ==============================================
-- 1. UPDATE EXISTING ORDERS TABLE
-- ==============================================

-- Add new columns to existing orders table
ALTER TABLE orders ADD COLUMN design_product_id UUID REFERENCES design_products(id);
ALTER TABLE orders ADD COLUMN print_instructions JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN mockup_url VARCHAR(500);

-- ==============================================
-- 2. CREATE ORDER ITEMS TABLE
-- ==============================================

-- Order items with design product details
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  design_product_id UUID NOT NULL REFERENCES design_products(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  print_instructions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. CREATE FULFILLMENT TRACKING
-- ==============================================

-- Fulfillment status for each order item
CREATE TABLE order_item_fulfillment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  print_status VARCHAR(50) DEFAULT 'not_started', -- "not_started", "printing", "completed"
  physical_inventory_id UUID REFERENCES physical_inventory(id),
  print_file_url VARCHAR(500),
  print_notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. CREATE PRINT JOB TRACKING
-- ==============================================

-- Print jobs for fulfillment
CREATE TABLE print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  design_id UUID NOT NULL REFERENCES designs(id),
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  print_area VARCHAR(50) NOT NULL, -- "front", "back", "sleeve"
  print_file_url VARCHAR(500) NOT NULL,
  print_settings JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  priority INTEGER DEFAULT 0,
  assigned_to INTEGER REFERENCES partners(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. ADD CONSTRAINTS AND INDEXES
-- ==============================================

-- Add check constraints
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check 
  CHECK (quantity > 0);

ALTER TABLE order_items ADD CONSTRAINT order_items_price_check 
  CHECK (unit_price > 0 AND total_price > 0);

ALTER TABLE order_item_fulfillment ADD CONSTRAINT fulfillment_status_check 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE order_item_fulfillment ADD CONSTRAINT print_status_check 
  CHECK (print_status IN ('not_started', 'printing', 'completed', 'failed'));

ALTER TABLE print_jobs ADD CONSTRAINT print_job_status_check 
  CHECK (status IN ('queued', 'in_progress', 'completed', 'failed', 'cancelled'));

-- Create indexes for performance
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_design_product ON order_items(design_product_id);
CREATE INDEX idx_order_items_color_size ON order_items(color_id, size_id);
CREATE INDEX idx_order_item_fulfillment_item ON order_item_fulfillment(order_item_id);
CREATE INDEX idx_order_item_fulfillment_status ON order_item_fulfillment(status);
CREATE INDEX idx_print_jobs_order_item ON print_jobs(order_item_id);
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_print_jobs_priority ON print_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_print_jobs_assigned ON print_jobs(assigned_to);

-- ==============================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for order details with design product information
CREATE VIEW order_details_view AS
SELECT 
  o.id as order_id,
  o.order_number,
  o.status as order_status,
  o.total_amount,
  o.created_at as order_date,
  dp.id as design_product_id,
  dp.name as product_name,
  d.title as design_title,
  pt.name as template_name,
  c.name as color_name,
  s.name as size_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oif.status as fulfillment_status,
  oif.print_status
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN design_products dp ON oi.design_product_id = dp.id
LEFT JOIN designs d ON dp.design_id = d.id
LEFT JOIN product_templates pt ON dp.product_template_id = pt.id
LEFT JOIN colors c ON oi.color_id = c.id
LEFT JOIN sizes s ON oi.size_id = s.id
LEFT JOIN order_item_fulfillment oif ON oi.id = oif.order_item_id;

-- View for inventory status
CREATE VIEW inventory_status_view AS
SELECT 
  pt.name as template_name,
  c.name as color_name,
  s.name as size_name,
  pi.quantity,
  pi.reserved_quantity,
  pi.quantity - pi.reserved_quantity as available_quantity,
  pi.reorder_point,
  CASE 
    WHEN pi.quantity - pi.reserved_quantity <= pi.reorder_point THEN 'low_stock'
    WHEN pi.quantity - pi.reserved_quantity = 0 THEN 'out_of_stock'
    ELSE 'in_stock'
  END as stock_status
FROM physical_inventory pi
JOIN product_templates pt ON pi.product_template_id = pt.id
JOIN colors c ON pi.color_id = c.id
JOIN sizes s ON pi.size_id = s.id;

-- View for design product catalog
CREATE VIEW design_product_catalog_view AS
SELECT 
  dp.id as design_product_id,
  dp.name as product_name,
  dp.description,
  dp.retail_price,
  dp.wholesale_price,
  dp.is_active,
  dp.is_featured,
  d.title as design_title,
  d.thumbnail_url as design_thumbnail,
  d.design_category_id,
  dc.name as design_category_name,
  pt.name as template_name,
  pt.category_id,
  c.name as category_name,
  dp.created_at
FROM design_products dp
JOIN designs d ON dp.design_id = d.id
JOIN design_categories dc ON d.design_category_id = dc.id
JOIN product_templates pt ON dp.product_template_id = pt.id
JOIN categories c ON pt.category_id = c.id;
