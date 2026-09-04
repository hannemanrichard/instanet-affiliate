# High Commission Products - Implementation Proposal

## Overview

This document outlines the implementation plan for adding **High Commission Products** feature - a list of product designs that have available physical inventory items (returned products) available for resale, which generate **double commission** (2x the original commission rate).

---

## 🎯 Feature Description

**High Commission Products** are product_designs that:

- Have available items in `physical_printed_inventory` (status: 'returned', can_resell: true)
- These are returned products that can be quickly resold
- Generate **double commission** (2x the original `product_designs.commission_rate`)
- May have only 1-2 sizes available (not all sizes)

**Use Case**: Help affiliates identify which product designs have physical inventory available for resale, allowing them to promote these products that earn double commission.

---

## 📊 Key Metrics

For each product design:

1. **productDesignId**: The product design ID
2. **productDesign**: Product design details (name, image, price, etc.)
3. **availableSizes**: List of available sizes (e.g., ["L", "XL"])
4. **totalInventoryCount**: Total number of available inventory items
5. **originalCommissionRate**: Original commission rate from product_designs
6. **doubleCommissionRate**: Double commission rate (2x original)
7. **inventoryBySize**: Breakdown of inventory count per size

---

## 🏗️ Architecture Decision

### **Feature Location: Analytics Feature**

**Why**: This is a cross-feature aggregation analysis requiring:

- Physical inventory data (`physical_printed_inventory`)
- Product designs data (`product_designs`)
- Commission rate calculations

**Location**: `src/features/analytics/`

---

## 📋 Implementation Plan

### **Phase 1: Domain Layer**

**File**: `src/features/analytics/domain/entities.ts`

Add:

- `HighCommissionProductDesign` interface
- `HighCommissionProductDesignsRequest` interface

**Entity Structure**:

```typescript
export interface HighCommissionProductDesign {
  productDesignId: string;
  productDesign: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    is_active: boolean;
    is_featured: boolean;
  };
  // Inventory & Commission Metrics
  metrics: {
    availableSizes: string[]; // e.g., ["L", "XL"]
    totalInventoryCount: number; // Total available items
    originalCommissionRate: number; // From product_designs.commission_rate
    doubleCommissionRate: number; // 2x original rate
    inventoryBySize: Record<string, number>; // { "L": 2, "XL": 1 }
  };
}
```

**File**: `src/features/analytics/domain/repositories.ts`

Add:

- `getHighCommissionProductDesigns(request: HighCommissionProductDesignsRequest): Promise<HighCommissionProductDesign[]>`

---

### **Phase 2: Data Layer**

**File**: `src/features/analytics/data/affiliateAnalyticsService.ts`

#### Method: `getHighCommissionProductDesigns`

**Query Logic**:

1. Query `physical_printed_inventory` where:
   - `status = 'returned'`
   - `can_resell = true`
   - (Optional filters: condition, quality_check_passed)
2. JOIN with `product_designs` for product info
3. Group by `product_design_id` and `size`
4. Aggregate:
   - Count items per product_design_id
   - List available sizes
   - Get commission rate from product_designs

**Algorithm**:

```typescript
1. Query physical_printed_inventory:
   - WHERE status = 'returned' AND can_resell = true
   - JOIN product_designs ON product_design_id
   - SELECT product_design_id, size, product_designs.*

2. Group by product_design_id:
   - Count total inventory items
   - Collect unique sizes
   - Build inventoryBySize map { size: count }

3. Calculate metrics:
   - originalCommissionRate = product_designs.commission_rate
   - doubleCommissionRate = commission_rate * 2

4. Filter by thresholds (if needed):
   - minInventoryCount >= 1 (default)
   - Only active product designs

5. Sort by sortBy (inventoryCount | commissionRate | productName)

6. Limit results
```

**Query Example**:

```sql
SELECT
  ppi.product_design_id,
  ppi.size,
  COUNT(*) as inventory_count,
  pd.id, pd.name, pd.primary_design_image_url,
  pd.price, pd.commission_rate, pd.is_active, pd.is_featured
FROM physical_printed_inventory ppi
JOIN product_designs pd ON ppi.product_design_id = pd.id
WHERE ppi.status = 'returned'
  AND ppi.can_resell = true
  AND pd.is_active = true
GROUP BY ppi.product_design_id, ppi.size, pd.id, pd.name, ...
ORDER BY inventory_count DESC
```

---

### **Phase 3: Application Layer**

**File**: `src/features/analytics/application/services/analyticsApplicationService.ts`

Add:

- `getHighCommissionProductDesigns(request?)` method
- Error handling
- Logger integration

---

### **Phase 4: React Query Hooks**

**File**: `src/features/analytics/application/useAnalytics.ts`

Add:

- `useHighCommissionProductDesigns(options?)` hook
- Query key: `["analytics", "high-commission-product-designs", ...params]`
- Cache config: 5-10 min stale (inventory changes frequently)

---

### **Phase 5: Testing**

**Files**:

1. `src/features/analytics/__tests__/data/affiliateAnalyticsService.test.ts`
   - Test aggregation logic
   - Test size grouping
   - Test commission rate calculation (double)
   - Test filters

2. `src/features/analytics/__tests__/application/analyticsApplicationService.test.ts`
   - Test happy path
   - Test error handling
   - Test default params

3. `src/features/analytics/__tests__/application/useAnalytics.test.ts`
   - Test hook data fetching
   - Test query key generation
   - Test cache behavior

---

## 🔍 Query Complexity

**Complexity**: **Low-Medium**

**Reasons**:

1. Single query to `physical_printed_inventory`
2. Simple JOIN with `product_designs`
3. Grouping and aggregation
4. No complex calculations

**Performance Considerations**:

- Indexes needed on `physical_printed_inventory.status`, `physical_printed_inventory.can_resell`, `physical_printed_inventory.product_design_id`
- Consider caching for 5-10 minutes (inventory changes frequently)
- Filter by `is_active = true` for product designs

---

## 📊 Request Parameters

```typescript
interface HighCommissionProductDesignsRequest {
  minInventoryCount?: number; // Default: 1
  onlyActiveProducts?: boolean; // Default: true
  sortBy?: "inventoryCount" | "commissionRate" | "productName"; // Default: "inventoryCount"
  limit?: number; // Default: 20
}
```

---

## 🎨 UI/UX Considerations

**Display**:

- Product image, name
- Highlight: "Double Commission" badge
- Available sizes list (e.g., "Available: L, XL")
- Inventory count per size
- Commission rate comparison (original vs double)
- "Quick Resell" indicator

**Use Cases**:

1. Affiliate dashboard to identify high-commission inventory items
2. Product listing page to highlight double commission products
3. Admin inventory management to track resale inventory

---

## 🔄 Data Flow

```
UI Component
  ↓
useHighCommissionProductDesigns(options)
  ↓
AnalyticsApplicationService.getHighCommissionProductDesigns(request)
  ↓
AffiliateAnalyticsService.getHighCommissionProductDesigns(request)
  ↓
Query: physical_printed_inventory + product_designs
  ↓
Aggregation & Grouping by product_design_id and size
  ↓
Calculate double commission rate
  ↓
Return HighCommissionProductDesign[]
```

---

## ✅ Success Criteria

1. Correctly identifies product designs with available physical inventory
2. Accurately groups by product_design_id and size
3. Calculates double commission rate correctly (2x original)
4. Shows available sizes list
5. Returns results within acceptable time (< 1 second)
6. Handles edge cases (no inventory, single size, etc.)

---

## 🚨 Edge Cases

1. **No available inventory**: Return empty array
2. **Single size available**: Show only that size
3. **Inactive product design**: Filter out if `onlyActiveProducts = true`
4. **Null commission_rate**: Use 0 or default rate
5. **can_resell = false**: Exclude from results

---

## 📝 Questions for Clarification

1. Should we filter by `condition` (e.g., only 'new' or 'used')?
2. Should we filter by `quality_check_passed` (e.g., only passed quality checks)?
3. Should we show inventory items that have `resale_price` set?
4. Should we sort by total inventory count or commission rate by default?
5. Do we need to track when inventory becomes available (timestamps)?

---

## 🎯 Next Steps

1. ✅ Review and approve this proposal
2. Clarify any questions above
3. Implement domain layer
4. Implement data layer with tests
5. Implement application layer with tests
6. Implement React Query hooks with tests
7. Add to analytics dashboard UI

---

## 📊 Database Schema Reference

### `physical_printed_inventory` Table

```sql
CREATE TABLE physical_printed_inventory (
  id UUID PRIMARY KEY,
  product_design_id UUID NOT NULL REFERENCES product_designs(id),
  size VARCHAR(20) NOT NULL,

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'printed', -- 'printed', 'shipped', 'delivered', 'returned'
  condition VARCHAR(50) DEFAULT 'new', -- 'new', 'used', 'damaged'
  can_resell BOOLEAN DEFAULT false, -- ✅ Key field for filtering

  -- Financial tracking
  resale_price DECIMAL(10,2),

  -- Quality control
  quality_check_passed BOOLEAN DEFAULT NULL,

  -- Timestamps
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields for This Feature:

- `product_design_id`: Links to product design
- `size`: Available size
- `status`: Must be 'returned'
- `can_resell`: Must be true
- `condition`: Optional filter
- `quality_check_passed`: Optional filter
