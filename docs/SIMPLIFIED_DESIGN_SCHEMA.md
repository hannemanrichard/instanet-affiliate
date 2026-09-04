# Simplified Design-Centric Schema

## The Reality

Most designs are created for a specific product in a specific color:

- "Sharingan Hoodie" = Black Hoodie only
- "Lakers T-Shirt" = Purple T-Shirt only
- "Minimalist Mountain Tank" = White Tank only

## Simplified Schema

### 1. Designs (Artwork + Product Specification)

```sql
CREATE TABLE designs (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL, -- "Sharingan Hoodie"
  description TEXT,

  -- Design files
  design_file_url VARCHAR(500), -- High-res design file
  thumbnail_url VARCHAR(500), -- Preview image

  -- Product specification (what this design is for)
  product_type VARCHAR(50) NOT NULL, -- "hoodie", "t-shirt", "tank"
  color VARCHAR(50) NOT NULL, -- "black", "white", "red"
  size VARCHAR(20) NOT NULL, -- "L", "M", "S", "XL"

  -- Design metadata
  design_category_id UUID REFERENCES design_categories(id),
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES affiliates(id),

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0.1, -- 10%

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design tags
CREATE TABLE design_tags (
  design_id UUID REFERENCES designs(id),
  tag VARCHAR(100) NOT NULL,
  UNIQUE(design_id, tag)
);
```

### 2. Physical Inventory (Blank Garments)

```sql
CREATE TABLE physical_inventory (
  id UUID PRIMARY KEY,
  product_type VARCHAR(50) NOT NULL, -- "hoodie", "t-shirt", "tank"
  color VARCHAR(50) NOT NULL, -- "black", "white", "red"
  size VARCHAR(20) NOT NULL, -- "L", "M", "S", "XL"

  -- Inventory tracking
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  cost_per_unit DECIMAL(10,2),

  UNIQUE(product_type, color, size)
);
```

### 3. Printed Products (After Printing)

```sql
CREATE TABLE printed_products_inventory (
  id UUID PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  design_id UUID NOT NULL REFERENCES designs(id),

  -- Physical product details
  sku VARCHAR(100) NOT NULL UNIQUE, -- "SHAR-HOD-BLK-L-241201"
  product_type VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  size VARCHAR(20) NOT NULL,

  -- Status and tracking
  status VARCHAR(50) NOT NULL DEFAULT 'printed',
  batch_number VARCHAR(50),
  warehouse_location VARCHAR(100),

  -- Financial tracking
  cost_of_goods DECIMAL(10,2),
  print_cost DECIMAL(10,2),

  -- Timestamps
  printed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);
```

### 4. Order Items (Simplified)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  design_id UUID NOT NULL REFERENCES designs(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  printed_product_id UUID REFERENCES printed_products_inventory(id)
);
```

## Key Simplifications

### 1. **One Table for Products**

- `designs` table contains both the artwork AND the product specification
- No need for separate `product_templates`, `design_products`, or junction tables
- Each design is inherently tied to a specific product type, color, and size

### 2. **Direct Color/Size Storage**

- Store `color` and `size` as simple VARCHAR fields
- No need for separate `colors` and `sizes` tables with foreign keys
- Much simpler queries and data management

### 3. **Simplified Inventory**

- `physical_inventory` tracks blank garments by product_type + color + size
- `printed_products_inventory` tracks printed items with the same structure
- Easy to match designs to available inventory

## How It Works

### Creating a Design

```sql
INSERT INTO designs (
  title, product_type, color, size,
  design_file_url, price, commission_rate
) VALUES (
  'Sharingan Hoodie', 'hoodie', 'black', 'L',
  'https://storage.com/designs/sharingan-hoodie.png',
  45.99, 0.1
);
```

### Checking Inventory

```sql
-- Check if we have black hoodies in size L
SELECT quantity, reserved_quantity
FROM physical_inventory
WHERE product_type = 'hoodie'
  AND color = 'black'
  AND size = 'L';
```

### Processing an Order

```sql
-- 1. Create order item
INSERT INTO order_items (design_id, quantity, unit_price, total_price)
VALUES ('design-uuid', 1, 45.99, 45.99);

-- 2. Reserve inventory
UPDATE physical_inventory
SET reserved_quantity = reserved_quantity + 1
WHERE product_type = 'hoodie' AND color = 'black' AND size = 'L';

-- 3. After printing, create printed product
INSERT INTO printed_products_inventory (design_id, product_type, color, size, sku)
VALUES ('design-uuid', 'hoodie', 'black', 'L', 'SHAR-HOD-BLK-L-241201');
```

## Benefits

### ✅ **Much Simpler**

- 3 tables instead of 8+ tables
- No complex JOINs needed
- Direct color/size storage

### ✅ **Matches Reality**

- Each design is for a specific product
- No over-engineering for rare multi-color designs
- Easier to understand and maintain

### ✅ **Better Performance**

- Fewer tables to JOIN
- Simpler queries
- Faster data retrieval

### ✅ **Easier Development**

- Simpler domain models
- Less complex business logic
- Easier to debug and maintain

## Migration from Current Schema

If you want to support both approaches:

1. **Keep current schema** for complex multi-color designs
2. **Add simplified fields** to `designs` table:

   ```sql
   ALTER TABLE designs ADD COLUMN product_type VARCHAR(50);
   ALTER TABLE designs ADD COLUMN color VARCHAR(50);
   ALTER TABLE designs ADD COLUMN size VARCHAR(20);
   ```

3. **Use simplified approach** for most designs
4. **Use complex approach** only when needed

## Summary

This simplified schema matches the reality that most designs are created for specific products (Sharingan Hoodie = Black Hoodie Large), making the database much simpler and more performant while still supporting the core print-on-demand functionality.
