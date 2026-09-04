-- Design-Centric Print-on-Demand Platform Schema
-- Migration: 005_create_design_centric_tables.sql
-- This migration creates a fully normalized schema for print-on-demand operations

-- ==============================================
-- 1. CORE REFERENCE TABLES
-- ==============================================

-- Categories for product templates (apparel, accessories, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design categories (anime, sports, abstract, etc.)
CREATE TABLE design_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colors reference table
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_code VARCHAR(7), -- #FF0000
  is_active BOOLEAN DEFAULT true
);

-- Sizes reference table
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Design types (graphic, text, logo, pattern)
CREATE TABLE design_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- ==============================================
-- 2. PRODUCT TEMPLATES (Physical Garments)
-- ==============================================

CREATE TABLE product_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  base_weight DECIMAL(5,2), -- grams
  base_cost DECIMAL(10,2), -- cost per blank garment
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available colors for each product template
CREATE TABLE product_template_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_template_id UUID NOT NULL REFERENCES product_templates(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_template_id, color_id)
);

-- Available sizes for each product template
CREATE TABLE product_template_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_template_id UUID NOT NULL REFERENCES product_templates(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_template_id, size_id)
);

-- Print areas for each product template
CREATE TABLE product_template_print_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_template_id UUID NOT NULL REFERENCES product_templates(id) ON DELETE CASCADE,
  area_name VARCHAR(50) NOT NULL, -- "front", "back", "sleeve"
  width_cm DECIMAL(5,2) NOT NULL,
  height_cm DECIMAL(5,2) NOT NULL,
  position_x DECIMAL(5,2) DEFAULT 0,
  position_y DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. DESIGNS (Artwork/Graphics)
-- ==============================================

CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  design_type_id UUID NOT NULL REFERENCES design_types(id),
  design_category_id UUID REFERENCES design_categories(id),
  design_file_url VARCHAR(500), -- High-res design file
  thumbnail_url VARCHAR(500), -- Preview image
  design_metadata JSONB DEFAULT '{}', -- Colors, dimensions, print requirements
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES partners(id), -- Design creator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design tags (many-to-many)
CREATE TABLE design_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(design_id, tag)
);

-- Design preview images
CREATE TABLE design_preview_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(50) NOT NULL, -- "front_view", "back_view", "detail"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. DESIGN PRODUCTS (Virtual Products = Design + Template)
-- ==============================================

CREATE TABLE design_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  product_template_id UUID NOT NULL REFERENCES product_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- "Luffy Gear 5 Hoodie"
  description TEXT,
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  retail_commission DECIMAL(5,2) DEFAULT 0.0,
  wholesale_commission DECIMAL(5,2) DEFAULT 0.0,
  retail_min_price DECIMAL(10,2),
  wholesale_min_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(design_id, product_template_id)
);

-- Mockup images for design products
CREATE TABLE design_product_mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_product_id UUID NOT NULL REFERENCES design_products(id) ON DELETE CASCADE,
  mockup_url VARCHAR(500) NOT NULL,
  mockup_type VARCHAR(50) NOT NULL, -- "front", "back", "side", "detail"
  color_id UUID REFERENCES colors(id),
  size_id UUID REFERENCES sizes(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. PHYSICAL INVENTORY (Blank Garments)
-- ==============================================

CREATE TABLE physical_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Reserved for pending orders
  reorder_point INTEGER DEFAULT 10,
  cost_per_unit DECIMAL(10,2),
  supplier_info JSONB DEFAULT '{}',
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_template_id, color_id, size_id)
);

-- Inventory movements tracking
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physical_inventory_id UUID NOT NULL REFERENCES physical_inventory(id),
  movement_type VARCHAR(20) NOT NULL, -- "in", "out", "reserved", "unreserved"
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- "order", "restock", "adjustment"
  reference_id UUID, -- Order ID, restock ID, etc.
  notes TEXT,
  created_by INTEGER REFERENCES partners(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 6. PRICING AND COMMISSION STRUCTURE
-- ==============================================

-- Commission rates by partner level
CREATE TABLE commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_level VARCHAR(50) NOT NULL, -- "bronze", "silver", "gold", "platinum"
  design_product_id UUID REFERENCES design_products(id),
  product_template_id UUID REFERENCES product_templates(id),
  commission_type VARCHAR(20) NOT NULL, -- "retail", "wholesale"
  rate DECIMAL(5,2) NOT NULL, -- percentage
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic pricing rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- "volume_discount", "seasonal", "partner_tier"
  conditions JSONB NOT NULL, -- Rule conditions
  adjustments JSONB NOT NULL, -- Price adjustments
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 7. ADD CONSTRAINTS AND INDEXES
-- ==============================================

-- Add check constraints
ALTER TABLE product_template_print_areas ADD CONSTRAINT print_areas_dimensions_check 
  CHECK (width_cm > 0 AND height_cm > 0);

ALTER TABLE physical_inventory ADD CONSTRAINT inventory_quantity_check 
  CHECK (quantity >= 0 AND reserved_quantity >= 0);

ALTER TABLE inventory_movements ADD CONSTRAINT movement_quantity_check 
  CHECK (quantity != 0);

ALTER TABLE inventory_movements ADD CONSTRAINT movement_type_check 
  CHECK (movement_type IN ('in', 'out', 'reserved', 'unreserved'));

ALTER TABLE commission_rates ADD CONSTRAINT commission_rate_check 
  CHECK (rate >= 0 AND rate <= 100);

ALTER TABLE design_products ADD CONSTRAINT price_check 
  CHECK (retail_price > 0 AND wholesale_price > 0);

-- Create indexes for performance
CREATE INDEX idx_product_templates_category ON product_templates(category_id);
CREATE INDEX idx_designs_category ON designs(design_category_id);
CREATE INDEX idx_designs_type ON designs(design_type_id);
CREATE INDEX idx_designs_creator ON designs(created_by);
CREATE INDEX idx_design_products_template ON design_products(product_template_id);
CREATE INDEX idx_design_products_design ON design_products(design_id);
CREATE INDEX idx_physical_inventory_template ON physical_inventory(product_template_id);
CREATE INDEX idx_physical_inventory_color_size ON physical_inventory(color_id, size_id);
CREATE INDEX idx_inventory_movements_inventory ON inventory_movements(physical_inventory_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_commission_rates_level ON commission_rates(partner_level);
CREATE INDEX idx_commission_rates_type ON commission_rates(commission_type);

-- Create full-text search indexes
CREATE INDEX idx_designs_search ON designs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_design_products_search ON design_products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
