# 🧪 React Query Migration Testing Guide

## 📋 Testing Strategy Overview

This guide provides comprehensive testing strategies for migrating from `useAsyncOperation` to React Query. The testing approach ensures data consistency, performance improvements, and maintains existing functionality.

---

## 🎯 Testing Phases

### **Phase 1: Unit Testing**

#### **1.1 Hook Testing**

**Test File Structure:**

```
src/features/[feature]/__tests__/application/
├── use[Feature]ReactQuery.test.ts
├── use[Feature]ReactQuery.integration.test.ts
└── use[Feature]ReactQuery.e2e.test.ts
```

**Example Test for Leads Hook:**

```typescript
// src/features/leads/__tests__/application/useLeadsReactQuery.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLeads, useCreateLead } from "../useLeadsReactQuery";
import { leadsApplicationService } from "../services/leadsApplicationService";

// Mock the application service
jest.mock("../services/leadsApplicationService");
const mockLeadsService = leadsApplicationService as jest.Mocked<typeof leadsApplicationService>;

// Create a test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useLeads React Query Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useLeads", () => {
    it("should fetch leads successfully", async () => {
      const mockLeads = [
        { id: 1, firstName: "John", lastName: "Doe" },
        { id: 2, firstName: "Jane", lastName: "Smith" },
      ];

      mockLeadsService.getAllLeads.mockResolvedValue(mockLeads);

      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockLeads);
      expect(mockLeadsService.getAllLeads).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch leads");
      mockLeadsService.getAllLeads.mockRejectedValue(error);

      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it("should cache data and not refetch on subsequent calls", async () => {
      const mockLeads = [{ id: 1, firstName: "John", lastName: "Doe" }];
      mockLeadsService.getAllLeads.mockResolvedValue(mockLeads);

      const { result: result1 } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Render the same hook again
      const { result: result2 } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Should only call the service once due to caching
      expect(mockLeadsService.getAllLeads).toHaveBeenCalledTimes(1);
    });
  });

  describe("useCreateLead", () => {
    it("should create lead successfully", async () => {
      const newLead = { id: 1, firstName: "John", lastName: "Doe" };
      const createRequest = { firstName: "John", lastName: "Doe", partnerId: 1 };

      mockLeadsService.createLead.mockResolvedValue(newLead);

      const { result } = renderHook(() => useCreateLead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newLead);
      expect(mockLeadsService.createLead).toHaveBeenCalledWith(createRequest);
    });

    it("should invalidate related queries after successful creation", async () => {
      const newLead = { id: 1, firstName: "John", lastName: "Doe" };
      const createRequest = { firstName: "John", lastName: "Doe", partnerId: 1 };

      mockLeadsService.createLead.mockResolvedValue(newLead);

      const { result } = renderHook(() => useCreateLead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify that related queries would be invalidated
      // This is tested through the query client behavior
    });
  });
});
```

#### **1.2 Cache Invalidation Testing**

```typescript
describe("Cache Invalidation", () => {
  it("should invalidate leads queries when creating a lead", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // Pre-populate cache
    queryClient.setQueryData(["leads"], [{ id: 1, name: "Existing Lead" }]);
    queryClient.setQueryData(["leads", "partner", 1], [{ id: 1, name: "Partner Lead" }]);

    const { result } = renderHook(() => useCreateLead(), { wrapper });

    const newLead = { id: 2, firstName: "New", lastName: "Lead" };
    mockLeadsService.createLead.mockResolvedValue(newLead);

    result.current.mutate({ firstName: "New", lastName: "Lead", partnerId: 1 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify cache invalidation
    expect(queryClient.getQueryState(["leads"])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["leads", "partner", 1])?.isInvalidated).toBe(true);
  });
});
```

---

### **Phase 2: Integration Testing**

#### **2.1 Feature Integration Tests**

```typescript
// src/features/leads/__tests__/application/useLeadsReactQuery.integration.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLeads, useCreateLead, useUpdateLead } from "../useLeadsReactQuery";

describe("Leads Feature Integration", () => {
  it("should handle complete CRUD workflow", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // 1. Fetch initial leads
    const { result: leadsResult } = renderHook(() => useLeads(), { wrapper });
    await waitFor(() => expect(leadsResult.current.isSuccess).toBe(true));

    // 2. Create a new lead
    const { result: createResult } = renderHook(() => useCreateLead(), { wrapper });
    const newLead = { firstName: "John", lastName: "Doe", partnerId: 1 };
    createResult.current.mutate(newLead);
    await waitFor(() => expect(createResult.current.isSuccess).toBe(true));

    // 3. Verify leads list is updated
    await waitFor(() => {
      expect(leadsResult.current.data).toContainEqual(
        expect.objectContaining({ firstName: "John", lastName: "Doe" })
      );
    });

    // 4. Update the lead
    const { result: updateResult } = renderHook(() => useUpdateLead(), { wrapper });
    const updatedLead = { firstName: "Johnny", lastName: "Doe" };
    updateResult.current.mutate({ id: 1, data: updatedLead });
    await waitFor(() => expect(updateResult.current.isSuccess).toBe(true));

    // 5. Verify the update is reflected
    await waitFor(() => {
      expect(leadsResult.current.data).toContainEqual(
        expect.objectContaining({ firstName: "Johnny", lastName: "Doe" })
      );
    });
  });
});
```

#### **2.2 Cross-Feature Integration Tests**

```typescript
// src/features/__tests__/integration/crossFeature.test.ts
describe("Cross-Feature Integration", () => {
  it("should handle lead-to-order conversion workflow", async () => {
    // Test the complete workflow from lead creation to order conversion
    // This ensures that cache invalidation works across features
  });

  it("should handle partner-lead relationship updates", async () => {
    // Test that updating a partner invalidates related lead queries
  });
});
```

---

### **Phase 3: Performance Testing**

#### **3.1 Bundle Size Testing**

```typescript
// scripts/test-bundle-size.js
const { execSync } = require("child_process");
const fs = require("fs");

describe("Bundle Size Analysis", () => {
  it("should not increase bundle size significantly", () => {
    // Build the application
    execSync("npm run build", { stdio: "inherit" });

    // Analyze bundle size
    const bundleStats = JSON.parse(
      fs.readFileSync(".next/analyze/client.json", "utf8")
    );

    // Check that React Query doesn't add more than expected
    const reactQuerySize = bundleStats.chunks.find((chunk) =>
      chunk.names.includes("react-query")
    )?.size;

    expect(reactQuerySize).toBeLessThan(20000); // 20KB limit
  });
});
```

#### **3.2 Performance Benchmarks**

```typescript
// src/__tests__/performance/queryPerformance.test.ts
describe("Query Performance", () => {
  it("should cache queries efficiently", async () => {
    const startTime = performance.now();

    // First query
    const { result: result1 } = renderHook(() => useLeads(), { wrapper });
    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const firstQueryTime = performance.now() - startTime;

    // Second query (should be cached)
    const secondStartTime = performance.now();
    const { result: result2 } = renderHook(() => useLeads(), { wrapper });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    const secondQueryTime = performance.now() - secondStartTime;

    // Second query should be significantly faster
    expect(secondQueryTime).toBeLessThan(firstQueryTime * 0.1);
  });
});
```

---

### **Phase 4: E2E Testing**

#### **4.1 User Workflow Testing**

```typescript
// cypress/e2e/leads-workflow.cy.ts
describe("Leads Workflow", () => {
  it("should complete lead creation workflow", () => {
    cy.visit("/leads");

    // Wait for leads to load
    cy.get('[data-testid="leads-table"]').should("be.visible");

    // Create a new lead
    cy.get('[data-testid="create-lead-button"]').click();
    cy.get('[data-testid="lead-form"]').should("be.visible");

    // Fill form
    cy.get('[data-testid="first-name-input"]').type("John");
    cy.get('[data-testid="last-name-input"]').type("Doe");
    cy.get('[data-testid="submit-button"]').click();

    // Verify success
    cy.get('[data-testid="success-toast"]').should("be.visible");
    cy.get('[data-testid="leads-table"]').should("contain", "John Doe");
  });
});
```

#### **4.2 Error Handling Testing**

```typescript
describe("Error Handling", () => {
  it("should handle network errors gracefully", () => {
    // Mock network failure
    cy.intercept("GET", "/api/leads", { forceNetworkError: true });

    cy.visit("/leads");

    // Should show error state
    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="retry-button"]').should("be.visible");
  });
});
```

---

## 🔧 Testing Utilities

### **Test Helpers**

```typescript
// src/shared/utils/testHelpers.ts
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const createTestWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};

export const waitForQueryToSettle = async (queryClient: QueryClient) => {
  await queryClient.getQueryCache().clear();
  await new Promise(resolve => setTimeout(resolve, 0));
};
```

### **Mock Utilities**

```typescript
// src/shared/utils/mockHelpers.ts
export const createMockService = <T>(methods: Partial<T>) => {
  return methods as T;
};

export const createMockQueryData = <T>(data: T) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: true,
  isFetching: false,
  isStale: false,
  refetch: jest.fn(),
});
```

---

## 📊 Testing Checklist

### **Pre-Migration Testing**

- [ ] Current functionality works as expected
- [ ] Performance baselines established
- [ ] Bundle size baseline recorded
- [ ] Test coverage baseline measured

### **During Migration Testing**

- [ ] Unit tests pass for new React Query hooks
- [ ] Integration tests pass for feature workflows
- [ ] Cache invalidation works correctly
- [ ] Error handling works as expected
- [ ] Loading states work correctly
- [ ] Performance improvements verified

### **Post-Migration Testing**

- [ ] All existing functionality works
- [ ] Performance improvements achieved
- [ ] Bundle size within acceptable limits
- [ ] Test coverage maintained or improved
- [ ] E2E tests pass
- [ ] User acceptance testing completed

---

## 🚨 Common Testing Issues & Solutions

### **Issue 1: Cache Not Invalidating**

**Problem:** Queries not updating after mutations
**Solution:** Verify `invalidateQueries` configuration and query key matching

### **Issue 2: Tests Hanging**

**Problem:** Tests waiting indefinitely for queries
**Solution:** Use `retry: false` in test query client configuration

### **Issue 3: Stale Data in Tests**

**Problem:** Tests seeing cached data from previous tests
**Solution:** Clear query cache between tests using `queryClient.clear()`

### **Issue 4: Mock Not Working**

**Problem:** Service mocks not being called
**Solution:** Ensure mocks are set up before hook rendering and use `jest.clearAllMocks()`

---

## 📈 Success Metrics

### **Performance Metrics**

- [ ] Query response time improved by 20%+
- [ ] Cache hit rate > 80%
- [ ] Bundle size increase < 5KB
- [ ] Memory usage optimized

### **Quality Metrics**

- [ ] Test coverage maintained at 90%+
- [ ] All E2E tests passing
- [ ] Zero regression bugs
- [ ] User satisfaction maintained

### **Developer Experience**

- [ ] Consistent patterns across features
- [ ] Better debugging experience
- [ ] Reduced code complexity
- [ ] Improved TypeScript support

---

_This testing guide ensures a thorough validation of the React Query migration while maintaining code quality and user experience._
