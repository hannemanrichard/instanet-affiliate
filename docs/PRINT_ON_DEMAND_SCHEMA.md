# Print-on-Demand Database Schema

## Overview

This schema supports a print-on-demand platform where:

1. **Empty garments** are tracked in inventory (hoodies, t-shirts, etc.)
2. **Designs** can be printed on any product
3. **Product designs** are combinations of empty products + designs
4. **Physical printed products** are created when orders are fulfilled
5. **Returns** go back to physical printed inventory for potential resale

## Core Workflow

```
Empty Garments → Product Designs → Orders → Physical Printed Products
     ↓              ↓              ↓              ↓
  Inventory    AI Gallery Gen   Fulfillment   Return/Resale
```

## Database Schema

### 1. Product Templates (Garment Types)

```sql
CREATE TABLE product_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- "Hoodie", "T-Shirt", "Tank Top"
  description TEXT,
  category VARCHAR(50) NOT NULL, -- "tops", "bottoms", "accessories"
  base_cost DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Products (Empty Garments with Color)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color VARCHAR(50) NOT NULL, -- "Black", "White", "Red"
  color_hex VARCHAR(7), -- "#000000"

  -- Gallery of empty product photos
  gallery_urls JSONB, -- ["url1", "url2", "url3"]
  primary_image_url VARCHAR(500),

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_template_id, color)
);

-- Available sizes for each product
CREATE TABLE product_sizes (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  size VARCHAR(20) NOT NULL, -- "S", "M", "L", "XL", "XXL"
  sort_order INTEGER,

  UNIQUE(product_id, size)
);
```

### 3. Designs (Artwork)

```sql
CREATE TABLE designs (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL, -- "Sharingan", "Lakers Logo"
  description TEXT,

  -- Design files
  design_file_url VARCHAR(500) NOT NULL, -- High-res design file
  thumbnail_url VARCHAR(500),

  -- Design metadata
  category VARCHAR(50), -- "anime", "sports", "minimalist"
  tags JSONB, -- ["anime", "naruto", "eyes"]

  -- Print specifications
  print_areas JSONB, -- {"front": true, "back": false, "sleeve": true}
  print_size VARCHAR(50), -- "small", "medium", "large"

  -- Status
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES affiliates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Product Designs (Empty Product + Design)

```sql
CREATE TABLE product_designs (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  design_id UUID NOT NULL REFERENCES designs(id),

  -- Product design details
  name VARCHAR(200) NOT NULL, -- "Sharingan Black Hoodie"
  description TEXT,

  -- Print placement
  print_placement VARCHAR(50) NOT NULL, -- "front", "back", "sleeve", "full"

  -- AI-generated gallery (empty product gallery + design)
  design_gallery_urls JSONB, -- AI-generated images showing design on product
  primary_design_image_url VARCHAR(500),

  -- Pricing
  price DECIMAL(10,2) NOT NULL, -- Calculated: products.base_price + design_markup
  design_markup DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Markup added to base_price
  price_updated_at TIMESTAMP WITH TIME ZONE, -- When price was last updated
  commission_rate DECIMAL(5,2) DEFAULT 0.1,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, design_id, print_placement)
);
```

### 5. Raw Inventory (Empty Garments)

```sql
CREATE TABLE raw_inventory (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  size VARCHAR(20) NOT NULL,

  -- Inventory tracking
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Committed to pending orders
  reorder_point INTEGER DEFAULT 10,

  -- Cost tracking
  cost_per_unit DECIMAL(10,2),

  -- Location
  warehouse_location VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, size)
);
```

### 6. Physical Printed Inventory (Printed Products)

```sql
CREATE TABLE physical_printed_inventory (
  id UUID PRIMARY KEY,
  product_design_id UUID NOT NULL REFERENCES product_designs(id),

  size VARCHAR(20) NOT NULL,

  -- Physical product details
  sku VARCHAR(100) NOT NULL UNIQUE, -- "SHAR-HOD-BLK-L-241201"
  batch_number VARCHAR(50),

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'printed', -- 'printed', 'shipped', 'delivered', 'returned'
  condition VARCHAR(50) DEFAULT 'new', -- 'new', 'used', 'damaged'

  -- Quality control
  quality_check_passed BOOLEAN DEFAULT NULL,
  quality_notes TEXT,

  -- Location tracking
  warehouse_location VARCHAR(100),
  shelf_location VARCHAR(50),

  -- Financial tracking
  cost_of_goods DECIMAL(10,2),
  print_cost DECIMAL(10,2),
  material_cost DECIMAL(10,2),

  -- Return handling
  return_reason VARCHAR(100),
  can_resell BOOLEAN DEFAULT false,
  resale_price DECIMAL(10,2),

  -- Timestamps
  printed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Order Processing

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  size VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Fulfillment tracking
  printed_product_id UUID REFERENCES physical_printed_inventory(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'printed', 'shipped', 'delivered', 'returned'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE print_jobs (
  id UUID PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  size VARCHAR(20) NOT NULL,

  -- Print details
  design_file_url VARCHAR(500) NOT NULL,
  print_placement VARCHAR(50) NOT NULL,

  -- Job tracking
  status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'printing', 'completed', 'failed'
  batch_number VARCHAR(50),
  assigned_printer VARCHAR(100),

  -- Timestamps
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How It Works

### 1. Product Creation Flow

```sql
-- 1. Create product template
INSERT INTO product_templates (name, category, base_cost)
VALUES ('Hoodie', 'tops', 15.00);

-- 2. Create product (black hoodie)
INSERT INTO products (product_template_id, color, color_hex, gallery_urls, base_price)
VALUES (
  'template-uuid',
  'Black',
  '#000000',
  '["url1", "url2", "url3"]',
  25.00
);

-- 3. Add sizes
INSERT INTO product_sizes (product_id, size, sort_order)
VALUES
  ('product-uuid', 'S', 1),
  ('product-uuid', 'M', 2),
  ('product-uuid', 'L', 3),
  ('product-uuid', 'XL', 4),
  ('product-uuid', 'XXL', 5);

-- 4. Add to raw inventory
INSERT INTO raw_inventory (product_id, size, quantity, cost_per_unit)
VALUES
  ('product-uuid', 'S', 100, 15.00),
  ('product-uuid', 'M', 100, 15.00),
  ('product-uuid', 'L', 100, 15.00);
```

### 2. Design Creation Flow

```sql
-- 1. Create design
INSERT INTO designs (title, design_file_url, print_areas, category)
VALUES (
  'Sharingan',
  'https://storage.com/designs/sharingan.png',
  '{"front": true, "back": false}',
  'anime'
);

-- 2. Create product design (Sharingan + Black Hoodie)
INSERT INTO product_designs (product_id, design_id, name, print_placement, price)
VALUES (
  'black-hoodie-uuid',
  'sharingan-uuid',
  'Sharingan Black Hoodie',
  'front',
  45.99
);

-- 3. AI generates design gallery (empty product gallery + design)
UPDATE product_designs
SET design_gallery_urls = '["ai-generated-url1", "ai-generated-url2"]'
WHERE id = 'product-design-uuid';
```

### 3. Order Processing Flow

```sql
-- 1. Customer orders "Sharingan Black Hoodie" size L
INSERT INTO order_items (order_id, product_design_id, size, quantity, unit_price, total_price)
VALUES ('order-uuid', 'product-design-uuid', 'L', 1, 45.99, 45.99);

-- 2. Reserve raw inventory
UPDATE raw_inventory
SET reserved_quantity = reserved_quantity + 1
WHERE product_id = 'black-hoodie-uuid' AND size = 'L';

-- 3. Create print job
INSERT INTO print_jobs (order_item_id, product_design_id, size, design_file_url, print_placement)
VALUES ('order-item-uuid', 'product-design-uuid', 'L', 'design-url', 'front');

-- 4. After printing, create physical product
INSERT INTO physical_printed_inventory (
  product_design_id, size, sku, status, printed_at
)
VALUES (
  'product-design-uuid',
  'L',
  'SHAR-HOD-BLK-L-241201',
  'printed',
  NOW()
);

-- 5. Update raw inventory (consume reserved stock)
UPDATE raw_inventory
SET quantity = quantity - 1, reserved_quantity = reserved_quantity - 1
WHERE product_id = 'black-hoodie-uuid' AND size = 'L';
```

### 4. Return Processing Flow

```sql
-- 1. Customer returns product
UPDATE physical_printed_inventory
SET status = 'returned',
    condition = 'used',
    return_reason = 'wrong_size',
    returned_at = NOW(),
    can_resell = true,
    resale_price = 35.99, -- 75% of original price
    warehouse_location = 'resale_section'
WHERE id = 'printed-product-uuid';

-- 2. Check resale inventory
SELECT * FROM physical_printed_inventory
WHERE status = 'returned'
  AND can_resell = true
  AND warehouse_location = 'resale_section';
```

## Key Benefits

### ✅ **Clear Separation**

- **Raw inventory**: Empty garments ready for printing
- **Physical printed inventory**: Actual printed products
- **Product designs**: Virtual combinations for display

### ✅ **AI Integration Ready**

- Empty product galleries for AI input
- Design galleries for AI output
- Clear data structure for AI processing

### ✅ **Complete Tracking**

- From raw materials to finished products
- Return and resale handling
- Quality control and batch tracking

### ✅ **Scalable Design System**

- Designs can be applied to any product
- Multiple print placements per design
- Easy to add new products and designs

### ✅ **Efficient Inventory Management**

- Reserve system prevents overselling
- Clear separation of raw vs printed inventory
- Return processing with resale potential

## Sample Data Structure

```json
{
  "product_template": {
    "name": "Hoodie",
    "category": "tops"
  },
  "product": {
    "color": "Black",
    "gallery_urls": ["empty-hoodie-1.jpg", "empty-hoodie-2.jpg"],
    "sizes": ["S", "M", "L", "XL", "XXL"]
  },
  "design": {
    "title": "Sharingan",
    "print_areas": { "front": true, "back": false }
  },
  "product_design": {
    "name": "Sharingan Black Hoodie",
    "design_gallery_urls": ["ai-generated-1.jpg", "ai-generated-2.jpg"],
    "print_placement": "front"
  }
}
```

This schema perfectly matches your workflow and supports the complete print-on-demand process from empty garments to finished products with return handling.
