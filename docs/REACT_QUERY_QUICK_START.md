# 🚀 React Query Migration Quick Start Guide

## 📋 Overview

This guide provides a quick start for migrating from `useAsyncOperation` to React Query. Follow these steps to begin the migration process.

---

## 🎯 Phase 1: Setup (Day 1-2)

### **Step 1: Install Dependencies**

```bash
# React Query is already installed, but ensure you have the latest version
npm install @tanstack/react-query@latest @tanstack/react-query-devtools@latest
```

### **Step 2: Update React Query Provider**

```typescript
// src/shared/lib/providers/react-query.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

### **Step 3: Create Standardized Hooks**

```bash
# Copy the standardized hooks
cp src/shared/hooks/useReactQuery.ts .
cp src/shared/utils/migrationHelpers.ts .
```

---

## 🔄 Phase 2: Migrate One Feature (Day 3-5)

### **Step 1: Choose a Simple Feature**

Start with the **Leads** feature as it's well-contained and has clear CRUD operations.

### **Step 2: Create New React Query Hooks**

```typescript
// src/features/leads/application/useLeadsReactQuery.ts
import {
  useStandardQuery,
  useStandardMutation,
} from "@/shared/hooks/useReactQuery";
import {
  QUERY_KEYS,
  INVALIDATION_PATTERNS,
} from "@/shared/utils/migrationHelpers";
import { leadsApplicationService } from "./services/leadsApplicationService";

export const useLeads = () => {
  return useStandardQuery(QUERY_KEYS.LEADS, () =>
    leadsApplicationService.getAllLeads()
  );
};

export const useCreateLead = () => {
  return useStandardMutation(
    (data: CreateLeadRequest) => leadsApplicationService.createLead(data),
    {
      invalidateQueries: INVALIDATION_PATTERNS.LEAD_CHANGES(data.partnerId),
      successMessage: "Lead created successfully",
    }
  );
};
```

### **Step 3: Update Components**

```typescript
// Before (useAsyncOperation)
const { data, isLoading, error, execute } = useAsyncOperation(
  leadsApplicationService.getAllLeads,
  "FETCH_LEADS_FAILED"
);

// After (React Query)
const { data, isLoading, error, refetch } = useLeads();
```

### **Step 4: Test the Migration**

```bash
# Run tests for the migrated feature
npm test -- --testPathPattern=leads
```

---

## 📊 Phase 3: Validate & Iterate (Day 6-7)

### **Step 1: Performance Testing**

```bash
# Build and analyze bundle size
npm run build
npm run analyze
```

### **Step 2: User Testing**

- Test the migrated feature in development
- Verify all functionality works as expected
- Check for any performance improvements

### **Step 3: Document Learnings**

- Note any issues encountered
- Document best practices discovered
- Update migration patterns for other features

---

## 🔄 Phase 4: Scale Migration (Week 2-12)

### **Migration Order (Recommended)**

1. **Leads** (Week 2) - Simple CRUD operations
2. **Partners** (Week 3) - User management
3. **Products** (Week 4) - Product catalog
4. **Orders** (Week 5-6) - Complex business logic
5. **Parcels** (Week 7) - Tracking functionality
6. **Payouts** (Week 8) - Financial operations

### **Weekly Checklist**

- [ ] Migrate one feature completely
- [ ] Update all related components
- [ ] Run comprehensive tests
- [ ] Performance validation
- [ ] Documentation update

---

## 🛠️ Common Migration Patterns

### **Pattern 1: Simple Data Fetching**

```typescript
// Before
const { data, isLoading, error, execute } = useAsyncOperation(
  service.getData,
  "FETCH_ERROR"
);

// After
const { data, isLoading, error, refetch } = useStandardQuery(
  ["data"],
  service.getData
);
```

### **Pattern 2: Mutations with Cache Invalidation**

```typescript
// Before
const { execute, isLoading, error } = useAsyncOperation(
  service.createItem,
  "CREATE_ERROR"
);

// After
const { mutate, isPending, error } = useStandardMutation(service.createItem, {
  invalidateQueries: [["items"]],
  successMessage: "Item created successfully",
});
```

### **Pattern 3: Conditional Queries**

```typescript
// Before
const { data, isLoading, error, execute } = useAsyncOperation(
  service.getData,
  "FETCH_ERROR"
);

// After
const { data, isLoading, error } = useStandardQuery(
  ["data", id],
  () => service.getData(id),
  { enabled: !!id }
);
```

---

## 🧪 Testing Quick Start

### **Unit Test Template**

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLeads } from "../useLeadsReactQuery";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useLeads", () => {
  it("should fetch leads successfully", async () => {
    const { result } = renderHook(() => useLeads(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

---

## 🚨 Troubleshooting

### **Issue 1: "useQuery must be used within a QueryClient"**

**Solution:** Ensure your component is wrapped with `QueryClientProvider`

### **Issue 2: Queries not updating after mutations**

**Solution:** Check `invalidateQueries` configuration in mutation options

### **Issue 3: Tests failing with React Query**

**Solution:** Use `retry: false` in test query client configuration

### **Issue 4: Bundle size increased significantly**

**Solution:** Check for duplicate React Query installations or unused imports

---

## 📈 Success Metrics

### **Week 1 Goals**

- [ ] React Query provider configured
- [ ] Standardized hooks created
- [ ] One feature migrated and tested
- [ ] Performance baseline established

### **Week 2 Goals**

- [ ] Leads feature fully migrated
- [ ] All tests passing
- [ ] Performance improvements verified
- [ ] Migration patterns documented

### **Monthly Goals**

- [ ] 4 features migrated per month
- [ ] Bundle size optimized
- [ ] Performance improvements maintained
- [ ] Team trained on React Query patterns

---

## 📚 Resources

### **Documentation**

- [React Query Docs](https://tanstack.com/query/latest)
- [Migration Plan](./REACT_QUERY_MIGRATION_PLAN.md)
- [Testing Guide](./REACT_QUERY_TESTING_GUIDE.md)

### **Examples**

- [Leads Migration Example](./src/features/leads/application/useLeadsReactQuery.ts)
- [Standardized Hooks](./src/shared/hooks/useReactQuery.ts)
- [Migration Helpers](./src/shared/utils/migrationHelpers.ts)

### **Support**

- Team Slack channel: #react-query-migration
- Weekly migration sync meetings
- Code review process for migration PRs

---

## 🎯 Next Steps

1. **Review this guide** with your team
2. **Set up the foundation** (Phase 1)
3. **Start with Leads migration** (Phase 2)
4. **Validate and iterate** (Phase 3)
5. **Scale to other features** (Phase 4)

---

_Remember: Start small, validate early, and iterate quickly. The migration is a marathon, not a sprint!_ 🏃‍♂️
