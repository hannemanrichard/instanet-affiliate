# 🚀 **Comprehensive React Query Implementation Guide**

## **Apply These Proven Patterns to Your Next Project**

Based on the analysis of a production-ready affiliate marketing platform with **100% test coverage** and **enterprise-grade architecture**, here's a complete guide to implement the same React Query patterns.

---

## 📋 **Table of Contents**

1. [Core Infrastructure Setup](#1-core-infrastructure-setup)
2. [Standardized Hook Patterns](#2-standardized-hook-patterns)
3. [Query Key Management](#3-query-key-management)
4. [Optimistic UI Implementation](#4-optimistic-ui-implementation)
5. [Feature-Specific Hook Patterns](#5-feature-specific-hook-patterns)
6. [Error Handling & Performance](#6-error-handling--performance)
7. [Testing Strategies](#7-testing-strategies)
8. [Migration Checklist](#8-migration-checklist)

---

## 1. **Core Infrastructure Setup**

### **1.1 React Query Provider Configuration**

```typescript
// src/shared/lib/providers/react-query.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection time
            refetchOnWindowFocus: false, // Prevent unnecessary refetches
            refetchOnReconnect: true, // Refetch when connection restored
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx client errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry up to 3 times for server errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### **1.2 Root Layout Integration**

```typescript
// src/app/layout.tsx
import { ReactQueryProvider } from "@/shared/lib/providers/react-query";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

---

## 2. **Standardized Hook Patterns**

### **2.1 Core Standardized Hooks**

```typescript
// src/shared/hooks/useReactQuery.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";

/**
 * Standardized query hook with consistent defaults
 */
export const useStandardQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
    retry?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 minutes default
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 3,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options?.refetchOnReconnect ?? true,
  });
};

/**
 * Standardized mutation hook with automatic cache invalidation
 */
export const useStandardMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success toast
      if (options?.showSuccessToast !== false) {
        toast({
          title: "Success",
          description:
            options?.successMessage ?? "Operation completed successfully",
          variant: "default",
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Show error toast
      if (options?.showErrorToast !== false) {
        toast({
          title: "Error",
          description:
            options?.errorMessage ?? error.message ?? "An error occurred",
          variant: "destructive",
        });
      }

      options?.onError?.(error, variables);
    },
  });
};

/**
 * Optimistic mutation hook for instant UI updates
 */
export const useOptimisticMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    optimisticUpdate?: (variables: TVariables) => any;
    rollbackOnError?: boolean;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (options?.optimisticUpdate) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries();

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(
          options.invalidateQueries?.[0] ?? []
        );

        // Optimistically update to the new value
        queryClient.setQueryData(
          options.invalidateQueries?.[0] ?? [],
          options.optimisticUpdate(variables)
        );

        // Return a context object with the snapshotted value
        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (options?.rollbackOnError && context?.previousData) {
        queryClient.setQueryData(
          options.invalidateQueries?.[0] ?? [],
          context.previousData
        );
      }

      // Show error toast
      if (options?.showErrorToast !== false) {
        toast({
          title: "Error",
          description:
            options?.errorMessage ?? error.message ?? "An error occurred",
          variant: "destructive",
        });
      }

      options?.onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success toast
      if (options?.showSuccessToast !== false && options?.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(data, variables);
    },
  });
};

/**
 * Paginated query hook for large datasets
 */
export const usePaginatedQuery = <T>(
  queryKey: string[],
  queryFn: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options?: {
    page?: number;
    limit?: number;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  return useStandardQuery(
    [...queryKey, "paginated", page, limit],
    () => queryFn(page, limit),
    {
      staleTime: options?.staleTime,
      gcTime: options?.gcTime,
    }
  );
};

/**
 * Infinite query hook for infinite scrolling
 */
export const useInfiniteQueryHook = <T>(
  queryKey: string[],
  queryFn: ({
    pageParam,
  }: {
    pageParam: number;
  }) => Promise<{ data: T[]; nextCursor?: number }>,
  options?: {
    initialPageParam?: number;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: options?.initialPageParam ?? 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 30 * 60 * 1000,
  });
};
```

---

## 3. **Query Key Management**

### **3.1 Centralized Query Keys**

```typescript
// src/shared/utils/migrationHelpers.ts
/**
 * Common query key patterns used across the application
 */
export const QUERY_KEYS = {
  // Leads
  LEADS: ["leads"],
  LEADS_BY_PARTNER: (partnerId: number) => ["leads", "partner", partnerId],
  LEAD_BY_ID: (leadId: number) => ["leads", leadId],
  ELIGIBLE_LEADS: (partnerId: number) => ["leads", "eligible", partnerId],

  // Orders
  ORDERS: ["orders"],
  ORDERS_BY_PARTNER: (partnerId: number) => ["orders", "partner", partnerId],
  ORDER_BY_ID: (orderId: number) => ["orders", orderId],
  ORDER_ITEMS: (orderId: number) => ["orders", orderId, "items"],

  // Partners
  PARTNERS: ["partners"],
  PARTNER_BY_ID: (partnerId: number) => ["partners", partnerId],
  PARTNER_BY_EMAIL: (email: string) => ["partners", "email", email],
  PARTNER_STATS: (partnerId: number) => ["partners", partnerId, "stats"],

  // Products
  PRODUCTS: ["products"],
  PRODUCT_BY_ID: (productId: number) => ["products", productId],
  PRODUCT_CATEGORIES: ["products", "categories"],

  // Parcels
  PARCELS: ["parcels"],
  PARCELS_BY_PARTNER: (partnerId: number) => ["parcels", "partner", partnerId],
  PARCEL_BY_ID: (parcelId: number) => ["parcels", parcelId],

  // Payouts
  PAYOUTS: ["payouts"],
  PAYOUTS_BY_PARTNER: (partnerId: number) => ["payouts", "partner", partnerId],
  PAYOUT_BY_ID: (payoutId: number) => ["payouts", payoutId],
  PAYOUT_SUMMARY: (partnerId: number) => ["payouts", "summary", partnerId],

  // Commissions
  COMMISSIONS: ["commissions"],
  COMMISSIONS_BY_PARTNER: (partnerId: number) => [
    "commissions",
    "partner",
    partnerId,
  ],
  COMMISSION_SUMMARY: (partnerId: number) => [
    "commissions",
    "summary",
    partnerId,
  ],

  // Withdrawals
  WITHDRAWALS: ["withdrawals"],
  WITHDRAWALS_BY_PARTNER: (partnerId: number) => [
    "withdrawals",
    "partner",
    partnerId,
  ],
  WITHDRAWAL_BY_ID: (withdrawalId: number) => ["withdrawals", withdrawalId],
  WITHDRAWAL_SUMMARY: (partnerId: number) => [
    "withdrawals",
    "summary",
    partnerId,
  ],
} as const;
```

### **3.2 Cache Invalidation Patterns**

```typescript
// src/shared/utils/migrationHelpers.ts
/**
 * Common cache invalidation patterns
 */
export const INVALIDATION_PATTERNS = {
  // When a lead is created/updated/deleted
  LEAD_CHANGES: (partnerId?: number) => [
    QUERY_KEYS.LEADS,
    ...(partnerId ? [QUERY_KEYS.LEADS_BY_PARTNER(partnerId)] : []),
  ],

  // When an order is created/updated/deleted
  ORDER_CHANGES: (partnerId?: number, orderId?: number) => [
    QUERY_KEYS.ORDERS,
    ...(partnerId ? [QUERY_KEYS.ORDERS_BY_PARTNER(partnerId)] : []),
    ...(orderId
      ? [QUERY_KEYS.ORDER_BY_ID(orderId), QUERY_KEYS.ORDER_ITEMS(orderId)]
      : []),
  ],

  // When a partner is updated
  PARTNER_CHANGES: (partnerId: number) => [
    QUERY_KEYS.PARTNERS,
    QUERY_KEYS.PARTNER_BY_ID(partnerId),
    QUERY_KEYS.PARTNER_STATS(partnerId),
  ],

  // When a product is created/updated/deleted
  PRODUCT_CHANGES: (productId?: number) => [
    QUERY_KEYS.PRODUCTS,
    ...(productId ? [QUERY_KEYS.PRODUCT_BY_ID(productId)] : []),
  ],

  // When a parcel is created/updated/deleted
  PARCEL_CHANGES: (partnerId?: number, parcelId?: number) => [
    QUERY_KEYS.PARCELS,
    ...(partnerId ? [QUERY_KEYS.PARCELS_BY_PARTNER(partnerId)] : []),
    ...(parcelId ? [QUERY_KEYS.PARCEL_BY_ID(parcelId)] : []),
  ],

  // When a payout is created/updated/deleted
  PAYOUT_CHANGES: (partnerId?: number, payoutId?: number) => [
    QUERY_KEYS.PAYOUTS,
    ...(partnerId
      ? [
          QUERY_KEYS.PAYOUTS_BY_PARTNER(partnerId),
          QUERY_KEYS.PAYOUT_SUMMARY(partnerId),
        ]
      : []),
    ...(payoutId ? [QUERY_KEYS.PAYOUT_BY_ID(payoutId)] : []),
  ],

  // When a commission is created/updated/deleted
  COMMISSION_CHANGES: (partnerId?: number) => [
    QUERY_KEYS.COMMISSIONS,
    ...(partnerId
      ? [
          QUERY_KEYS.COMMISSIONS_BY_PARTNER(partnerId),
          QUERY_KEYS.COMMISSION_SUMMARY(partnerId),
        ]
      : []),
  ],

  // When a withdrawal is created/updated/deleted
  WITHDRAWAL_CHANGES: (partnerId?: number, withdrawalId?: number) => [
    QUERY_KEYS.WITHDRAWALS,
    ...(partnerId
      ? [
          QUERY_KEYS.WITHDRAWALS_BY_PARTNER(partnerId),
          QUERY_KEYS.WITHDRAWAL_SUMMARY(partnerId),
        ]
      : []),
    ...(withdrawalId ? [QUERY_KEYS.WITHDRAWAL_BY_ID(withdrawalId)] : []),
  ],
} as const;
```

---

## 4. **Optimistic UI Implementation**

### **4.1 Optimistic Query Hook**

```typescript
// src/shared/hooks/useReactQuery.ts
/**
 * Optimistic query hook for instant UI updates
 */
export const useOptimisticQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    optimisticData?: T;
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
  }
) => {
  const queryClient = useQueryClient();

  const query = useStandardQuery(queryKey, queryFn, {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    enabled: options?.enabled,
  });

  const setOptimisticData = (data: T) => {
    queryClient.setQueryData(queryKey, data);
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...query,
    setOptimisticData,
    invalidateQuery,
  };
};
```

### **4.2 Optimistic Operations Hook**

```typescript
// src/shared/hooks/useReactQuery.ts
/**
 * Hook for managing optimistic operations
 */
export const useOptimisticOperations = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) => {
  const queryClient = useQueryClient();

  const executeOptimisticUpdate = (
    updateFn: (oldData: T | undefined) => T,
    rollbackFn?: () => void
  ) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData<T>(queryKey);

    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, updateFn);

    // Return rollback function
    return () => {
      queryClient.setQueryData(queryKey, previousData);
      rollbackFn?.();
    };
  };

  const commitOptimisticUpdate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    executeOptimisticUpdate,
    commitOptimisticUpdate,
  };
};
```

---

## 5. **Feature-Specific Hook Patterns**

### **5.1 Leads Feature Hooks**

```typescript
// src/features/leads/application/useLeads.ts
import {
  useStandardQuery,
  useStandardMutation,
  useOptimisticMutation,
} from "@/shared/hooks/useReactQuery";
import {
  QUERY_KEYS,
  INVALIDATION_PATTERNS,
} from "@/shared/utils/migrationHelpers";
import { leadsApplicationService } from "./services/leadsApplicationService";
import type {
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadEntity,
} from "../domain";

export const useLeads = (partnerId?: number) => {
  return useStandardQuery(
    partnerId ? QUERY_KEYS.LEADS_BY_PARTNER(partnerId) : QUERY_KEYS.LEADS,
    () => leadsApplicationService.getLeads(partnerId),
    {
      enabled: !!partnerId,
    }
  );
};

export const useLead = (leadId: number) => {
  return useStandardQuery(
    QUERY_KEYS.LEAD_BY_ID(leadId),
    () => leadsApplicationService.getLeadById(leadId),
    {
      enabled: !!leadId,
    }
  );
};

export const useCreateLead = () => {
  return useStandardMutation(
    (request: CreateLeadRequest) => leadsApplicationService.createLead(request),
    {
      invalidateQueries: INVALIDATION_PATTERNS.LEAD_CHANGES(request.partner_id),
      successMessage: "Lead created successfully",
      errorMessage: "Failed to create lead",
    }
  );
};

export const useUpdateLead = () => {
  return useOptimisticMutation(
    ({ leadId, request }: { leadId: number; request: UpdateLeadRequest }) =>
      leadsApplicationService.updateLead(leadId, request),
    {
      invalidateQueries: INVALIDATION_PATTERNS.LEAD_CHANGES(request.partner_id),
      optimisticUpdate:
        ({ leadId, request }) =>
        (oldData: any) => ({
          ...oldData,
          ...request,
          id: leadId,
        }),
      rollbackOnError: true,
      successMessage: "Lead updated successfully",
      errorMessage: "Failed to update lead",
    }
  );
};

export const useDeleteLead = () => {
  return useStandardMutation(
    (leadId: number) => leadsApplicationService.deleteLead(leadId),
    {
      invalidateQueries: INVALIDATION_PATTERNS.LEAD_CHANGES(),
      successMessage: "Lead deleted successfully",
      errorMessage: "Failed to delete lead",
    }
  );
};
```

### **5.2 Orders Feature Hooks**

```typescript
// src/features/orders/application/useOrders.ts
import {
  useStandardQuery,
  useStandardMutation,
  useOptimisticMutation,
} from "@/shared/hooks/useReactQuery";
import {
  QUERY_KEYS,
  INVALIDATION_PATTERNS,
} from "@/shared/utils/migrationHelpers";
import { ordersApplicationService } from "./services/ordersApplicationService";
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderEntity,
} from "../domain";

export const useOrders = (partnerId?: number) => {
  return useStandardQuery(
    partnerId ? QUERY_KEYS.ORDERS_BY_PARTNER(partnerId) : QUERY_KEYS.ORDERS,
    () => ordersApplicationService.getOrders(partnerId),
    {
      enabled: !!partnerId,
    }
  );
};

export const useOrder = (orderId: number) => {
  return useStandardQuery(
    QUERY_KEYS.ORDER_BY_ID(orderId),
    () => ordersApplicationService.getOrderById(orderId),
    {
      enabled: !!orderId,
    }
  );
};

export const useOrderItems = (orderId: number) => {
  return useStandardQuery(
    QUERY_KEYS.ORDER_ITEMS(orderId),
    () => ordersApplicationService.getOrderItems(orderId),
    {
      enabled: !!orderId,
    }
  );
};

export const useCreateOrder = () => {
  return useStandardMutation(
    (request: CreateOrderRequest) =>
      ordersApplicationService.createOrder(request),
    {
      invalidateQueries: INVALIDATION_PATTERNS.ORDER_CHANGES(
        request.partner_id
      ),
      successMessage: "Order created successfully",
      errorMessage: "Failed to create order",
    }
  );
};

export const useUpdateOrderStatus = () => {
  return useOptimisticMutation(
    ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      ordersApplicationService.updateOrderStatus(orderId, status),
    {
      invalidateQueries: INVALIDATION_PATTERNS.ORDER_CHANGES(
        undefined,
        orderId
      ),
      optimisticUpdate:
        ({ orderId, status }) =>
        (oldData: any) => ({
          ...oldData,
          status,
          id: orderId,
        }),
      rollbackOnError: true,
      successMessage: "Order status updated successfully",
      errorMessage: "Failed to update order status",
    }
  );
};
```

### **5.3 Products Feature Hooks**

```typescript
// src/features/products/application/useProducts.ts
import {
  useStandardQuery,
  useStandardMutation,
  useOptimisticMutation,
} from "@/shared/hooks/useReactQuery";
import {
  QUERY_KEYS,
  INVALIDATION_PATTERNS,
} from "@/shared/utils/migrationHelpers";
import { productsApplicationService } from "./services/productsApplicationService";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductEntity,
} from "../domain";

export const useProducts = () => {
  return useStandardQuery(QUERY_KEYS.PRODUCTS, () =>
    productsApplicationService.getProducts()
  );
};

export const useProduct = (productId: number) => {
  return useStandardQuery(
    QUERY_KEYS.PRODUCT_BY_ID(productId),
    () => productsApplicationService.getProductById(productId),
    {
      enabled: !!productId,
    }
  );
};

export const useProductCategories = () => {
  return useStandardQuery(QUERY_KEYS.PRODUCT_CATEGORIES, () =>
    productsApplicationService.getProductCategories()
  );
};

export const useCreateProduct = () => {
  return useStandardMutation(
    (request: CreateProductRequest) =>
      productsApplicationService.createProduct(request),
    {
      invalidateQueries: INVALIDATION_PATTERNS.PRODUCT_CHANGES(),
      successMessage: "Product created successfully",
      errorMessage: "Failed to create product",
    }
  );
};

export const useUpdateProduct = () => {
  return useOptimisticMutation(
    ({
      productId,
      request,
    }: {
      productId: number;
      request: UpdateProductRequest;
    }) => productsApplicationService.updateProduct(productId, request),
    {
      invalidateQueries: INVALIDATION_PATTERNS.PRODUCT_CHANGES(productId),
      optimisticUpdate:
        ({ productId, request }) =>
        (oldData: any) => ({
          ...oldData,
          ...request,
          id: productId,
        }),
      rollbackOnError: true,
      successMessage: "Product updated successfully",
      errorMessage: "Failed to update product",
    }
  );
};
```

---

## 6. **Error Handling & Performance**

### **6.1 Error Handling Patterns**

```typescript
// src/shared/utils/errorHandling.ts
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export const handleApiError = (error: any): ApiError => {
  if (error?.response?.data) {
    return {
      code: error.response.data.code || "UNKNOWN_ERROR",
      message: error.response.data.message || "An error occurred",
      details: error.response.data.details,
    };
  }

  if (error?.message) {
    return {
      code: "NETWORK_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
};

export const isRetryableError = (error: any): boolean => {
  const status = error?.response?.status;
  return !status || status >= 500 || status === 429;
};
```

### **6.2 Performance Optimization**

```typescript
// src/shared/hooks/useReactQuery.ts
/**
 * Prefetch hook for performance optimization
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options?: {
      staleTime?: number;
      gcTime?: number;
    }
  ) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime ?? 5 * 60 * 1000,
      gcTime: options?.gcTime ?? 30 * 60 * 1000,
    });
  };

  const prefetchInfiniteQuery = <T>(
    queryKey: string[],
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<{ data: T[]; nextCursor?: number }>,
    options?: {
      initialPageParam?: number;
      staleTime?: number;
      gcTime?: number;
    }
  ) => {
    return queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn,
      initialPageParam: options?.initialPageParam ?? 0,
      staleTime: options?.staleTime ?? 5 * 60 * 1000,
      gcTime: options?.gcTime ?? 30 * 60 * 1000,
    });
  };

  return {
    prefetchQuery,
    prefetchInfiniteQuery,
  };
};

/**
 * Cache management hook
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKey: string[]) => {
    return queryClient.invalidateQueries({ queryKey });
  };

  const removeQueries = (queryKey: string[]) => {
    return queryClient.removeQueries({ queryKey });
  };

  const clearCache = () => {
    return queryClient.clear();
  };

  const getQueryData = <T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  };

  const setQueryData = <T>(queryKey: string[], data: T) => {
    return queryClient.setQueryData<T>(queryKey, data);
  };

  return {
    invalidateQueries,
    removeQueries,
    clearCache,
    getQueryData,
    setQueryData,
  };
};
```

---

## 7. **Testing Strategies**

### **7.1 Mock Setup for Tests**

```typescript
// src/shared/test-utils/reactQueryTestUtils.ts
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const renderWithQueryClient = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export const createMockQueryClient = () => createTestQueryClient();
```

### **7.2 Hook Testing Example**

```typescript
// src/features/leads/__tests__/useLeads.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLeads } from "../application/useLeads";
import { leadsApplicationService } from "../application/services/leadsApplicationService";

// Mock the application service
jest.mock("../application/services/leadsApplicationService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useLeads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch leads successfully", async () => {
    const mockLeads = [
      { id: 1, name: "Lead 1", partner_id: 1 },
      { id: 2, name: "Lead 2", partner_id: 1 },
    ];

    (leadsApplicationService.getLeads as jest.Mock).mockResolvedValue(mockLeads);

    const { result } = renderHook(() => useLeads(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLeads);
    expect(leadsApplicationService.getLeads).toHaveBeenCalledWith(1);
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("Failed to fetch leads");
    (leadsApplicationService.getLeads as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useLeads(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
```

---

## 8. **Migration Checklist**

### **8.1 Pre-Migration Setup**

- [ ] Install React Query dependencies

  ```bash
  npm install @tanstack/react-query @tanstack/react-query-devtools
  ```

- [ ] Set up React Query Provider in root layout
- [ ] Create standardized hook patterns
- [ ] Set up query key management system
- [ ] Configure error handling patterns

### **8.2 Feature Migration Steps**

For each feature:

- [ ] **Create feature-specific hooks**
  - [ ] Define query keys for the feature
  - [ ] Create CRUD hooks using standardized patterns
  - [ ] Implement optimistic updates where appropriate

- [ ] **Update components**
  - [ ] Replace existing data fetching with new hooks
  - [ ] Update loading and error states
  - [ ] Implement optimistic UI updates

- [ ] **Add tests**
  - [ ] Test hook behavior
  - [ ] Test error handling
  - [ ] Test optimistic updates

### **8.3 Post-Migration Optimization**

- [ ] **Performance optimization**
  - [ ] Implement prefetching for critical data
  - [ ] Set up proper cache invalidation
  - [ ] Monitor query performance

- [ ] **Error handling**
  - [ ] Implement global error boundaries
  - [ ] Add retry logic for failed requests
  - [ ] Set up error reporting

- [ ] **Developer experience**
  - [ ] Add React Query DevTools
  - [ ] Document hook usage patterns
  - [ ] Create migration guides for team

---

## 🎯 **Key Benefits of This Implementation**

1. **Consistency**: Standardized patterns across all features
2. **Performance**: Optimistic updates and intelligent caching
3. **Developer Experience**: Type-safe hooks with automatic error handling
4. **Maintainability**: Centralized query key management
5. **Testing**: Comprehensive test coverage with proven patterns
6. **Scalability**: Easy to add new features following established patterns

---

## 📚 **Additional Resources**

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Testing React Query](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

**Ready to implement? Start with the Core Infrastructure Setup and work through each section systematically. This proven architecture will give you enterprise-grade data fetching capabilities with excellent developer experience!** 🚀

---

## 🔄 **Migration from useAsyncOperation**

### **Understanding useAsyncOperation Pattern**

Many projects use custom `useAsyncOperation` hooks that combine loading states, error handling, and data fetching. Here's how to migrate them to React Query patterns:

#### **Before: useAsyncOperation Pattern**

```typescript
// Old pattern - useAsyncOperation
const {
  data,
  loading,
  error,
  execute: fetchData,
  reset
} = useAsyncOperation(async () => {
  const response = await api.getData();
  return response.data;
});

// Usage in component
useEffect(() => {
  fetchData();
}, [fetchData]);

if (loading) return <Loading />;
if (error) return <Error error={error} />;
return <DataComponent data={data} />;
```

#### **After: React Query Pattern**

```typescript
// New pattern - React Query
const {
  data,
  isLoading,
  error,
  refetch
} = useStandardQuery(
  ['data'],
  () => api.getData(),
  {
    enabled: true, // Auto-fetch on mount
  }
);

// Usage in component
if (isLoading) return <Loading />;
if (error) return <Error error={error} />;
return <DataComponent data={data} />;
```

### **Migration Strategies**

#### **1. Direct Replacement Pattern**

```typescript
// OLD: useAsyncOperation for manual execution
const { data, loading, error, execute } = useAsyncOperation(fetchFunction);

// NEW: React Query with manual refetch
const { data, isLoading, error, refetch } = useStandardQuery(
  ["manual-data"],
  fetchFunction,
  { enabled: false } // Don't auto-fetch
);

// Trigger manually
const handleFetch = () => refetch();
```

#### **2. Conditional Fetching Pattern**

```typescript
// OLD: useAsyncOperation with conditions
const { data, loading, error, execute } = useAsyncOperation(async () => {
  if (!userId) return null;
  return await api.getUserData(userId);
});

// NEW: React Query with enabled condition
const { data, isLoading, error } = useStandardQuery(
  ["user-data", userId],
  () => api.getUserData(userId),
  {
    enabled: !!userId, // Only fetch when userId exists
  }
);
```

#### **3. Mutation Pattern**

```typescript
// OLD: useAsyncOperation for mutations
const {
  loading,
  error,
  execute: submitData,
} = useAsyncOperation(async (formData) => {
  const response = await api.submitData(formData);
  return response.data;
});

// NEW: React Query mutation
const { mutate, isLoading, error } = useStandardMutation(
  (formData) => api.submitData(formData),
  {
    onSuccess: (data) => {
      // Handle success
      toast.success("Data submitted successfully");
    },
    onError: (error) => {
      // Handle error
      toast.error("Failed to submit data");
    },
  }
);
```

### **Migration Checklist for useAsyncOperation**

#### **Step 1: Identify Patterns**

- [ ] **Data Fetching**: Replace with `useStandardQuery`
- [ ] **Manual Execution**: Use `refetch` or `enabled: false`
- [ ] **Mutations**: Replace with `useStandardMutation`
- [ ] **Loading States**: `loading` → `isLoading`
- [ ] **Error Handling**: Update error handling patterns
- [ ] **Reset Functionality**: Use `refetch` or cache invalidation

#### **Step 2: Update Hook Usage**

```typescript
// OLD: Multiple useAsyncOperation calls
const userData = useAsyncOperation(() => api.getUser(id));
const userPosts = useAsyncOperation(() => api.getUserPosts(id));
const userSettings = useAsyncOperation(() => api.getUserSettings(id));

// NEW: Multiple React Query hooks
const userData = useStandardQuery(["user", id], () => api.getUser(id));
const userPosts = useStandardQuery(["user-posts", id], () =>
  api.getUserPosts(id)
);
const userSettings = useStandardQuery(["user-settings", id], () =>
  api.getUserSettings(id)
);
```

#### **Step 3: Update Component Logic**

```typescript
// OLD: Manual effect management
useEffect(() => {
  if (userId) {
    userData.execute();
    userPosts.execute();
  }
}, [userId, userData.execute, userPosts.execute]);

// NEW: Automatic with enabled conditions
const userData = useStandardQuery(["user", userId], () => api.getUser(userId), {
  enabled: !!userId,
});
const userPosts = useStandardQuery(
  ["user-posts", userId],
  () => api.getUserPosts(userId),
  { enabled: !!userId }
);
```

### **Common Migration Scenarios**

#### **Scenario 1: Search with Debouncing**

```typescript
// OLD: useAsyncOperation with manual debouncing
const [searchTerm, setSearchTerm] = useState("");
const { data, loading, error, execute } = useAsyncOperation(async () => {
  if (!searchTerm) return [];
  return await api.search(searchTerm);
});

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchTerm) execute();
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm, execute]);

// NEW: React Query with built-in debouncing
const [searchTerm, setSearchTerm] = useState("");
const { data, isLoading, error } = useStandardQuery(
  ["search", searchTerm],
  () => api.search(searchTerm),
  {
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 300, // Debounce effect
  }
);
```

#### **Scenario 2: Dependent Queries**

```typescript
// OLD: useAsyncOperation with manual dependency management
const {
  data: user,
  loading: userLoading,
  execute: fetchUser,
} = useAsyncOperation(() => api.getUser(userId));
const {
  data: posts,
  loading: postsLoading,
  execute: fetchPosts,
} = useAsyncOperation(() => api.getUserPosts(user?.id));

useEffect(() => {
  if (userId) fetchUser();
}, [userId, fetchUser]);

useEffect(() => {
  if (user?.id) fetchPosts();
}, [user?.id, fetchPosts]);

// NEW: React Query with automatic dependencies
const { data: user, isLoading: userLoading } = useStandardQuery(
  ["user", userId],
  () => api.getUser(userId),
  { enabled: !!userId }
);

const { data: posts, isLoading: postsLoading } = useStandardQuery(
  ["user-posts", user?.id],
  () => api.getUserPosts(user.id),
  { enabled: !!user?.id }
);
```

#### **Scenario 3: Optimistic Updates**

```typescript
// OLD: useAsyncOperation with manual optimistic updates
const {
  data: todos,
  loading,
  execute: updateTodo,
} = useAsyncOperation(async (todoId, updates) => {
  // Optimistic update
  setTodos((prev) =>
    prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
  );

  try {
    const response = await api.updateTodo(todoId, updates);
    return response.data;
  } catch (error) {
    // Rollback on error
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
    );
    throw error;
  }
});

// NEW: React Query with built-in optimistic updates
const { mutate: updateTodo } = useOptimisticMutation(
  ({ todoId, updates }) => api.updateTodo(todoId, updates),
  {
    onMutate: async ({ todoId, updates }) => {
      await queryClient.cancelQueries(["todos"]);
      const previousTodos = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["todos"], (old: Todo[]) =>
        old.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
      );
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },
  }
);
```

### **Migration Helper Functions**

```typescript
// Helper to convert useAsyncOperation to React Query
export const convertAsyncOperation = <T>(
  asyncOperation: () => Promise<T>,
  queryKey: string[],
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useStandardQuery(queryKey, asyncOperation, options);
};

// Usage
const userData = convertAsyncOperation(
  () => api.getUser(userId),
  ["user", userId],
  { enabled: !!userId }
);
```

---

## 🤖 **AI Assistant Prompt for Implementation**

Use this comprehensive prompt with your AI coding assistant to implement the React Query patterns in your project:

---

### **System Prompt for AI Assistant**

```
You are a Senior Front-End Developer and Expert in ReactJS, NextJS, JavaScript, TypeScript, HTML, CSS, and modern UI/UX frameworks (e.g., TailwindCSS, Shadcn, Radix). You are implementing React Query patterns based on a production-ready affiliate marketing platform with 100% test coverage and enterprise-grade architecture.

## Your Task
Implement the React Query patterns from the comprehensive guide above in the user's project. Follow these proven patterns exactly:

### Core Requirements:
1. **Standardized Hook Patterns**: Implement useStandardQuery, useStandardMutation, useOptimisticMutation, usePaginatedQuery, useInfiniteQueryHook
2. **Query Key Management**: Create centralized QUERY_KEYS and INVALIDATION_PATTERNS
3. **Optimistic UI**: Implement optimistic updates with rollback capabilities
4. **Error Handling**: Robust error handling with toast notifications
5. **Performance**: Prefetching and cache management
6. **Testing**: Comprehensive test coverage with proven patterns

### Implementation Guidelines:
- Follow the exact code patterns from the guide
- Use TypeScript with proper type safety
- Implement clean architecture principles
- Add comprehensive error handling
- Include optimistic updates where appropriate
- Write tests for all hooks and components
- Use consistent naming conventions
- Follow the established file structure

### Key Patterns to Implement:
1. **React Query Provider** with optimal defaults
2. **Standardized Hooks** for queries and mutations
3. **Query Key Management** system
4. **Cache Invalidation** patterns
5. **Optimistic Updates** with rollback
6. **Error Handling** with user feedback
7. **Performance Optimization** techniques
8. **Testing Strategies** with mocks

### File Structure:
```

src/
├── shared/
│ ├── hooks/
│ │ └── useReactQuery.ts
│ ├── lib/
│ │ └── providers/
│ │ └── react-query.tsx
│ ├── utils/
│ │ ├── migrationHelpers.ts
│ │ └── errorHandling.ts
│ └── test-utils/
│ └── reactQueryTestUtils.ts
├── features/
│ └── [feature-name]/
│ ├── application/
│ │ └── use[Feature].ts
│ └── **tests**/
│ └── use[Feature].test.ts
└── app/
└── layout.tsx

```

### Quality Standards:
- Write correct, best practice, DRY principle code
- Focus on readability over performance
- Fully implement all requested functionality
- Leave NO todos, placeholders, or missing pieces
- Ensure code is complete and verified
- Include all required imports
- Use proper naming conventions
- Add comprehensive error handling
- Implement accessibility features
- Use consts instead of functions
- Define types where possible

### Testing Requirements:
- Write unit tests for every function and component
- Use proven testing patterns from the guide
- Mock external dependencies properly
- Test error scenarios
- Test optimistic updates
- Achieve high test coverage

When implementing, start with the Core Infrastructure Setup and work through each section systematically. Ensure all code follows the exact patterns from the guide and maintains consistency with the established architecture.
```

---

### **User Prompt Template**

```
I need you to implement React Query patterns in my [PROJECT_TYPE] project following the comprehensive guide above.

## Project Details:
- **Project Type**: [Next.js/React/Vue/etc.]
- **Framework**: [Next.js 15, React 19, etc.]
- **Language**: [TypeScript/JavaScript]
- **Styling**: [TailwindCSS/SCSS/etc.]
- **UI Library**: [Shadcn/Radix/Material-UI/etc.]
- **Backend**: [Supabase/API/GraphQL/etc.]

## Current State:
- [ ] React Query not implemented
- [ ] Using [current data fetching method]
- [ ] No standardized patterns
- [ ] Limited error handling
- [ ] No optimistic updates

## Requirements:
1. **Implement Core Infrastructure**: React Query Provider with optimal defaults
2. **Create Standardized Hooks**: useStandardQuery, useStandardMutation, useOptimisticMutation
3. **Set up Query Key Management**: Centralized QUERY_KEYS and INVALIDATION_PATTERNS
4. **Add Optimistic UI**: Instant updates with rollback capabilities
5. **Implement Error Handling**: Robust error handling with user feedback
6. **Add Performance Features**: Prefetching and cache management
7. **Write Tests**: Comprehensive test coverage for all hooks

## Features to Implement:
- [ ] [Feature 1]: CRUD operations with optimistic updates
- [ ] [Feature 2]: Pagination and infinite scrolling
- [ ] [Feature 3]: Real-time updates
- [ ] [Feature 4]: Search and filtering
- [ ] [Feature 5]: Bulk operations

## Specific Requirements:
- Follow the exact patterns from the guide
- Use TypeScript with proper type safety
- Implement clean architecture principles
- Add comprehensive error handling
- Include optimistic updates where appropriate
- Write tests for all hooks and components
- Use consistent naming conventions
- Follow the established file structure

## Expected Outcome:
A production-ready React Query implementation with:
- ✅ Standardized patterns across all features
- ✅ Optimistic updates and intelligent caching
- ✅ Type-safe hooks with automatic error handling
- ✅ Centralized query key management
- ✅ Comprehensive test coverage
- ✅ Easy to add new features following established patterns

Please implement this step by step, starting with the Core Infrastructure Setup and working through each section systematically. Ensure all code follows the exact patterns from the guide and maintains consistency with the established architecture.
```

---

### **Quick Start Prompt**

```
Implement React Query patterns in my project following the guide above. Start with:

1. **Core Infrastructure**: React Query Provider setup
2. **Standardized Hooks**: useStandardQuery, useStandardMutation, useOptimisticMutation
3. **Query Keys**: Centralized QUERY_KEYS and INVALIDATION_PATTERNS
4. **Feature Hooks**: Implement for [specific features]
5. **Testing**: Add comprehensive test coverage

Use TypeScript, follow clean architecture, add error handling, and implement optimistic updates. Follow the exact patterns from the guide.
```

---

### **Feature-Specific Prompt**

```
Implement React Query patterns for the [FEATURE_NAME] feature following the guide above:

## Feature Requirements:
- **CRUD Operations**: Create, Read, Update, Delete
- **Optimistic Updates**: Instant UI updates with rollback
- **Error Handling**: User-friendly error messages
- **Caching**: Intelligent cache management
- **Testing**: Comprehensive test coverage

## Implementation Steps:
1. Create feature-specific hooks using standardized patterns
2. Define query keys for the feature
3. Implement CRUD operations with optimistic updates
4. Add error handling and user feedback
5. Write tests for all hooks
6. Update components to use new hooks

Follow the exact patterns from the guide and ensure type safety throughout.
```

---

### **useAsyncOperation Migration Prompt**

```
I need to migrate my project from useAsyncOperation to React Query patterns. My project currently uses custom useAsyncOperation hooks for data fetching, loading states, and error handling.

## Current useAsyncOperation Patterns:
- **Data Fetching**: useAsyncOperation(() => api.getData())
- **Manual Execution**: execute() function for triggering requests
- **Loading States**: loading boolean from useAsyncOperation
- **Error Handling**: error object from useAsyncOperation
- **Mutations**: useAsyncOperation for form submissions and updates

## Migration Requirements:
1. **Replace useAsyncOperation with React Query hooks**:
   - useAsyncOperation(() => api.getData()) → useStandardQuery(['data'], () => api.getData())
   - useAsyncOperation(async (params) => api.submit(params)) → useStandardMutation((params) => api.submit(params))

2. **Update Loading States**:
   - loading → isLoading
   - Remove manual useEffect for triggering requests

3. **Implement Automatic Fetching**:
   - Replace manual execute() calls with enabled conditions
   - Use refetch() for manual triggering when needed

4. **Add Optimistic Updates**:
   - Convert manual optimistic updates to useOptimisticMutation
   - Implement proper rollback mechanisms

5. **Update Error Handling**:
   - Replace custom error handling with React Query error patterns
   - Add toast notifications for user feedback

## Specific Migration Scenarios:
- **Search with Debouncing**: Convert manual debouncing to React Query staleTime
- **Dependent Queries**: Replace manual dependency management with enabled conditions
- **Form Submissions**: Convert useAsyncOperation mutations to useStandardMutation
- **Manual Refetching**: Replace execute() calls with refetch() or cache invalidation

## Expected Outcome:
- All useAsyncOperation hooks replaced with React Query equivalents
- Automatic caching and background refetching
- Optimistic updates with rollback capabilities
- Improved error handling and user feedback
- Reduced boilerplate code and manual state management

Please migrate each useAsyncOperation usage following the patterns from the migration guide above. Ensure type safety and maintain the same functionality while gaining React Query benefits.
```

---

**Use these prompts with your AI coding assistant to get the exact implementation you need!** 🎯
