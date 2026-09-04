# Analytics Feature - Architecture Design

## Overview

A dedicated **Analytics Feature** for aggregating and analyzing data across multiple features (orders, commissions, affiliates, products). This feature provides statistics, metrics, and insights while maintaining clean architecture boundaries.

---

## 🏗️ Feature Structure

```
src/features/analytics/
├── domain/
│   ├── entities.ts           # Analytics entities (AffiliateAnalytics, OrderAnalytics, etc.)
│   ├── errors.ts             # Analytics-specific errors
│   ├── repositories.ts       # Analytics repository interfaces
│   └── index.ts
├── data/
│   ├── affiliateAnalyticsService.ts  # Queries orders, commissions tables
│   ├── orderAnalyticsService.ts      # Order-related analytics
│   ├── productAnalyticsService.ts    # Product performance analytics
│   └── index.ts
├── application/
│   ├── services/
│   │   ├── analyticsApplicationService.ts  # Orchestrates analytics
│   │   └── index.ts
│   ├── useAnalytics.ts       # React Query hooks
│   └── index.ts
├── __tests__/
│   ├── data/
│   ├── application/
│   └── application/useAnalytics.test.ts
└── index.ts
```

---

## 📊 Domain Layer

### Entities (`domain/entities.ts`)

```typescript
// Affiliate Analytics (main use case)
export interface AffiliateAnalytics {
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
    pendingCommissions: number; // Unpaid commissions
    paidCommissions: number; // Paid commissions
  };

  // Time-based breakdowns
  weeklyRevenue?: DailyRevenue[]; // Last 7 days
  monthlyTrend?: MonthlyRevenue[]; // Optional: monthly breakdown
  topProducts?: TopProduct[]; // Top performing products
}

// Daily revenue for weekly breakdown
export interface DailyRevenue {
  date: string; // ISO date string (YYYY-MM-DD)
  commissions: number;
  orderCount: number;
  revenue: number;
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

// Request interface for analytics queries
export interface AffiliateAnalyticsRequest {
  affiliateId: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  period?: "today" | "week" | "month" | "year" | "all";
  includeWeeklyBreakdown?: boolean;
  includeTopProducts?: boolean;
  topProductsLimit?: number; // Default: 10
}

// Platform-wide analytics (for future expansion)
export interface PlatformAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  totalAffiliates: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  averageOrderValue: number;
  // ... more platform metrics
}

// Order analytics (for future expansion)
export interface OrderAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  totalOrders: number;
  statusBreakdown: Record<string, number>;
  revenueByStatus: Record<string, number>;
  averageProcessingTime: number;
  // ... more order metrics
}
```

### Errors (`domain/errors.ts`)

```typescript
export enum AnalyticsErrorCodes {
  ANALYTICS_CALCULATION_FAILED = "ANALYTICS_CALCULATION_FAILED",
  ANALYTICS_FETCH_FAILED = "ANALYTICS_FETCH_FAILED",
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  DATE_RANGE_TOO_LARGE = "DATE_RANGE_TOO_LARGE",
  AFFILIATE_NOT_FOUND = "AFFILIATE_NOT_FOUND",
  ANALYTICS_VALIDATION_FAILED = "ANALYTICS_VALIDATION_FAILED",
}

export class AnalyticsError extends Error {
  constructor(
    public code: AnalyticsErrorCodes,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}

export class AnalyticsApplicationError extends Error {
  constructor(
    public code: AnalyticsErrorCodes,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "AnalyticsApplicationError";
  }
}

export const analyticsErrorHandler = {
  createError: (
    code: AnalyticsErrorCodes,
    message: string,
    source: string,
    details?: any
  ) => ({
    code,
    message,
    source,
    details,
  }),
};
```

### Repositories (`domain/repositories.ts`)

```typescript
import type {
  AffiliateAnalytics,
  AffiliateAnalyticsRequest,
  DailyRevenue,
  TopProduct,
  PlatformAnalytics,
  OrderAnalytics,
} from "./entities";

export interface AnalyticsRepository {
  /**
   * Get comprehensive affiliate analytics
   */
  getAffiliateAnalytics(
    request: AffiliateAnalyticsRequest
  ): Promise<AffiliateAnalytics>;

  /**
   * Get daily revenue breakdown for a week
   */
  getWeeklyRevenue(
    affiliateId: number,
    startDate: string,
    endDate: string
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

  // Future: Platform-wide analytics
  // getPlatformAnalytics(period: DateRange): Promise<PlatformAnalytics>;
  // getOrderAnalytics(period: DateRange): Promise<OrderAnalytics>;
}
```

---

## 🔌 Data Layer

### Affiliate Analytics Service (`data/affiliateAnalyticsService.ts`)

```typescript
import { supabase } from "@/infrastructure/supabase/client";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  AffiliateAnalytics,
  AffiliateAnalyticsRequest,
  DailyRevenue,
  TopProduct,
} from "../domain/entities";
import {
  AnalyticsError,
  AnalyticsErrorCodes,
  analyticsErrorHandler,
} from "../domain/errors";
import type { AnalyticsRepository } from "../domain/repositories";

type OrderRow = {
  id: string;
  affiliate_id: number;
  status: string;
  total: number;
  created_at: string;
};

type CommissionRow = {
  id: number;
  affiliate_id: number;
  amount: number;
  status: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_design_id: string;
  quantity: number;
  total_price: number;
};

export class SupabaseAffiliateAnalyticsService implements AnalyticsRepository {
  async getAffiliateAnalytics(
    request: AffiliateAnalyticsRequest
  ): Promise<AffiliateAnalytics> {
    return withPerformanceTracking(
      "AffiliateAnalyticsService",
      "getAffiliateAnalytics",
      async () => {
        // 1. Parse date range
        const { startDate, endDate } = this.parseDateRange(request);

        // 2. Query orders (direct table access - OK!)
        const orders = await this.getOrdersInPeriod(
          request.affiliateId,
          startDate,
          endDate
        );

        // 3. Query commissions (direct table access - OK!)
        const commissions = await this.getCommissionsInPeriod(
          request.affiliateId,
          startDate,
          endDate
        );

        // 4. Calculate metrics
        const orderMetrics = this.calculateOrderMetrics(orders);
        const revenueMetrics = this.calculateRevenueMetrics(
          orders,
          commissions
        );

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
    );
  }

  async getWeeklyRevenue(
    affiliateId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyRevenue[]> {
    return withPerformanceTracking(
      "AffiliateAnalyticsService",
      "getWeeklyRevenue",
      async () => {
        // Query commissions grouped by day
        const { data: commissions } = await supabase
          .from("commissions")
          .select("amount, created_at")
          .eq("affiliate_id", affiliateId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        // Query orders grouped by day
        const { data: orders } = await supabase
          .from("orders")
          .select("id, total, created_at")
          .eq("affiliate_id", affiliateId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        // Group by date and aggregate
        const dailyMap = new Map<string, DailyRevenue>();

        // Process commissions
        commissions?.forEach((commission) => {
          const date = new Date(commission.created_at)
            .toISOString()
            .split("T")[0];
          const existing = dailyMap.get(date) || {
            date,
            commissions: 0,
            orderCount: 0,
            revenue: 0,
          };
          existing.commissions += commission.amount || 0;
          dailyMap.set(date, existing);
        });

        // Process orders
        orders?.forEach((order) => {
          const date = new Date(order.created_at).toISOString().split("T")[0];
          const existing = dailyMap.get(date) || {
            date,
            commissions: 0,
            orderCount: 0,
            revenue: 0,
          };
          existing.orderCount += 1;
          existing.revenue += order.total || 0;
          dailyMap.set(date, existing);
        });

        // Fill missing days with zeros and sort
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result: DailyRevenue[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          result.push(
            dailyMap.get(dateStr) || {
              date: dateStr,
              commissions: 0,
              orderCount: 0,
              revenue: 0,
            }
          );
        }

        return result;
      }
    );
  }

  async getTopProducts(
    affiliateId: number,
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ): Promise<TopProduct[]> {
    return withPerformanceTracking(
      "AffiliateAnalyticsService",
      "getTopProducts",
      async () => {
        // Query orders with items and product designs
        // Join: orders -> order_items -> product_designs
        const { data: orderItems } = await supabase
          .from("order_items")
          .select(
            `
            id,
            order_id,
            product_design_id,
            quantity,
            total_price,
            orders!inner(affiliate_id, created_at),
            product_designs(id, name, primary_design_image_url)
          `
          )
          .eq("orders.affiliate_id", affiliateId)
          .order("orders.created_at", { ascending: false });

        // Filter by date if provided
        let filteredItems = orderItems || [];
        if (startDate && endDate) {
          filteredItems = filteredItems.filter((item: any) => {
            const orderDate = new Date(item.orders.created_at);
            return (
              orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
            );
          });
        }

        // Aggregate by product_design_id
        const productMap = new Map<string, TopProduct>();

        filteredItems.forEach((item: any) => {
          const productId = item.product_design_id;
          const existing = productMap.get(productId) || {
            productDesignId: productId,
            productName: item.product_designs?.name || "Unknown",
            imageUrl: item.product_designs?.primary_design_image_url || null,
            orderCount: 0,
            totalRevenue: 0,
            totalCommissions: 0,
            averageOrderValue: 0,
          };

          existing.orderCount += 1;
          existing.totalRevenue += item.total_price || 0;
          // Commission calculation would need to join with commissions table
          // For now, estimate or calculate separately

          productMap.set(productId, existing);
        });

        // Convert to array, calculate averages, and sort
        const products = Array.from(productMap.values())
          .map((p) => ({
            ...p,
            averageOrderValue:
              p.orderCount > 0 ? p.totalRevenue / p.orderCount : 0,
          }))
          .sort((a, b) => b.orderCount - a.orderCount)
          .slice(0, limit);

        // Calculate commissions per product (requires separate query)
        // This is a simplified version - may need optimization

        return products;
      }
    );
  }

  // Private helper methods
  private async getOrdersInPeriod(
    affiliateId: number,
    startDate: string,
    endDate: string
  ): Promise<OrderRow[]> {
    const { data: orders } = await DatabaseWrapper.executeQuery(
      async () => {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);
        return { data, error };
      },
      {
        operation: "getOrdersInPeriod",
        table: "orders",
        metadata: { affiliateId, startDate, endDate },
      }
    );

    return (orders as OrderRow[]) || [];
  }

  private async getCommissionsInPeriod(
    affiliateId: number,
    startDate: string,
    endDate: string
  ): Promise<CommissionRow[]> {
    const { data: commissions } = await DatabaseWrapper.executeQuery(
      async () => {
        const { data, error } = await supabase
          .from("commissions")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .gte("created_at", startDate)
          .lte("created_at", endDate);
        return { data, error };
      },
      {
        operation: "getCommissionsInPeriod",
        table: "commissions",
        metadata: { affiliateId, startDate, endDate },
      }
    );

    return (commissions as CommissionRow[]) || [];
  }

  private calculateOrderMetrics(orders: OrderRow[]) {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    return {
      total,
      delivered,
      cancelled,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      returned: orders.filter((o) => o.status === "returned").length,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      cancelRate: total > 0 ? (cancelled / total) * 100 : 0,
    };
  }

  private calculateRevenueMetrics(
    orders: OrderRow[],
    commissions: CommissionRow[]
  ) {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const totalCommissions = commissions.reduce(
      (sum, c) => sum + (Number(c.amount) || 0),
      0
    );
    const paidCommissions = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const pendingCommissions = totalCommissions - paidCommissions;
    const totalOrders = orders.length;

    return {
      totalRevenue,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      averageCommission: totalOrders > 0 ? totalCommissions / totalOrders : 0,
    };
  }

  private parseDateRange(request: AffiliateAnalyticsRequest): {
    startDate: string;
    endDate: string;
  } {
    if (request.startDate && request.endDate) {
      return {
        startDate: request.startDate,
        endDate: request.endDate,
      };
    }

    // Parse predefined periods
    const now = new Date();
    const endDate = now.toISOString();

    switch (request.period) {
      case "today":
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        return { startDate: todayStart.toISOString(), endDate };

      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        return { startDate: weekStart.toISOString(), endDate };

      case "month":
        const monthStart = new Date(now);
        monthStart.setDate(monthStart.getDate() - 30);
        return { startDate: monthStart.toISOString(), endDate };

      case "year":
        const yearStart = new Date(now);
        yearStart.setFullYear(yearStart.getFullYear() - 1);
        return { startDate: yearStart.toISOString(), endDate };

      case "all":
      default:
        // All time - set start to a very old date or affiliate creation date
        return {
          startDate: new Date(2000, 0, 1).toISOString(),
          endDate,
        };
    }
  }
}

// Export singleton instance
export const affiliateAnalyticsService =
  new SupabaseAffiliateAnalyticsService();
```

---

## 🎯 Application Layer

### Application Service (`application/services/analyticsApplicationService.ts`)

```typescript
import logger from "@/shared/utils/logger";
import { affiliateAnalyticsService } from "../../data";
import type {
  AffiliateAnalytics,
  AffiliateAnalyticsRequest,
  DailyRevenue,
  TopProduct,
} from "../../domain/entities";
import {
  AnalyticsApplicationError,
  AnalyticsErrorCodes,
  analyticsErrorHandler,
} from "../../domain/errors";
import type { AnalyticsRepository } from "../../domain/repositories";
// Import affiliate service to validate affiliate exists
import { affiliatesService } from "@/features/affiliates/data";

export class AnalyticsApplicationService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getAffiliateAnalytics(
    request: AffiliateAnalyticsRequest
  ): Promise<AffiliateAnalytics> {
    try {
      // Validate affiliate exists
      const affiliate = await affiliatesService.getAffiliateById(
        request.affiliateId
      );
      if (!affiliate) {
        throw analyticsErrorHandler.createError(
          AnalyticsErrorCodes.AFFILIATE_NOT_FOUND,
          `Affiliate with id ${request.affiliateId} not found`,
          "AnalyticsApplicationService"
        );
      }

      // Validate date range
      this.validateDateRange(request);

      // Delegate to repository
      return await this.analyticsRepository.getAffiliateAnalytics(request);
    } catch (error) {
      logger.error(
        `Failed to get affiliate analytics for ${request.affiliateId}`,
        error instanceof Error ? error : undefined
      );
      if (error instanceof AnalyticsApplicationError) throw error;
      throw new AnalyticsApplicationError(
        AnalyticsErrorCodes.ANALYTICS_FETCH_FAILED,
        "Failed to fetch affiliate analytics"
      );
    }
  }

  async getWeeklyRevenue(
    affiliateId: number,
    weekStartDate: string
  ): Promise<DailyRevenue[]> {
    try {
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      return await this.analyticsRepository.getWeeklyRevenue(
        affiliateId,
        weekStartDate,
        weekEndDate.toISOString()
      );
    } catch (error) {
      logger.error(
        `Failed to get weekly revenue for affiliate ${affiliateId}`,
        error instanceof Error ? error : undefined
      );
      throw new AnalyticsApplicationError(
        AnalyticsErrorCodes.ANALYTICS_FETCH_FAILED,
        "Failed to fetch weekly revenue"
      );
    }
  }

  async getTopProducts(
    affiliateId: number,
    options?: { startDate?: string; endDate?: string; limit?: number }
  ): Promise<TopProduct[]> {
    try {
      return await this.analyticsRepository.getTopProducts(
        affiliateId,
        options?.startDate,
        options?.endDate,
        options?.limit || 10
      );
    } catch (error) {
      logger.error(
        `Failed to get top products for affiliate ${affiliateId}`,
        error instanceof Error ? error : undefined
      );
      throw new AnalyticsApplicationError(
        AnalyticsErrorCodes.ANALYTICS_FETCH_FAILED,
        "Failed to fetch top products"
      );
    }
  }

  private validateDateRange(request: AffiliateAnalyticsRequest): void {
    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);

      if (start > end) {
        throw analyticsErrorHandler.createError(
          AnalyticsErrorCodes.INVALID_DATE_RANGE,
          "Start date must be before end date",
          "AnalyticsApplicationService"
        );
      }

      // Limit maximum range (e.g., 1 year)
      const daysDiff =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        throw analyticsErrorHandler.createError(
          AnalyticsErrorCodes.DATE_RANGE_TOO_LARGE,
          "Date range cannot exceed 365 days",
          "AnalyticsApplicationService"
        );
      }
    }
  }
}

// Export singleton instance
export const analyticsApplicationService = new AnalyticsApplicationService(
  affiliateAnalyticsService
);
```

### React Query Hooks (`application/useAnalytics.ts`)

```typescript
import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { analyticsApplicationService } from "./services/analyticsApplicationService";
import type { AffiliateAnalyticsRequest } from "../domain/entities";

const QUERY_KEYS = {
  AFFILIATE_ANALYTICS: (affiliateId: number, ...params: any[]) => [
    "analytics",
    "affiliate",
    affiliateId,
    ...params,
  ],
  WEEKLY_REVENUE: (affiliateId: number, weekStart: string) => [
    "analytics",
    "weekly-revenue",
    affiliateId,
    weekStart,
  ],
  TOP_PRODUCTS: (affiliateId: number, ...params: any[]) => [
    "analytics",
    "top-products",
    affiliateId,
    ...params,
  ],
} as const;

export const useAffiliateAnalytics = (
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

      const request: AffiliateAnalyticsRequest = {
        affiliateId,
        period: options?.period || "all",
        startDate: options?.startDate,
        endDate: options?.endDate,
        includeWeeklyBreakdown: options?.includeWeeklyBreakdown ?? true,
        includeTopProducts: options?.includeTopProducts ?? true,
        topProductsLimit: options?.topProductsLimit || 10,
      };

      return analyticsApplicationService.getAffiliateAnalytics(request);
    },
    {
      queryKey: [
        ...QUERY_KEYS.AFFILIATE_ANALYTICS(
          affiliateId!,
          options?.period,
          options?.startDate,
          options?.endDate
        ),
      ],
      enabled: !!affiliateId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useWeeklyRevenue = (
  affiliateId: number | null,
  weekStartDate: string
) => {
  return useStandardQuery(
    () => {
      if (!affiliateId) return null;
      return analyticsApplicationService.getWeeklyRevenue(
        affiliateId,
        weekStartDate
      );
    },
    {
      queryKey: [...QUERY_KEYS.WEEKLY_REVENUE(affiliateId!, weekStartDate)],
      enabled: !!affiliateId && !!weekStartDate,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useTopProducts = (
  affiliateId: number | null,
  options?: { startDate?: string; endDate?: string; limit?: number }
) => {
  return useStandardQuery(
    () => {
      if (!affiliateId) return null;
      return analyticsApplicationService.getTopProducts(affiliateId, options);
    },
    {
      queryKey: [
        ...QUERY_KEYS.TOP_PRODUCTS(
          affiliateId!,
          options?.startDate,
          options?.endDate,
          options?.limit
        ),
      ],
      enabled: !!affiliateId,
      staleTime: 5 * 60 * 1000,
    }
  );
};
```

---

## ✅ Benefits of Separate Analytics Feature

1. **Clear Separation**: Analytics logic separate from business logic
2. **Reusability**: Can be used by multiple features/views
3. **Scalability**: Easy to add platform-wide analytics, order analytics, etc.
4. **Testability**: Isolated, easier to test
5. **Maintainability**: Changes to analytics don't affect affiliate CRUD operations
6. **Clean Architecture**: Follows dependency rule (analytics depends on data, not services)

---

## 🔄 Migration from Affiliates Feature

1. Keep existing `getAffiliateStats` in affiliates feature (for backward compatibility)
2. Add new analytics feature
3. Gradually migrate components to use analytics hooks
4. Deprecate old stats after full migration

---

## 📋 Implementation Plan

### Phase 1: Foundation (Week 1)

1. Create analytics feature structure
2. Implement domain layer (entities, errors, repositories)
3. Implement data layer service
4. Write data layer tests

### Phase 2: Application Layer (Week 2)

1. Implement application service
2. Create React Query hooks
3. Write application layer tests
4. Write hooks tests

### Phase 3: Integration (Week 3)

1. Update UI components to use analytics hooks
2. Add date range pickers
3. Performance optimization
4. Documentation

---

This architecture provides a clean, scalable foundation for analytics! 🚀
