# Pricing Strategy Documentation

## Overview

Pricing in the print-on-demand platform follows a dynamic markup system where product design prices are calculated from the base product price plus a design markup.

## Pricing Formula

```
product_designs.price = products.base_price + product_designs.design_markup
```

## Database Schema

### Products Table (Empty Garments)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  product_template_id UUID NOT NULL REFERENCES product_templates(id),
  color VARCHAR(50) NOT NULL,

  -- Base pricing
  base_price DECIMAL(10,2) NOT NULL,  -- Base price for empty garment

  -- ...
);
```

**Example:**

- Black Hoodie: `base_price = 25.00` DZD

### Product Designs Table (Printed Products)

```sql
CREATE TABLE product_designs (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  design_id UUID NOT NULL REFERENCES designs(id),

  -- Pricing
  price DECIMAL(10,2) NOT NULL,            -- Final price (base_price + design_markup)
  design_markup DECIMAL(10,2) NOT NULL,    -- Markup amount added to base_price
  price_updated_at TIMESTAMP WITH TIME ZONE, -- When price was last updated

  -- ...
);
```

**Example:**

- Sharingan Black Hoodie:
  - `base_price` (from products) = 25.00 DZD
  - `design_markup` = 20.99 DZD
  - `price` = 45.99 DZD (25.00 + 20.99)

## Pricing Workflow

### 1. Create Product Design

```sql
-- When creating a product design:
-- 1. Get base_price from products table
SELECT base_price FROM products WHERE id = 'black-hoodie-uuid';
-- Result: 25.00

-- 2. Set design_markup (business decision)
SET design_markup = 20.99;  -- Markup for this design

-- 3. Calculate price (in application or let database calculate)
SET price = base_price + design_markup;  -- 25.00 + 20.99 = 45.99

-- 4. Insert product_design
INSERT INTO product_designs (product_id, design_id, price, design_markup, ...)
VALUES ('black-hoodie-uuid', 'sharingan-uuid', 45.99, 20.99, ...);
```

### 2. Update Price

```sql
-- Option 1: Update price directly
UPDATE product_designs
SET price = 49.99,
    price_updated_at = NOW()
WHERE id = 'product-design-uuid';
-- Note: design_markup doesn't auto-update (may become inconsistent)

-- Option 2: Update design_markup and recalculate price
UPDATE product_designs pd
SET design_markup = 24.99,
    price = (SELECT base_price FROM products WHERE id = pd.product_id) + 24.99,
    price_updated_at = NOW()
WHERE id = 'product-design-uuid';
```

### 3. Base Price Changes

**Important**: If `products.base_price` changes, existing `product_designs` prices do NOT automatically update.

**Why**: Prices are denormalized for historical accuracy. When an order is placed, the price at that time is preserved even if the base price changes later.

**If you want to update all product_designs when base_price changes:**

```sql
-- Optional trigger to recalculate prices when base_price changes
-- (Only if you want automatic propagation)
UPDATE product_designs pd
SET price = p.base_price + pd.design_markup,
    price_updated_at = NOW()
FROM products p
WHERE pd.product_id = p.id
  AND p.base_price = NEW.base_price;  -- After products.base_price update
```

**Recommendation**: Keep prices manual (no auto-update) for:

- Historical accuracy (old orders keep their prices)
- Flexibility (can set custom prices per design)
- Audit trail (price_updated_at shows when manually changed)

## Price Tracking

### price_updated_at Field

- `NULL` or `= created_at`: Price never changed (or set at creation)
- Has value: Last time price was manually updated

**Use Cases:**

- Identify which designs had price changes
- Track price change frequency
- Audit pricing decisions

### Query Examples

```sql
-- Find designs with recent price changes
SELECT id, name, price, price_updated_at
FROM product_designs
WHERE price_updated_at >= NOW() - INTERVAL '30 days'
ORDER BY price_updated_at DESC;

-- Find designs never updated (price = original)
SELECT id, name, price, created_at
FROM product_designs
WHERE price_updated_at IS NULL OR price_updated_at = created_at;

-- Check if price matches base_price + markup
SELECT
  pd.id,
  pd.name,
  pd.price,
  p.base_price,
  pd.design_markup,
  p.base_price + pd.design_markup AS calculated_price,
  CASE
    WHEN pd.price = p.base_price + pd.design_markup THEN 'Match'
    ELSE 'Mismatch'
  END AS price_status
FROM product_designs pd
JOIN products p ON p.id = pd.product_id;
```

## Pricing Considerations

### ✅ **Why Store Price (Denormalized)**

1. **Historical Accuracy**: Order prices preserved even if base_price changes
2. **Flexibility**: Can override formula for special cases
3. **Performance**: No JOIN needed to get price
4. **Audit Trail**: Price at creation time vs updated time

### ✅ **Why Store design_markup**

1. **Transparency**: See markup used for each design
2. **Consistency**: Can validate price = base_price + markup
3. **Reporting**: Analyze markup patterns across designs
4. **Updates**: Can recalculate prices when base_price changes

### ⚠️ **Price Consistency**

Since price is denormalized, there's a risk of inconsistency:

**Scenario**: Base price changes but product_design prices don't update

- Old orders: Keep their prices (good for audit)
- New orders: Use new price (good for current pricing)

**Recommendation**:

- Keep manual price updates (no auto-trigger)
- Use `design_markup` for validation: `price ≈ base_price + design_markup`
- Update prices manually when base_price changes significantly

## Application Implementation

### Creating Product Design

```typescript
interface CreateProductDesignParams {
  productId: string;
  designId: string;
  designMarkup: number;  // Markup amount (e.g., 20.99)
  // price will be calculated: basePrice + designMarkup
}

async createProductDesign(params: CreateProductDesignParams) {
  // 1. Get base price
  const product = await productsService.getById(params.productId);
  const basePrice = product.base_price;

  // 2. Calculate price
  const price = basePrice + params.designMarkup;

  // 3. Create product design
  return await productDesignsRepository.create({
    product_id: params.productId,
    design_id: params.designId,
    price: price,
    design_markup: params.designMarkup,
    // price_updated_at will be NULL (set at creation)
  });
}
```

### Updating Price

```typescript
async updateProductDesignPrice(
  productDesignId: string,
  newPrice: number
) {
  // Update price (trigger will set price_updated_at automatically)
  return await productDesignsRepository.update(productDesignId, {
    price: newPrice,
    // price_updated_at updated by trigger
  });
}
```

### Validating Price Consistency

```typescript
async validateProductDesignPrices() {
  // Find designs where price ≠ base_price + design_markup
  const mismatches = await productDesignsRepository.findWherePriceMismatch();

  // Can log or fix inconsistencies
  for (const design of mismatches) {
    console.log(`Price mismatch for ${design.name}:
      Expected: ${design.calculated_price},
      Actual: ${design.price}`);
  }
}
```

## Best Practices

### ✅ **Do**

1. Set `design_markup` when creating product_design
2. Calculate `price = base_price + design_markup` initially
3. Track `price_updated_at` for audit trail
4. Validate price consistency periodically
5. Update prices manually when base_price changes significantly

### ❌ **Don't**

1. Don't auto-update all prices when base_price changes (breaks historical accuracy)
2. Don't ignore `design_markup` field (use it for validation)
3. Don't update `price` without updating `price_updated_at` (handled by trigger)

## Summary

- **Pricing Formula**: `price = base_price + design_markup`
- **Price Storage**: Denormalized for historical accuracy
- **Price Tracking**: `price_updated_at` tracks when prices change
- **Flexibility**: Can manually override prices for special cases
- **Validation**: `design_markup` allows checking price consistency

This approach provides both flexibility and audit trail! 💰
