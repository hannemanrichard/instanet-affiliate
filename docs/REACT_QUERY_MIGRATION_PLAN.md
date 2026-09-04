# 🚀 React Query Standardization Migration Plan

## 📊 Current State Analysis

### **Current Usage Statistics:**

- **useAsyncOperation**: 149 usages across 18 files
- **useQuery/useMutation**: 32 usages across 6 files
- **React Query Provider**: ✅ Already configured
- **Bundle Size**: React Query already included (13-16 kB)

### **Features Using useAsyncOperation:**

1. **Leads** - 13 usages
2. **Orders** - 27 usages
3. **Partners** - 16 usages
4. **Products** - 18 usages
5. **Parcels** - 10 usages
6. **Payouts** - 7 usages
7. **Order Items** - 5 usages

### **Features Already Using React Query:**

1. **Products Table** - useQuery for data fetching
2. **Product Details** - useQuery for individual products
3. **Add Item Sheet** - useMutation for creating items
4. **Active Balance** - useQuery for balance data
5. **Recent Payments** - useQuery for payment history
6. **Payouts** - Mixed usage (some React Query, some useAsyncOperation)

---

## 🎯 Migration Strategy

### **Phase 1: Foundation & Standards (Week 1-2)**

#### **1.1 Create Standardized React Query Hooks**

```typescript
// src/shared/hooks/useReactQuery.ts
export const useStandardQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    retry?: number;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    cacheTime: options?.cacheTime ?? 30 * 60 * 1000, // 30 minutes default
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 3,
    refetchOnWindowFocus: false,
  });
};

export const useStandardMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};
```

#### **1.2 Create Migration Utilities**

```typescript
// src/shared/utils/migrationHelpers.ts
export const createQueryKey = (feature: string, ...params: any[]) => {
  return [feature, ...params.filter(Boolean)];
};

export const createMutationOptions = (
  invalidateQueries: string[][],
  onSuccess?: (data: any) => void
) => ({
  onSuccess: (data: any) => {
    const queryClient = useQueryClient();
    invalidateQueries.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
    onSuccess?.(data);
  },
});
```

#### **1.3 Update React Query Provider Configuration**

```typescript
// src/shared/lib/providers/react-query.tsx
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
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

---

### **Phase 2: Feature-by-Feature Migration (Week 3-8)**

#### **2.1 Week 3: Leads Feature Migration**

**Files to Migrate:**

- `src/features/leads/application/useLeads.ts` (13 usages)
- `src/features/leads/application/useEnhancedLeads.ts` (1 usage)

**Migration Steps:**

```typescript
// Before (useAsyncOperation)
const getAllLeads = useAsyncOperation(
  leadsApplicationService.getAllLeads,
  "FETCH_LEADS_FAILED"
);

// After (React Query)
const useLeads = (partnerId?: number) => {
  return useStandardQuery(
    createQueryKey("leads", partnerId),
    () => leadsApplicationService.getAllLeads(),
    { enabled: !!partnerId }
  );
};

const useCreateLead = () => {
  return useStandardMutation(
    (data: CreateLeadRequest) => leadsApplicationService.createLead(data),
    {
      invalidateQueries: [["leads"]],
      onSuccess: () => {
        toast({ title: "Lead created successfully" });
      },
    }
  );
};
```

**Testing:**

- Update `src/features/leads/__tests__/application/useLeads.test.ts`
- Test query caching, invalidation, and error handling

#### **2.2 Week 4: Orders Feature Migration**

**Files to Migrate:**

- `src/features/orders/application/useOrders.ts` (27 usages)
- `src/features/orders/application/useOrderItems.ts` (5 usages)

**Migration Steps:**

```typescript
// Before
const getAllOrders = useAsyncOperation(
  ordersApplicationService.getAllOrders,
  "FETCH_ORDERS_FAILED"
);

// After
const useOrders = (partnerId?: number) => {
  return useStandardQuery(
    createQueryKey("orders", partnerId),
    () => ordersApplicationService.getAllOrders(),
    { enabled: !!partnerId }
  );
};

const useCreateOrder = () => {
  return useStandardMutation(
    (data: CreateOrderRequest) => ordersApplicationService.createOrder(data),
    {
      invalidateQueries: [["orders"], ["orders", "summary"]],
    }
  );
};
```

**Testing:**

- Update `src/features/orders/__tests__/application/useOrders.test.ts`
- Test order creation, updates, and status changes

#### **2.3 Week 5: Partners Feature Migration**

**Files to Migrate:**

- `src/features/partners/application/usePartners.ts` (16 usages)

**Migration Steps:**

```typescript
// Before
const getPartnerById = useAsyncOperation(
  partnerApplicationService.getPartnerById,
  "FETCH_PARTNER_FAILED"
);

// After
const usePartner = (partnerId: number) => {
  return useStandardQuery(
    createQueryKey("partner", partnerId),
    () => partnerApplicationService.getPartnerById(partnerId),
    { enabled: !!partnerId }
  );
};
```

**Testing:**

- Update `src/features/partners/__tests__/usePartners.test.ts`
- Test partner CRUD operations

#### **2.4 Week 6: Products Feature Migration**

**Files to Migrate:**

- `src/features/products/application/useProducts.ts` (18 usages)

**Migration Steps:**

```typescript
// Before
const getAllProducts = useAsyncOperation(
  productsApplicationService.getAllProducts,
  "FETCH_PRODUCTS_FAILED"
);

// After
const useProducts = () => {
  return useStandardQuery(createQueryKey("products"), () =>
    productsApplicationService.getAllProducts()
  );
};
```

**Testing:**

- Update `src/features/products/__tests__/application/useProducts.test.ts`
- Test product management operations

#### **2.5 Week 7: Parcels Feature Migration**

**Files to Migrate:**

- `src/features/parcels/application/useParcels.ts` (10 usages)

**Migration Steps:**

```typescript
// Before
const getAllParcels = useAsyncOperation(
  parcelsApplicationService.getAllParcels,
  "FETCH_PARCELS_FAILED"
);

// After
const useParcels = (partnerId?: number) => {
  return useStandardQuery(
    createQueryKey("parcels", partnerId),
    () => parcelsApplicationService.getAllParcels(),
    { enabled: !!partnerId }
  );
};
```

**Testing:**

- Update `src/features/parcels/__tests__/application/useParcels.test.ts`
- Test parcel tracking and management

#### **2.6 Week 8: Payouts Feature Migration**

**Files to Migrate:**

- `src/features/payouts/application/usePayouts.ts` (7 usages)

**Migration Steps:**

```typescript
// Before
const create = useAsyncOperation(async (request: CreatePayoutRequest) => {
  return createPayout.mutateAsync(request);
}, "PAYOUT_CREATION_FAILED");

// After
const useCreatePayout = () => {
  return useStandardMutation(
    (request: CreatePayoutRequest) =>
      payoutsApplicationService.createPayout(request),
    {
      invalidateQueries: [["payouts"], ["commissions"]],
    }
  );
};
```

**Testing:**

- Update payout-related tests
- Test commission and payout workflows

---

### **Phase 3: Component Updates (Week 9-10)**

#### **3.1 Update Presentation Components**

**Files to Update:**

- All components using `useAsyncOperation` hooks
- Update loading states, error handling, and data access patterns

**Migration Pattern:**

```typescript
// Before
const { data, isLoading, error, execute } = useAsyncOperation(
  service.getData,
  "FETCH_ERROR"
);

// After
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["data"],
  queryFn: service.getData,
});
```

#### **3.2 Update Error Handling**

**Before:**

```typescript
if (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

**After:**

```typescript
if (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

---

### **Phase 4: Cleanup & Optimization (Week 11-12)**

#### **4.1 Remove Custom Hooks**

- Delete `src/shared/hooks/useAsyncOperation.ts`
- Delete `src/shared/hooks/useEnhancedAsyncOperation.ts`
- Delete `src/shared/hooks/useEnhancedAsyncOperation.examples.ts`
- Delete `src/shared/hooks/useEnhancedAsyncOperation.test.ts`
- Delete `src/shared/hooks/EnhancedAsyncOperationDemo.tsx`
- Delete `src/shared/hooks/MIGRATION_GUIDE.md`
- Delete `src/shared/hooks/ENHANCEMENT_SUMMARY.md`

#### **4.2 Update Documentation**

- Update README with React Query patterns
- Create React Query best practices guide
- Update API documentation

#### **4.3 Performance Optimization**

- Implement query prefetching where appropriate
- Add optimistic updates for mutations
- Implement infinite queries for large datasets
- Add query deduplication strategies

---

## 📋 Migration Checklist

### **Pre-Migration**

- [ ] Backup current codebase
- [ ] Set up feature flags for gradual rollout
- [ ] Create migration branch
- [ ] Set up monitoring for performance impact

### **Phase 1: Foundation**

- [ ] Create standardized React Query hooks
- [ ] Update React Query provider configuration
- [ ] Create migration utilities
- [ ] Set up testing infrastructure

### **Phase 2: Feature Migration**

- [ ] Migrate Leads feature
- [ ] Migrate Orders feature
- [ ] Migrate Partners feature
- [ ] Migrate Products feature
- [ ] Migrate Parcels feature
- [ ] Migrate Payouts feature

### **Phase 3: Component Updates**

- [ ] Update all presentation components
- [ ] Update error handling patterns
- [ ] Update loading states
- [ ] Update data access patterns

### **Phase 4: Cleanup**

- [ ] Remove custom hooks
- [ ] Update documentation
- [ ] Performance optimization
- [ ] Final testing

---

## 🧪 Testing Strategy

### **Unit Tests**

- Test all new React Query hooks
- Test query key generation
- Test cache invalidation
- Test error handling

### **Integration Tests**

- Test feature workflows end-to-end
- Test data consistency across components
- Test performance improvements

### **E2E Tests**

- Test user workflows
- Test error scenarios
- Test loading states

---

## 📊 Success Metrics

### **Performance Metrics**

- Bundle size reduction: Target 3-5 kB reduction
- Initial load time: Target 10% improvement
- Data fetching performance: Target 20% improvement
- Cache hit rate: Target 80%+

### **Developer Experience**

- Reduced code complexity
- Better debugging experience
- Consistent patterns across features
- Improved TypeScript support

### **User Experience**

- Faster data loading
- Better offline handling
- Improved error recovery
- Smoother user interactions

---

## ⚠️ Risk Mitigation

### **Technical Risks**

- **Data inconsistency**: Implement proper cache invalidation
- **Performance regression**: Monitor bundle size and performance
- **Breaking changes**: Use feature flags for gradual rollout

### **Business Risks**

- **Development velocity**: Plan for 2-week slowdown during migration
- **User experience**: Test thoroughly before production deployment
- **Team productivity**: Provide training and documentation

---

## 🎯 Timeline Summary

| Phase       | Duration     | Key Deliverables                         |
| ----------- | ------------ | ---------------------------------------- |
| **Phase 1** | 2 weeks      | Foundation, standards, utilities         |
| **Phase 2** | 6 weeks      | Feature-by-feature migration             |
| **Phase 3** | 2 weeks      | Component updates                        |
| **Phase 4** | 2 weeks      | Cleanup and optimization                 |
| **Total**   | **12 weeks** | **Complete React Query standardization** |

---

## 🚀 Next Steps

1. **Review and approve** this migration plan
2. **Set up project tracking** (Jira/GitHub issues)
3. **Create migration branch** and begin Phase 1
4. **Schedule team training** on React Query patterns
5. **Set up monitoring** for performance tracking

---

## 📚 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Migration Examples](./examples/)
- [Team Training Materials](./training/)

---

_This migration plan ensures a systematic, low-risk transition to React Query while maintaining code quality and team productivity._
