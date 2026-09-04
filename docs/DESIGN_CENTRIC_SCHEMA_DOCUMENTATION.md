# Print-on-Demand Platform Database Schema

## The Problem

Your current database treats each product variant as separate inventory. For print-on-demand, this doesn't work because:

- **You only stock**: Blank garments (hoodies, t-shirts)
- **Customers see**: Thousands of "products" (Luffy hoodie, Lakers t-shirt)
- **Reality**: Print design on blank garment when ordered

## The Solution

Separate **designs** from **physical garments**:

```
Physical:  Blank Garments (Hoodie Black L, T-Shirt White M)
Designs:   Artwork (Luffy Gear 5, Lakers Logo)
Products:  Virtual combinations (Luffy Hoodie, Lakers T-Shirt)
Result:    Print Design + Blank Garment = Unique Product
```

## Simplified Database Schema

### 1. Reference Tables

#### Colors & Sizes

```sql
CREATE TABLE colors (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_code VARCHAR(7)
);

CREATE TABLE sizes (
  id UUID PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  sort_order INTEGER
);
```

#### Categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id)
);

CREATE TABLE design_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);
```

### 2. Product Templates (Physical Garments)

```sql
CREATE TABLE product_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  base_cost DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true
);

-- Available colors for each template
CREATE TABLE product_template_colors (
  product_template_id UUID REFERENCES product_templates(id),
  color_id UUID REFERENCES colors(id),
  UNIQUE(product_template_id, color_id)
);

-- Available sizes for each template
CREATE TABLE product_template_sizes (
  product_template_id UUID REFERENCES product_templates(id),
  size_id UUID REFERENCES sizes(id),
  UNIQUE(product_template_id, size_id)
);
```

### 3. Designs (Artwork)

```sql
CREATE TABLE designs (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  design_category_id UUID REFERENCES design_categories(id),
  design_file_url VARCHAR(500), -- High-res design file
  thumbnail_url VARCHAR(500), -- Preview image
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES partners(id)
);

-- Design tags
CREATE TABLE design_tags (
  design_id UUID REFERENCES designs(id),
  tag VARCHAR(100) NOT NULL,
  UNIQUE(design_id, tag)
);
```

### 4. Design Products (Virtual Products)

```sql
CREATE TABLE design_products (
  id UUID PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id),
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  name VARCHAR(200) NOT NULL, -- "Luffy Gear 5 Hoodie"
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  commission DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  UNIQUE(design_id, product_template_id)
);
```

### 5. Physical Inventory (Blank Garments)

```sql
CREATE TABLE physical_inventory (
  id UUID PRIMARY KEY,
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,  -- ✅ Essential: Committed to pending orders
  reorder_point INTEGER DEFAULT 10,    -- ✅ Essential: Alert when stock is low
  cost_per_unit DECIMAL(10,2),
  UNIQUE(product_template_id, color_id, size_id)
);
```

#### Inventory Management Fields Explained:

**`reserved_quantity`** - Prevents overselling by tracking garments committed to pending orders

- When customer places order: `reserved_quantity + 1`
- When order is printed: `quantity - 1, reserved_quantity - 1`
- Available stock = `quantity - reserved_quantity`

**`reorder_point`** - Triggers automatic reorder alerts when stock falls below threshold

- If available stock ≤ reorder_point → Alert: "Reorder needed!"
- Prevents stockouts and business disruption

**`cost_per_unit`** - Enables profit calculations and financial tracking

- Profit = selling_price - cost_per_unit - print_cost
- Essential for pricing decisions and COGS calculations

### 6. Printed Products (After Printing)

```sql
CREATE TABLE printed_products_inventory (
  id UUID PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  design_product_id UUID NOT NULL REFERENCES design_products(id),
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  design_id UUID NOT NULL REFERENCES designs(id),

  -- Physical product details
  sku VARCHAR(100) NOT NULL UNIQUE, -- "LUF-HOD-BLK-L-241201"
  batch_number VARCHAR(50),

  -- Product status
  status VARCHAR(50) NOT NULL DEFAULT 'printed',
  condition VARCHAR(50) DEFAULT 'new',

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

  -- Timestamps
  printed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE
);
```

### 7. Order Processing

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  design_product_id UUID REFERENCES design_products(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  printed_product_id UUID REFERENCES printed_products_inventory(id)
);

CREATE TABLE print_jobs (
  id UUID PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id),
  design_id UUID REFERENCES designs(id),
  product_template_id UUID REFERENCES product_templates(id),
  color_id UUID REFERENCES colors(id),
  size_id UUID REFERENCES sizes(id),
  print_file_url VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  batch_number VARCHAR(50)
);
```

### 8. Return Processing (Simplified)

**Note**: We can handle returns using the existing `printed_products_inventory` table by adding a few fields:

```sql
-- Add return fields to existing table
ALTER TABLE printed_products_inventory ADD COLUMN return_reason VARCHAR(100);
ALTER TABLE printed_products_inventory ADD COLUMN can_resell BOOLEAN;
ALTER TABLE printed_products_inventory ADD COLUMN resale_price DECIMAL(10,2);
```

**Return workflow using single table:**

```sql
-- Customer returns product
UPDATE printed_products_inventory
SET status = 'returned',
    condition = 'used',
    return_reason = 'wrong_size',
    returned_at = NOW(),
    can_resell = true,
    resale_price = 35.99,  -- 75% of original price
    warehouse_location = 'resale_section'
WHERE id = 'product-id';

-- Check resale inventory
SELECT * FROM printed_products_inventory
WHERE status = 'returned'
  AND can_resell = true
  AND warehouse_location = 'resale_section';
```

**Benefits of single table approach:**

- **Simpler schema** - no additional tables needed
- **Complete audit trail** - all status changes in one place
- **Easier queries** - no JOINs needed for return data
- **Consistent data** - no sync issues between tables

## Key Simplifications Made

### 1. Removed Complex Features

- **No wholesale pricing** - single price only
- **No complex commission structures** - simple commission rate
- **No detailed quality control** - basic pass/fail
- **No complex inventory movements** - simple quantity tracking

### 2. Simplified Tables

- **Removed**: `design_types`, `product_template_print_areas`, `inventory_movements`
- **Removed**: `printed_product_movements`, `quality_control_checks`
- **Removed**: `returned_products`, `resale_inventory` (handled in main table)
- **Removed**: Complex pricing rules and commission structures

### 3. Streamlined Relationships

- **Direct relationships** instead of complex junction tables
- **Essential fields only** - removed optional metadata
- **Simple status tracking** instead of complex state machines

## How It Works

### Order Processing

1. Customer orders "Luffy Hoodie Black L"
2. System creates order with design product
3. Print job created (design + template + color + size)
4. Product printed → unique SKU generated
5. Quality control check
6. Ship and track delivery

### Return Processing

1. Customer returns product
2. Update `printed_products_inventory` with return details
3. Assess condition (new, used, damaged)
4. Decide if resellable using `can_resell` field
5. If resellable: set `warehouse_location = 'resale_section'`
6. If not resellable: set `warehouse_location = 'disposal'`
7. Process refund and fees

### Inventory Management

- **Physical**: Blank garments (Hoodie Black L: 100 units, 15 reserved)
- **Available**: 85 units (100 - 15 reserved)
- **Reorder Alert**: When available ≤ reorder_point (10)
- **Virtual**: Thousands of design combinations
- **Printed**: Unique SKUs for each printed item
- **Resale**: Returned products in 'resale_section' warehouse location

## Benefits

### Scalability

- **Infinite Products**: Add designs without physical inventory
- **Efficient Inventory**: Only stock blank garments
- **Dynamic Pricing**: Per design + template combinations

### Flexibility

- **Mix & Match**: Any design with any template
- **Easy Expansion**: Add new templates or designs
- **Customization**: Per-customer print instructions

### Business Intelligence

- **Design Performance**: Which designs sell best
- **Template Popularity**: Which garments are most popular
- **Quality Metrics**: Print quality tracking
- **Return Analysis**: Return reasons and resale potential

### Cost Efficiency

- **No Pre-Printing**: Print only when ordered
- **Reduced Waste**: No unsold printed inventory
- **Resale Revenue**: Additional revenue from returns
- **Quality Control**: Prevent defective products from shipping

## Sample Data

### Product Templates

- Classic T-Shirt (Black, White, Red, Blue, Green, Navy, Gray)
- Premium T-Shirt (Black, White, Red, Blue, Green, Navy, Gray, Maroon)
- Hoodie (Black, White, Red, Blue, Green, Navy, Gray)
- Tank Top (Black, White, Red, Blue, Pink)
- Long Sleeve T-Shirt (Black, White, Red, Blue, Green, Navy, Gray)
- Sweatshirt (Black, White, Red, Blue, Green, Navy, Gray)

### Sample Designs

- Luffy Gear 5 (Anime & Manga)
- Lakers Logo (Sports)
- Minimalist Mountain (Minimalist)

### Sample Design Products

- Luffy Gear 5 Classic T-Shirt ($24.99)
- Lakers Logo Hoodie ($45.99)
- Minimalist Mountain Premium T-Shirt ($29.99)

## Migration Strategy

### Phase 1: Create New Tables

- Add design-centric tables alongside existing ones
- No data loss, parallel operation

### Phase 2: Data Migration

- Convert existing products to product_templates
- Create sample designs for existing products
- Generate design_products from existing combinations

### Phase 3: Update Application Layer

- Update domain entities and services
- Modify API endpoints
- Update frontend to work with new model

### Phase 4: Cleanup

- Remove old tables after full migration
- Update all references

## Summary

This **simplified schema** transforms your platform into a true **print-on-demand platform** where:

- **Designs** and **physical garments** are managed separately
- **Virtual products** are combinations of designs + templates
- **Physical inventory** is only blank garments
- **Printed products** become tracked physical assets
- **Returns** are processed with resale potential
- **Quality control** ensures product standards

**Result**: A scalable, efficient platform that handles thousands of product combinations while maintaining lean physical inventory, with **much simpler database structure** than the original complex schema.
