# 🏗️ Referio Platform Refactoring Plan

## 📊 Project Assessment Summary

**Overall Rating: 6.5/10**

Your affiliate marketing platform demonstrates solid architectural foundations with clean architecture patterns, but requires immediate attention to testing infrastructure and component organization for production readiness.

### Current State Metrics

- **Test Coverage**: 84% passing (231/276 tests)
- **Architecture**: 7/10 (good patterns, poor organization)
- **Code Quality**: 8/10 (consistent, well-typed)
- **Performance**: 6/10 (no caching strategy)
- **Maintainability**: 5/10 (mixed organization)

### Target State Metrics (Post-Refactoring)

- **Test Coverage**: 95%+ passing
- **Architecture**: 9/10
- **Code Quality**: 9/10
- **Performance**: 8/10
- **Maintainability**: 9/10

---

## 🎯 Project Strengths

### ✅ Architecture Excellence

- **Clean Architecture Implementation**: Well-structured domain-driven design with proper separation of concerns
- **Feature-Based Organization**: Each feature (leads, orders, products, partners, payouts) follows consistent patterns
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Supabase, Clerk, React Query, TailwindCSS
- **Comprehensive Testing**: 276 tests with good coverage patterns

### ✅ Code Quality

- **Consistent Data Layer**: All services follow the same patterns with `DatabaseWrapper` and `withPerformanceTracking`
- **Error Handling**: Sophisticated error handling system with `ErrorHandlerFactory`
- **Type Safety**: Strong TypeScript implementation with proper entity definitions
- **UI Components**: Well-structured shadcn/ui components with consistent styling

---

## 🚨 Critical Issues Requiring Immediate Attention

### 🔴 1. Test Infrastructure Crisis (Priority: CRITICAL)

**Current State**: 45/276 tests failing (16% failure rate)
**Root Cause**: Missing QueryClient provider in test setup

```
No QueryClient set, use QueryClientProvider to set one
```

**Impact**:

- Cannot deploy with confidence
- CI/CD pipeline likely broken
- No reliable regression testing

### 🔴 2. Component Organization Chaos (Priority: HIGH)

**Current State**: Mixed component organization violating clean architecture
**Issues**:

- Feature components scattered in `src/components/` instead of feature presentation layers
- Duplicate navigation components (`sidebar.tsx`, `affiliate-sidebar.tsx`, `main-nav.tsx`)
- UI components mixed with business logic components

### 🔴 3. Data Layer Inconsistencies (Priority: HIGH)

**Issues**:

- Inconsistent entity mapping patterns across features
- Mixed use of database types vs domain entities
- Some services lack proper error handling standardization

---

## 📋 Detailed Refactoring Plan

## Phase 1: Critical Fixes (Week 1)

### 1.1 Fix Test Infrastructure

**Duration**: 2 hours
**Priority**: CRITICAL

#### Task 1.1.1: Update Jest Setup

```typescript
// jest.setup.ts - Add QueryClient provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### Task 1.1.2: Update Test Files

```typescript
// Example: src/features/leads/__tests__/application/useLeads.test.ts
import { renderHook } from "@/shared/lib/test-utils"; // Updated import
import { useLeads } from "../useLeads";

describe("useLeads", () => {
  it("should fetch leads successfully", async () => {
    const { result } = renderHook(() => useLeads());
    // Test implementation
  });
});
```

**Expected Outcome**: 95%+ test pass rate

### 1.2 Component Reorganization

**Duration**: 8 hours
**Priority**: HIGH

#### Task 1.2.1: Move Feature Components

```bash
# Create new directory structure
mkdir -p src/features/leads/presentation/components/forms/sections
mkdir -p src/features/orders/presentation/components
mkdir -p src/features/products/presentation/components
mkdir -p src/features/partners/presentation/components
mkdir -p src/features/payouts/presentation/components
```

#### Task 1.2.2: Component Migration Map

```
FROM: src/components/leads/          TO: src/features/leads/presentation/components/
FROM: src/components/orders/         TO: src/features/orders/presentation/components/
FROM: src/components/products/       TO: src/features/products/presentation/components/
FROM: src/components/partners/       TO: src/features/partners/presentation/components/
FROM: src/components/payouts/        TO: src/features/payouts/presentation/components/
```

#### Task 1.2.3: Shared Components Organization

```
src/shared/components/
├── layout/
│   ├── AppSidebar.tsx
│   ├── TopNav.tsx
│   ├── UserNav.tsx
│   └── ThemeToggle.tsx
├── auth/
│   ├── RoleGuard.tsx
│   └── SignOutButton.tsx
├── forms/
│   ├── ProfileForm.tsx
│   └── SettingsForm.tsx
├── dashboard/
│   └── PartnerDashboard.tsx
├── shells/
│   └── Shell.tsx
└── ui/ (existing UI components)
```

**Expected Outcome**: Clean separation of concerns, improved maintainability

### 1.3 Resolve Failing Tests

**Duration**: 4 hours
**Priority**: HIGH

#### Task 1.3.1: Fix React Query Tests

- Update all hook tests to use proper QueryClient provider
- Mock external dependencies properly
- Ensure consistent test patterns

#### Task 1.3.2: Fix Component Tests

- Update import paths after component reorganization
- Fix broken component references
- Ensure proper test isolation

**Expected Outcome**: 95%+ test pass rate

---

## Phase 2: Architecture Improvements (Week 2-3)

### 2.1 Standardize Entity Mapping

**Duration**: 6 hours
**Priority**: HIGH

#### Task 2.1.1: Create Entity Mapper Utility

```typescript
// src/shared/utils/entityMapper.ts
export class EntityMapper {
  static mapDatabaseToEntity<T, U>(dbRow: T, mapper: (row: T) => U): U {
    return mapper(dbRow);
  }

  static mapDatabaseArrayToEntities<T, U>(
    dbRows: T[],
    mapper: (row: T) => U
  ): U[] {
    return dbRows.map(mapper);
  }

  static createMapper<T, U>(mappingFn: (row: T) => U): (row: T) => U {
    return mappingFn;
  }
}
```

#### Task 2.1.2: Standardize All Entity Mappings

```typescript
// Example: src/features/leads/data/leadsService.ts
import { EntityMapper } from "@/shared/utils/entityMapper";

export class SupabaseLeadsService implements LeadRepository {
  private readonly mapToLeadEntity = EntityMapper.createMapper<
    DatabaseLead,
    LeadEntity
  >((row) => ({
    id: row.id,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    phone: row.phone || undefined,
    // ... other mappings
  }));

  async getAllLeads(): Promise<LeadEntity[]> {
    return withPerformanceTracking("LeadService", "getAllLeads", async () => {
      const leads = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .order("created_at", { ascending: false });
          return { data, error };
        },
        { operation: "getAllLeads", table: this.tableName }
      );

      return EntityMapper.mapDatabaseArrayToEntities(
        leads,
        this.mapToLeadEntity
      );
    });
  }
}
```

**Expected Outcome**: Consistent entity mapping across all features

### 2.2 Implement Repository Pattern Consistency

**Duration**: 8 hours
**Priority**: MEDIUM

#### Task 2.2.1: Create Base Repository Interface

```typescript
// src/shared/types/baseRepository.ts
export interface BaseRepository<T, CreateRequest, UpdateRequest> {
  getAll(): Promise<T[]>;
  getById(id: string | number): Promise<T | null>;
  create(data: CreateRequest): Promise<T>;
  update(id: string | number, data: UpdateRequest): Promise<T>;
  delete(id: string | number): Promise<void>;
}

export interface BaseService<T, CreateRequest, UpdateRequest> {
  getAll(): Promise<T[]>;
  getById(id: string | number): Promise<T | null>;
  create(data: CreateRequest): Promise<T>;
  update(id: string | number, data: UpdateRequest): Promise<T>;
  delete(id: string | number): Promise<void>;
}
```

#### Task 2.2.2: Implement Base Repository Class

```typescript
// src/shared/core/baseRepository.ts
export abstract class BaseRepository<T, CreateRequest, UpdateRequest> {
  protected abstract tableName: string;
  protected abstract mapToEntity: (row: any) => T;

  async getAll(): Promise<T[]> {
    return withPerformanceTracking(
      this.constructor.name,
      "getAll",
      async () => {
        const items = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .order("created_at", { ascending: false });
            return { data, error };
          },
          { operation: "getAll", table: this.tableName }
        );

        return items.map(this.mapToEntity);
      }
    );
  }

  // Implement other CRUD operations...
}
```

**Expected Outcome**: Consistent repository patterns across all features

### 2.3 Add Proper Error Boundaries

**Duration**: 4 hours
**Priority**: MEDIUM

#### Task 2.3.1: Create Feature Error Boundaries

```typescript
// src/shared/components/ErrorBoundary.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2"
          >
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

#### Task 2.3.2: Implement Feature-Specific Error Boundaries

```typescript
// src/features/leads/presentation/components/LeadErrorBoundary.tsx
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

const LeadErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-semibold">Lead Management Error</h3>
    <p className="text-red-600 mt-2">{error.message}</p>
    <button
      onClick={resetError}
      className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Reload Lead Management
    </button>
  </div>
);

export const LeadErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary fallback={LeadErrorFallback}>
    {children}
  </ErrorBoundary>
);
```

**Expected Outcome**: Graceful error handling across all features

---

## Phase 3: Performance & UX Enhancements (Week 4)

### 3.1 Implement Caching Strategy

**Duration**: 6 hours
**Priority**: MEDIUM

#### Task 3.1.1: Enhanced React Query Configuration

```typescript
// src/shared/lib/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

#### Task 3.1.2: Implement Query Key Factory

```typescript
// src/shared/utils/queryKeys.ts
export const queryKeys = {
  leads: {
    all: ["leads"] as const,
    lists: () => [...queryKeys.leads.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.leads.lists(), { filters }] as const,
    details: () => [...queryKeys.leads.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.leads.details(), id] as const,
  },
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    inventory: (productId: number) =>
      [...queryKeys.products.detail(productId), "inventory"] as const,
  },
} as const;
```

**Expected Outcome**: Improved performance and user experience

### 3.2 Add Loading States & Skeleton Components

**Duration**: 4 hours
**Priority**: MEDIUM

#### Task 3.2.1: Create Skeleton Components

```typescript
// src/shared/components/ui/skeleton.tsx
import { cn } from '@/shared/utils/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

// src/shared/components/ui/table-skeleton.tsx
import { Skeleton } from './skeleton';

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
```

#### Task 3.2.2: Implement Loading States

```typescript
// src/features/leads/presentation/components/LeadsTable.tsx
import { TableSkeleton } from '@/shared/components/ui/table-skeleton';

export function LeadsTable() {
  const { data: leads, isLoading, error } = useLeads();

  if (isLoading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  if (error) {
    return <div>Error loading leads: {error.message}</div>;
  }

  // Rest of component...
}
```

**Expected Outcome**: Better user experience with loading states

### 3.3 Optimize Bundle Size

**Duration**: 4 hours
**Priority**: LOW

#### Task 3.3.1: Implement Code Splitting

```typescript
// src/app/(dashboard)/leads/page.tsx
import { lazy, Suspense } from 'react';
import { TableSkeleton } from '@/shared/components/ui/table-skeleton';

const LeadsTable = lazy(() => import('@/features/leads/presentation/components/LeadsTable'));

export default function LeadsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Leads Management</h1>
      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <LeadsTable />
      </Suspense>
    </div>
  );
}
```

#### Task 3.3.2: Bundle Analysis

```bash
# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

**Expected Outcome**: Reduced bundle size and faster initial load

---

## Phase 4: Documentation & Monitoring (Week 5)

### 4.1 Add Comprehensive Documentation

**Duration**: 8 hours
**Priority**: MEDIUM

#### Task 4.1.1: Architecture Documentation

```markdown
# docs/ARCHITECTURE.md

# docs/API.md

# docs/DEPLOYMENT.md

# docs/DEVELOPMENT.md
```

#### Task 4.1.2: Component Documentation

````typescript
// Example component with JSDoc
/**
 * LeadsTable component for displaying and managing leads
 *
 * @component
 * @example
 * ```tsx
 * <LeadsTable
 *   onLeadSelect={(lead) => console.log(lead)}
 *   filters={{ status: 'active' }}
 * />
 * ```
 */
export function LeadsTable({ onLeadSelect, filters }: LeadsTableProps) {
  // Component implementation
}
````

**Expected Outcome**: Comprehensive documentation for maintainability

### 4.2 Implement Monitoring & Logging

**Duration**: 6 hours
**Priority**: MEDIUM

#### Task 4.2.1: Error Tracking

```typescript
// src/shared/utils/errorTracker.ts
export class ErrorTracker {
  static trackError(error: Error, context?: Record<string, any>) {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    console.error("Error tracked:", error, context);
  }

  static trackPerformance(operation: string, duration: number) {
    // Send to analytics service
    console.log(`Performance: ${operation} took ${duration}ms`);
  }
}
```

#### Task 4.2.2: Performance Monitoring

```typescript
// src/shared/utils/performanceMonitor.ts (enhanced)
export const withPerformanceTracking = async <T>(
  service: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    ErrorTracker.trackPerformance(`${service}.${method}`, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    ErrorTracker.trackError(error as Error, {
      service,
      method,
      duration,
    });
    throw error;
  }
};
```

**Expected Outcome**: Production-ready monitoring and error tracking

---

## 📊 Success Metrics

### Phase 1 Success Criteria

- [ ] 95%+ test pass rate (currently 84%)
- [ ] All feature components properly organized
- [ ] No failing tests in CI/CD pipeline

### Phase 2 Success Criteria

- [ ] Consistent entity mapping across all features
- [ ] Standardized repository patterns
- [ ] Error boundaries implemented for all features

### Phase 3 Success Criteria

- [ ] Improved loading performance (target: <2s initial load)
- [ ] Reduced bundle size (target: <500KB initial bundle)
- [ ] Better user experience with loading states

### Phase 4 Success Criteria

- [ ] Comprehensive documentation
- [ ] Error tracking implemented
- [ ] Performance monitoring in place

---

## 🚀 Quick Wins (Can be done immediately)

### Quick Win 1: Fix Test Setup (2 hours)

```bash
# Update jest.setup.ts with QueryClient provider
# Expected impact: 95%+ test pass rate
```

### Quick Win 2: Move Components (4 hours)

```bash
# Reorganize component structure
# Expected impact: 2-3 point improvement in maintainability
```

### Quick Win 3: Add Error Boundaries (3 hours)

```bash
# Implement feature-specific error boundaries
# Expected impact: Better error handling and user experience
```

### Quick Win 4: Implement Caching (4 hours)

```bash
# Add React Query caching strategy
# Expected impact: Improved performance and user experience
```

**Total Quick Win Impact**: 13 hours → 2-3 point improvement in overall rating

---

## 🔍 Long-term Recommendations

### 1. Micro-frontend Architecture

Consider splitting into smaller, deployable units:

- Partner Portal
- Admin Dashboard
- Public Website
- Mobile App

### 2. API Gateway Implementation

Implement proper API layer abstraction:

- Rate limiting
- Authentication/Authorization
- Request/Response transformation
- Caching layer

### 3. Real-time Features

Add WebSocket support for live updates:

- Live order tracking
- Real-time notifications
- Collaborative features

### 4. Mobile Application

React Native implementation for partners:

- Lead management on mobile
- Order tracking
- Push notifications

### 5. Analytics Dashboard

Comprehensive business intelligence features:

- Partner performance metrics
- Revenue analytics
- Lead conversion tracking
- Custom reporting

---

## 📅 Timeline Summary

| Phase   | Duration | Key Deliverables                     | Success Criteria     |
| ------- | -------- | ------------------------------------ | -------------------- |
| Phase 1 | Week 1   | Test fixes, Component reorganization | 95%+ test pass rate  |
| Phase 2 | Week 2-3 | Architecture improvements            | Consistent patterns  |
| Phase 3 | Week 4   | Performance & UX enhancements        | Improved performance |
| Phase 4 | Week 5   | Documentation & Monitoring           | Production ready     |

**Total Duration**: 5 weeks
**Expected Outcome**: Production-ready, enterprise-grade affiliate marketing platform

---

## 🎯 Conclusion

Your Referio platform has excellent architectural foundations but needs immediate attention to testing and organization. With focused effort over 5 weeks, this can become a production-ready, enterprise-grade affiliate marketing platform.

The refactoring plan addresses critical issues while building upon existing strengths, ensuring a smooth transition to a more maintainable and scalable codebase.
