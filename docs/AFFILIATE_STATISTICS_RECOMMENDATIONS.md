# Affiliate Statistics System - Architecture Recommendations

## Overview

This document provides recommendations for implementing comprehensive affiliate statistics with time-based filtering, following the existing clean architecture patterns in the codebase.

---

## 📊 Required Statistics

### Core Metrics

1. **Number of Orders** - Total orders in a time period
2. **Delivery Rate** - Percentage of delivered orders (delivered / total)
3. **Cancel Rate** - Percentage of cancelled orders (cancelled / total)
4. **Commissions Value** - Total commission earnings in a time period
5. **Weekly Revenue Per Day** - Daily commission breakdown for a week
6. **Top Performing Products** - Products sorted by order count/commission value

### Time Period Support

- Custom date ranges (startDate, endDate)
- Predefined periods: today, this week, this month, this year, all time

---

## 🏗️ Architecture Design

### 1. Domain Layer (`src/features/affiliates/domain/`)

#### 1.1 Enhanced Entities (`entities.ts`)

```typescript
// Extended statistics with time period
export interface AffiliateStatsExtended {
  affiliateId: number;
  period: {
    startDate: string;
    endDate: string;
  };

  // Order Metrics
  orders: {
    total: number;
    delivered: number;
    cancelled: number;
    pending: number;
    processing: number;
    shipped: number;
    returned: number;
    deliveryRate: number; // (delivered / total) * 100
    cancelRate: number; // (cancelled / total) * 100
  };

  // Financial Metrics
  revenue: {
    totalRevenue: number; // Sum of order totals
    totalCommissions: number; // Sum of commission amounts
    averageOrderValue: number; // totalRevenue / totalOrders
    averageCommission: number; // totalCommissions / totalOrders
  };

  // Time-based breakdowns
  weeklyRevenue: DailyRevenue[]; // Last 7 days
  monthlyTrend?: MonthlyRevenue[]; // Optional: monthly breakdown
}

// Daily revenue for weekly breakdown
export interface DailyRevenue {
  date: string; // ISO date string (YYYY-MM-DD)
  commissions: number; // Total commissions for that day
  orderCount: number; // Number of orders that day
  revenue: number; // Total order revenue for that day
}

// Monthly revenue trend
export interface MonthlyRevenue {
  month: string; // Format: "YYYY-MM"
  commissions: number;
  orderCount: number;
  revenue: number;
}

// Top performing products
export interface TopProduct {
  productDesignId: string;
  productName: string;
  imageUrl: string | null;
  orderCount: number;
  totalRevenue: number;
  totalCommissions: number;
  averageOrderValue: number;
}

// Request interface for stats queries
export interface AffiliateStatsRequest {
  affiliateId: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  period?: "today" | "week" | "month" | "year" | "all";
  includeWeeklyBreakdown?: boolean;
  includeTopProducts?: boolean;
  topProductsLimit?: number; // Default: 10
}
```

#### 1.2 Repository Interface (`repositories.ts`)

```typescript
// Add to existing AffiliateRepository interface

/**
 * Get comprehensive affiliate statistics for a time period
 */
getAffiliateStatsExtended(
  request: AffiliateStatsRequest
): Promise<AffiliateStatsExtended>;

/**
 * Get daily revenue breakdown for a week
 */
getWeeklyRevenue(
  affiliateId: number,
  startDate: string, // Start of week
  endDate: string    // End of week (7 days later)
): Promise<DailyRevenue[]>;

/**
 * Get top performing products for an affiliate
 */
getTopProducts(
  affiliateId: number,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<TopProduct[]>;
```

---

### 2. Data Layer (`src/features/affiliates/data/`)

#### 2.1 Implementation Strategy

**⚠️ Important: Clean Architecture Principle**

**What's NOT OK:**

- ❌ **DO NOT** import from other features' data layers (e.g., `import { ordersService } from "@/features/orders/data"`)
- ❌ This creates service-to-service dependencies and violates clean architecture

**What's OK:**

- ✅ **DO** query the database tables directly using Supabase (e.g., `supabase.from("orders")`)
- ✅ This is infrastructure access (shared database resource), not feature coupling
- ✅ Still a form of coupling (to schema), but acceptable and common practice

**Why Direct Table Queries Are Acceptable:**

1. **Infrastructure Layer Access**: The database is a shared infrastructure resource
2. **No Service Dependencies**: You're not depending on another feature's implementation
3. **Practical Necessity**: Analytics/statistics often need cross-feature data aggregation
4. **Your Current Pattern**: Already used in `getAffiliateStats()` implementation

**Trade-offs:**

- ⚠️ **Schema Coupling**: If `orders` table changes, you need to update affiliate stats queries
- ⚠️ **Knowledge Leakage**: Affiliates feature needs to know about orders/commissions schema
- ✅ **Better than Alternatives**: Still better than service dependencies or application layer coupling

**Option A: Direct Database Queries (✅ Recommended for This Use Case)**

- Query `orders` and `commissions` tables directly using `supabase.from()`
- Aggregate in TypeScript within the data service
- Simpler to implement and test
- Follows current codebase pattern (see `getAffiliateStats` implementation)
- Acceptable coupling to database schema (not service implementations)

### Comparison Table

| Approach                                                 | OK?    | Coupling Type          | Notes                                        |
| -------------------------------------------------------- | ------ | ---------------------- | -------------------------------------------- |
| `import { ordersService } from "@/features/orders/data"` | ❌ NO  | Service Dependency     | Violates clean architecture                  |
| `supabase.from("orders").select()`                       | ✅ YES | Schema Coupling        | Acceptable infrastructure access             |
| Application service orchestration                        | ⚠️ OK  | Application Dependency | More coupling, but at appropriate layer      |
| Database views/functions                                 | ✅ YES | Schema Abstraction     | Best for performance, adds abstraction layer |

**Option B: Database Functions (For Scale)**

- Create PostgreSQL functions for aggregation
- Better performance for large datasets
- Reduced data transfer
- Still queries tables directly, not other feature services

**Option C: Application Layer Orchestration (Alternative)**

- Application service can call other features' application services
- More coupling, but acceptable at application layer
- Not recommended for this use case (adds unnecessary complexity)

#### 2.2 Service Implementation (`affiliatesService.ts`)

```typescript
async getAffiliateStatsExtended(
  request: AffiliateStatsRequest
): Promise<AffiliateStatsExtended> {
  // 1. Parse date range from request
  const { startDate, endDate } = this.parseDateRange(request);

  // 2. Query orders with status breakdown
  const orders = await this.getOrdersInPeriod(
    request.affiliateId,
    startDate,
    endDate
  );

  // 3. Query commissions
  const commissions = await this.getCommissionsInPeriod(
    request.affiliateId,
    startDate,
    endDate
  );

  // 4. Calculate metrics
  const orderMetrics = this.calculateOrderMetrics(orders);
  const revenueMetrics = this.calculateRevenueMetrics(orders, commissions);

  // 5. Get weekly breakdown if requested
  let weeklyRevenue: DailyRevenue[] = [];
  if (request.includeWeeklyBreakdown) {
    weeklyRevenue = await this.getWeeklyRevenue(
      request.affiliateId,
      startDate,
      endDate
    );
  }

  // 6. Get top products if requested
  let topProducts: TopProduct[] = [];
  if (request.includeTopProducts) {
    topProducts = await this.getTopProducts(
      request.affiliateId,
      startDate,
      endDate,
      request.topProductsLimit || 10
    );
  }

  return {
    affiliateId: request.affiliateId,
    period: { startDate, endDate },
    orders: orderMetrics,
    revenue: revenueMetrics,
    weeklyRevenue,
    topProducts,
  };
}

private async getOrdersInPeriod(
  affiliateId: number,
  startDate: string,
  endDate: string
): Promise<OrderEntity[]> {
  // ✅ Query orders table directly (NOT through ordersService)
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  return orders || [];
}

private async getCommissionsInPeriod(
  affiliateId: number,
  startDate: string,
  endDate: string
): Promise<CommissionEntity[]> {
  // ✅ Query commissions table directly (NOT through commissionsService)
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  return commissions || [];
}

private calculateOrderMetrics(orders: OrderEntity[]) {
  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  // ... other status counts

  return {
    total,
    delivered,
    cancelled,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    returned: orders.filter(o => o.status === 'returned').length,
    deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
    cancelRate: total > 0 ? (cancelled / total) * 100 : 0,
  };
}

private calculateRevenueMetrics(
  orders: OrderEntity[],
  commissions: CommissionEntity[]
) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCommissions = commissions.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );
  const totalOrders = orders.length;

  return {
    totalRevenue,
    totalCommissions,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    averageCommission: totalOrders > 0 ? totalCommissions / totalOrders : 0,
  };
}

async getWeeklyRevenue(
  affiliateId: number,
  startDate: string,
  endDate: string
): Promise<DailyRevenue[]> {
  // Query commissions grouped by day
  // Use PostgreSQL date_trunc or group by DATE(created_at)
  // Return array of DailyRevenue for each day in range
}

async getTopProducts(
  affiliateId: number,
  startDate?: string,
  endDate?: string,
  limit: number = 10
): Promise<TopProduct[]> {
  // Join orders -> order_items -> product_designs
  // Group by product_design_id
  // Calculate metrics per product
  // Sort by orderCount or totalCommissions
  // Return top N products
}
```

---

### 3. Application Layer (`src/features/affiliates/application/`)

#### 3.1 Application Service (`affiliateApplicationService.ts`)

```typescript
async getAffiliateStatsExtended(
  request: AffiliateStatsRequest
): Promise<AffiliateStatsExtended> {
  try {
    // Validate affiliate exists
    const affiliate = await this.affiliateRepository.getAffiliateById(
      request.affiliateId
    );
    if (!affiliate) {
      throw affiliatesErrorHandler.createError(
        AffiliateErrorCodes.AFFILIATE_NOT_FOUND,
        `Affiliate with id ${request.affiliateId} not found`,
        "AffiliateApplicationService"
      );
    }

    // Validate date range
    this.validateDateRange(request.startDate, request.endDate);

    // Delegate to repository
    return await this.affiliateRepository.getAffiliateStatsExtended(request);
  } catch (error) {
    // Error handling...
  }
}

private validateDateRange(startDate?: string, endDate?: string): void {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw affiliatesErrorHandler.createError(
        AffiliateErrorCodes.INVALID_DATE_RANGE,
        "Start date must be before end date",
        "AffiliateApplicationService"
      );
    }

    // Optional: Limit maximum range (e.g., 1 year)
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      throw affiliatesErrorHandler.createError(
        AffiliateErrorCodes.DATE_RANGE_TOO_LARGE,
        "Date range cannot exceed 365 days",
        "AffiliateApplicationService"
      );
    }
  }
}
```

#### 3.2 React Query Hooks (`useAffiliates.ts`)

```typescript
// Extended stats hook with time period support
export const useAffiliateStatsExtended = (
  affiliateId: number | null,
  options?: {
    period?: "today" | "week" | "month" | "year" | "all";
    startDate?: string;
    endDate?: string;
    includeWeeklyBreakdown?: boolean;
    includeTopProducts?: boolean;
    topProductsLimit?: number;
  }
) => {
  return useStandardQuery(
    () => {
      if (!affiliateId) return null;

      const request: AffiliateStatsRequest = {
        affiliateId,
        period: options?.period || "all",
        startDate: options?.startDate,
        endDate: options?.endDate,
        includeWeeklyBreakdown: options?.includeWeeklyBreakdown ?? true,
        includeTopProducts: options?.includeTopProducts ?? true,
        topProductsLimit: options?.topProductsLimit || 10,
      };

      return affiliateApplicationService.getAffiliateStatsExtended(request);
    },
    {
      queryKey: [
        ...QUERY_KEYS.AFFILIATE_STATS_EXTENDED(affiliateId!),
        options?.period,
        options?.startDate,
        options?.endDate,
      ],
      enabled: !!affiliateId,
      staleTime: 2 * 60 * 1000, // 2 minutes - stats can be slightly stale
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Weekly revenue hook
export const useWeeklyRevenue = (
  affiliateId: number | null,
  weekStartDate: string
) => {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return useStandardQuery(
    () => {
      if (!affiliateId) return null;
      return affiliateApplicationService.getWeeklyRevenue(
        affiliateId,
        weekStartDate,
        weekEndDate.toISOString()
      );
    },
    {
      queryKey: [...QUERY_KEYS.WEEKLY_REVENUE(affiliateId!, weekStartDate)],
      enabled: !!affiliateId && !!weekStartDate,
      staleTime: 5 * 60 * 1000,
    }
  );
};

// Top products hook
export const useTopProducts = (
  affiliateId: number | null,
  options?: { startDate?: string; endDate?: string; limit?: number }
) => {
  return useStandardQuery(
    () => {
      if (!affiliateId) return null;
      return affiliateApplicationService.getTopProducts(
        affiliateId,
        options?.startDate,
        options?.endDate,
        options?.limit || 10
      );
    },
    {
      queryKey: [
        ...QUERY_KEYS.TOP_PRODUCTS(affiliateId!),
        options?.startDate,
        options?.endDate,
        options?.limit,
      ],
      enabled: !!affiliateId,
      staleTime: 5 * 60 * 1000,
    }
  );
};
```

---

### 4. Query Keys (`src/shared/utils/migrationHelpers.ts`)

```typescript
export const QUERY_KEYS = {
  // ... existing keys

  // Affiliate Statistics
  AFFILIATE_STATS_EXTENDED: (affiliateId: number) => [
    "affiliates",
    affiliateId,
    "stats-extended",
  ],
  WEEKLY_REVENUE: (affiliateId: number, weekStart: string) => [
    "affiliates",
    affiliateId,
    "weekly-revenue",
    weekStart,
  ],
  TOP_PRODUCTS: (affiliateId: number) => [
    "affiliates",
    affiliateId,
    "top-products",
  ],
} as const;
```

---

### 5. Database Optimization (Optional)

For better performance with large datasets, consider creating a database view or function:

```sql
-- View for affiliate order statistics
CREATE VIEW affiliate_order_stats AS
SELECT
  o.affiliate_id,
  DATE_TRUNC('day', o.created_at) AS order_date,
  COUNT(*) AS order_count,
  COUNT(*) FILTER (WHERE o.status = 'delivered') AS delivered_count,
  COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled_count,
  SUM(o.total) AS total_revenue
FROM orders o
WHERE o.affiliate_id IS NOT NULL
GROUP BY o.affiliate_id, DATE_TRUNC('day', o.created_at);

-- Index for performance
CREATE INDEX idx_orders_affiliate_date ON orders(affiliate_id, created_at);
CREATE INDEX idx_commissions_affiliate_date ON commissions(affiliate_id, created_at);
```

---

## 📋 Implementation Plan

### Phase 1: Core Statistics (Week 1)

1. ✅ Extend `AffiliateStats` entity
2. ✅ Add repository methods
3. ✅ Implement data layer service
4. ✅ Add application service methods
5. ✅ Create React Query hooks
6. ✅ Write tests

### Phase 2: Time-based Features (Week 2)

1. ✅ Implement date range parsing
2. ✅ Add weekly revenue breakdown
3. ✅ Add top products query
4. ✅ Optimize queries with indexes
5. ✅ Add caching strategy

### Phase 3: Performance & Polish (Week 3)

1. ✅ Create database views (if needed)
2. ✅ Add pagination for top products
3. ✅ Implement real-time updates (optional)
4. ✅ Add error boundaries
5. ✅ Performance testing

---

## 🧪 Testing Strategy

### Unit Tests

- `affiliatesService.test.ts`: Test metric calculations
- `affiliateApplicationService.test.ts`: Test validation and error handling
- `useAffiliates.test.ts`: Test hooks with different periods

### Integration Tests

- Test with various date ranges
- Test with empty data
- Test with edge cases (single day, year range, etc.)

---

## 🎯 Key Recommendations

### 1. **Use Date Parsing Utility**

```typescript
// src/shared/utils/dateHelpers.ts
export const parsePeriod = (
  period: "today" | "week" | "month" | "year" | "all"
): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = now.toISOString();

  switch (period) {
    case "today":
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      return { startDate: todayStart.toISOString(), endDate };

    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      return { startDate: weekStart.toISOString(), endDate };

    // ... other cases
  }
};
```

### 2. **Cache Strategy**

- Stats should be cached for 2-5 minutes
- Invalidate on order/commission updates
- Use React Query's automatic refetching

### 3. **Performance Considerations**

- Limit date ranges to prevent large queries
- Use database indexes on `affiliate_id` and `created_at`
- Consider pagination for top products if list is very long
- Aggregate at database level when possible

### 4. **Error Handling**

- Validate date ranges
- Handle missing affiliate gracefully
- Provide default values for empty periods

---

## 📝 Example Usage

```typescript
// In a React component
const { data: stats, isLoading } = useAffiliateStatsExtended(affiliateId, {
  period: "month",
  includeWeeklyBreakdown: true,
  includeTopProducts: true,
  topProductsLimit: 5,
});

// stats structure:
// {
//   affiliateId: 1,
//   period: { startDate: "...", endDate: "..." },
//   orders: {
//     total: 150,
//     delivered: 120,
//     cancelled: 5,
//     deliveryRate: 80,
//     cancelRate: 3.33,
//     ...
//   },
//   revenue: {
//     totalRevenue: 50000,
//     totalCommissions: 5000,
//     averageOrderValue: 333.33,
//     ...
//   },
//   weeklyRevenue: [
//     { date: "2024-01-01", commissions: 500, orderCount: 10, ... },
//     ...
//   ],
//   topProducts: [
//     { productName: "T-Shirt Design", orderCount: 45, ... },
//     ...
//   ]
// }
```

---

## 🔄 Migration Path

1. **Keep existing `AffiliateStats`** for backward compatibility
2. **Add new `AffiliateStatsExtended`** alongside
3. **Gradually migrate** components to use extended version
4. **Deprecate old stats** after full migration

---

This architecture follows your existing patterns and provides a scalable foundation for affiliate analytics! 🚀
