# Feature Testing Implementation Guide

This guide provides a step-by-step approach to implementing comprehensive test coverage for any feature in the Referio platform, following proven patterns from cart, reviews, payouts, and orders tests.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Process](#step-by-step-process)
4. [File Structure](#file-structure)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Each feature follows a clean architecture pattern with:
- **Data Layer**: Database interactions (Supabase services)
- **Domain Layer**: Entities, errors, repositories
- **Application Layer**: Business logic and validation
- **Presentation Layer**: React hooks for UI integration

Our test strategy mirrors this structure with tests at each layer.

---

## Prerequisites

Before starting, ensure you have:
- Access to the feature's domain entities (`entities.ts`)
- Access to error definitions (`errors.ts`)
- Access to repository interfaces (`repositories.ts`)
- Access to data services in the `data/` folder
- Access to application service in `application/services/`
- Access to React hooks in `application/`

---

## Step-by-Step Process

### Step 1: Understand the Feature Structure

**Action**: Read the feature's architecture files to understand the domain.

```bash
# Examine the feature directory
ls src/features/[feature-name]/

# Read these key files:
1. domain/entities.ts        # Domain entities and types
2. domain/errors.ts          # Error codes and classes
3. domain/repositories.ts    # Repository interfaces
4. data/*.ts                 # Data services (database layer)
5. application/services/*.ts # Application services (business logic)
6. application/use*.ts       # React hooks
```

**Example Structure**:
```
features/
  orders/
    domain/
      ├── entities.ts       # OrderEntity, OrderItemEntity
      ├── errors.ts         # OrderErrorCodes
      └── repositories.ts   # OrdersRepository
    data/
      ├── ordersService.ts       # SupabaseOrdersService
      └── orderItemService.ts    # SupabaseOrderItemService
    application/
      ├── services/
      │   └── ordersApplicationService.ts
      └── useOrders.ts
    __tests__/
      data/
        ├── ordersService.test.ts
        └── orderItemService.test.ts
      application/
        ├── ordersApplicationService.test.ts
        └── useOrders.test.ts
```

**Deliverable**: Understanding of all entities, their relationships, and service methods.

---

### Step 2: Create the Test Directory Structure

**Action**: Create the test directory structure matching the feature structure.

```bash
mkdir -p src/features/[feature-name]/__tests__/data
mkdir -p src/features/[feature-name]/__tests__/application
```

**Directory Purpose**:
- `__tests__/data/` - Tests for data layer services (database interactions)
- `__tests__/application/` - Tests for application services and React hooks

---

### Step 3: Create Data Layer Tests

**Priority**: Start with data layer tests as they form the foundation.

#### 3.1 Read the Service Implementation

**Action**: Read the data service file to understand:
- Methods available
- Database operations used
- Error handling patterns
- Usage of `crypto.randomUUID()` or similar

**Key Questions**:
1. What Supabase table is being used?
2. Does the service use `crypto.randomUUID()` for IDs?
3. Are there dependencies on other services?
4. What error scenarios are handled?

#### 3.2 Set Up Base Test Template

**Action**: Create the test file with proper mocks.

**Template**:
```typescript
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { Supabase[ServiceName]Service } from "../../data/[serviceName]Service";

// Mock dependencies
jest.mock("@/shared/utils/databaseWrapper");
jest.mock("@/shared/utils/performanceMonitor");
jest.mock("../../data/[dependentService]", () => ({
  [dependentService]: {
    [method]: jest.fn(),
  },
}));
jest.mock("@/infrastructure/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            order: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          order: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

const mockDatabaseWrapper = DatabaseWrapper as jest.Mocked<
  typeof DatabaseWrapper
>;
const mockWithPerformanceTracking =
  withPerformanceTracking as jest.MockedFunction<
    typeof withPerformanceTracking
  >;

describe("Supabase[ServiceName]Service", () => {
  let service: Supabase[ServiceName]Service;

  beforeEach(() => {
    // CRITICAL: Mock crypto.randomUUID if used
    Object.defineProperty(global, "crypto", {
      value: {
        randomUUID: jest.fn(() => "test-uuid-1234"),
      },
      writable: true,
      configurable: true,
    });

    service = new Supabase[ServiceName]Service();
    jest.clearAllMocks();

    // Mock withPerformanceTracking to execute function directly
    mockWithPerformanceTracking.mockImplementation(
      async (service, method, fn) => await fn()
    );

    // Mock DatabaseWrapper to return data directly
    mockDatabaseWrapper.executeQuery.mockImplementation(async (fn) => {
      const result = await fn();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    });

    mockDatabaseWrapper.executeMutation.mockImplementation(async (fn) => {
      const result = await fn();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    });
  });

  // Tests go here
});
```

#### 3.3 Implement Test Methods

**Action**: Create tests for each service method following this pattern:

**For Read Operations** (getById, getAll, etc.):
```typescript
describe("getById", () => {
  it("should return an entity by id", async () => {
    const mockEntity = {
      id: "entity-1",
      // ... other fields
    };

    mockDatabaseWrapper.executeQuery.mockResolvedValue(mockEntity);

    const result = await service.getById("entity-1");

    expect(result).toEqual(mockEntity);
  });

  it("should return null when entity not found", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue(null);

    const result = await service.getById("non-existent");

    expect(result).toBeNull();
  });

  it("should handle errors when fetching entity", async () => {
    const error = new Error("Database error");
    mockDatabaseWrapper.executeQuery.mockRejectedValue(error);

    await expect(service.getById("entity-1")).rejects.toThrow("Database error");
  });
});
```

**For Create Operations**:
```typescript
describe("create", () => {
  it("should create a new entity successfully", async () => {
    const mockNewEntity = {
      id: "entity-1",
      // ... other fields
      created_at: null, // Add if entity has created_at
      updated_at: null, // Add if entity has updated_at
    };

    mockDatabaseWrapper.executeMutation.mockResolvedValue(mockNewEntity);

    const entityToCreate = {
      // ... fields without id/timestamps
    };

    const result = await service.create(entityToCreate);

    expect(result).toEqual(mockNewEntity);
  });

  it("should throw error when entity creation fails", async () => {
    mockDatabaseWrapper.executeMutation.mockResolvedValue(null);

    const entityToCreate = {
      // ... fields
    };

    await expect(service.create(entityToCreate)).rejects.toThrow(
      "Failed to create [entity]"
    );
  });

  it("should handle errors when creating entity", async () => {
    const error = new Error("Database error");
    mockDatabaseWrapper.executeMutation.mockRejectedValue(error);

    await expect(service.create(entityToCreate)).rejects.toThrow(
      "Database error"
    );
  });
});
```

**For Update Operations**:
```typescript
describe("update", () => {
  it("should update an entity successfully", async () => {
    const mockExistingEntity = {
      id: "entity-1",
      // ... fields
      created_at: "2023-01-01T00:00:00Z",
    };

    const mockUpdatedEntity = {
      ...mockExistingEntity,
      // ... updated fields
    };

    // Mock getById call (for getting old values)
    mockDatabaseWrapper.executeQuery.mockResolvedValue(mockExistingEntity);
    mockDatabaseWrapper.executeMutation.mockResolvedValue(mockUpdatedEntity);

    const result = await service.update("entity-1", {
      // ... fields to update
    });

    expect(result).toEqual(mockUpdatedEntity);
  });

  it("should throw error when entity not found for update", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue(null);
    mockDatabaseWrapper.executeMutation.mockResolvedValue(null);

    await expect(
      service.update("non-existent", { /* fields */ })
    ).rejects.toThrow("[Entity] not found");
  });
});
```

**For Delete Operations**:
```typescript
describe("delete", () => {
  it("should delete an entity successfully", async () => {
    const mockEntity = {
      id: "entity-1",
      // ... fields
    };

    mockDatabaseWrapper.executeQuery.mockResolvedValue(mockEntity);
    mockDatabaseWrapper.executeMutation.mockResolvedValue(null);

    await expect(service.delete("entity-1")).resolves.toBeUndefined();
  });

  it("should handle errors when deleting entity", async () => {
    const mockEntity = {
      id: "entity-1",
      // ... fields
    };

    mockDatabaseWrapper.executeQuery.mockResolvedValue(mockEntity);
    const error = new Error("Database error");
    mockDatabaseWrapper.executeMutation.mockRejectedValue(error);

    await expect(service.delete("entity-1")).rejects.toThrow(
      "Database error"
    );
  });
});
```

#### 3.4 Run Data Layer Tests

**Action**: Run tests and fix any issues.

```bash
npm test -- src/features/[feature-name]/__tests__/data/
```

**Checklist**:
- [ ] All tests pass
- [ ] No linter errors
- [ ] Proper crypto.randomUUID mocking if used
- [ ] All CRUD operations tested

---

### Step 4: Create Application Service Tests

**Priority**: Test business logic and validation layer.

#### 4.1 Read the Application Service

**Action**: Review the application service to understand:
- Validation methods
- Error handling patterns
- Repository dependencies
- Business logic transformations

#### 4.2 Set Up Base Test Template

**Template**:
```typescript
import logger from "@/shared/utils/logger";
import { [Service]ApplicationService } from "../../application/services/[service]ApplicationService";
import { [Repository]Repository } from "../../domain/repositories";

// Mock logger
jest.mock("@/shared/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock repositories
const mockRepository: jest.Mocked<[Repository]Repository> = {
  getById: jest.fn(),
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  // ... add all repository methods
};

describe("[Service]ApplicationService", () => {
  let applicationService: [Service]ApplicationService;

  beforeEach(() => {
    applicationService = new [Service]ApplicationService(
      mockRepository
    );
    jest.clearAllMocks();
  });

  // Tests go here
});
```

#### 4.3 Implement Test Methods

**Key Patterns**:

**Success Cases**:
```typescript
it("should return an entity successfully", async () => {
  const mockEntity = {
    // ... entity data
  };

  mockRepository.getById.mockResolvedValue(mockEntity);

  const result = await applicationService.getEntityById("entity-1");

  expect(result).toEqual(mockEntity);
});
```

**Error Cases - Not Found**:
```typescript
it("should throw error when entity not found", async () => {
  mockRepository.getById.mockResolvedValue(null);

  await expect(applicationService.getEntityById("non-existent")).rejects.toMatchObject({
    code: "[ENTITY]_FETCH_FAILED",
    message: "Failed to fetch [entity]",
  });
});
```

**Validation Error Cases**:
```typescript
it("should throw error when required field is missing", async () => {
  const invalidData = {
    // ... missing required fields
  };

  await expect(
    applicationService.createEntity(invalidData)
  ).rejects.toMatchObject({
    code: "[ENTITY]_CREATION_FAILED",
    message: "Failed to create [entity]",
  });
});
```

**Database Error Cases**:
```typescript
it("should handle errors when fetching entity", async () => {
  const error = new Error("Database error");
  mockRepository.getById.mockRejectedValue(error);

  await expect(applicationService.getEntityById("entity-1")).rejects.toMatchObject({
    code: "[ENTITY]_FETCH_FAILED",
    message: "Failed to fetch [entity]",
  });
});
```

#### 4.4 Run Application Service Tests

```bash
npm test -- src/features/[feature-name]/__tests__/application/[service]ApplicationService.test.ts
```

**Checklist**:
- [ ] All tests pass
- [ ] Validation scenarios covered
- [ ] Error codes match domain/errors.ts
- [ ] Repository methods properly mocked

---

### Step 5: Create React Hooks Tests

**Priority**: Test UI integration layer.

#### 5.1 Read the Hooks Implementation

**Action**: Review hooks to understand:
- Which application service methods are called
- Query keys used
- Mutation configurations
- Success/error handling

#### 5.2 Set Up Base Test Template

**Template**:
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { [service]ApplicationService } from "../../application/services/[service]ApplicationService";
import {
  use[Entity],
  use[Entities],
  useCreate[Entity],
  // ... import all hooks
} from "../../application/use[Service]";

// Mock the application service
jest.mock("../../application/services/[service]ApplicationService");
jest.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockApplicationService = [service]ApplicationService as jest.Mocked<
  typeof [service]ApplicationService
>;

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("[Service] Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests go here
});
```

#### 5.3 Implement Query Hooks Tests

**Pattern**:
```typescript
describe("use[Entities]", () => {
  it("should fetch all entities", async () => {
    const mockEntities = [
      { id: "entity-1", /* ... fields */ },
      { id: "entity-2", /* ... fields */ },
    ];

    mockApplicationService.getAll[Entities].mockResolvedValue(mockEntities);

    const { result } = renderHook(() => use[Entities](), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEntities);
    expect(mockApplicationService.getAll[Entities]).toHaveBeenCalled();
  });

  it("should not fetch when disabled", () => {
    const { result } = renderHook(() => use[Entity](""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });
});
```

#### 5.4 Implement Mutation Hooks Tests

**Pattern**:
```typescript
describe("useCreate[Entity]", () => {
  it("should create a new entity", async () => {
    const mockNewEntity = {
      id: "entity-1",
      /* ... fields */
    };

    mockApplicationService.create[Entity].mockResolvedValue(mockNewEntity);

    const { result } = renderHook(() => useCreate[Entity](), {
      wrapper: createWrapper(),
    });

    const entityToCreate = {
      /* ... fields */
    };

    result.current.mutate(entityToCreate);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNewEntity);
    expect(mockApplicationService.create[Entity]).toHaveBeenCalledWith(
      entityToCreate
    );
  });
});
```

#### 5.5 Run Hooks Tests

```bash
npm test -- src/features/[feature-name]/__tests__/application/use[Service].test.ts
```

**Checklist**:
- [ ] All tests pass
- [ ] Query hooks work with success/error states
- [ ] Mutation hooks properly call application service
- [ ] Query keys are correct

---

### Step 6: Run All Feature Tests

**Action**: Run all tests for the feature and verify 100% pass rate.

```bash
npm test -- src/features/[feature-name]/__tests__
```

**Expected Output**:
```
PASS src/features/[feature-name]/__tests__/data/[service]Service.test.ts
PASS src/features/[feature-name]/__tests__/application/[service]ApplicationService.test.ts
PASS src/features/[feature-name]/__tests__/application/use[Service].test.ts

Test Suites: 3 passed, 3 total
Tests:       XX passed, XX total
```

---

### Step 7: Verify Linting

**Action**: Check for linter errors.

```bash
# In your IDE or via command line
npm run lint -- src/features/[feature-name]/__tests__
```

**Checklist**:
- [ ] No linter errors
- [ ] Consistent formatting
- [ ] Proper imports

---

## File Structure

```
src/features/[feature-name]/
├── domain/
│   ├── entities.ts
│   ├── errors.ts
│   └── repositories.ts
├── data/
│   ├── [entity]Service.ts
│   └── index.ts
├── application/
│   ├── services/
│   │   ├── [service]ApplicationService.ts
│   │   └── index.ts
│   ├── use[Service].ts
│   └── index.ts
└── __tests__/
    ├── data/
    │   ├── [entity]Service.test.ts
    │   └── [otherEntity]Service.test.ts
    └── application/
        ├── [service]ApplicationService.test.ts
        └── use[Service].test.ts
```

---

## Common Patterns

### 1. DatabaseWrapper Mock Pattern

**Always use this pattern**:
```typescript
mockDatabaseWrapper.executeQuery.mockImplementation(async (fn) => {
  const result = await fn();
  if (result.error) {
    throw result.error;
  }
  return result.data;
});

mockDatabaseWrapper.executeMutation.mockImplementation(async (fn) => {
  const result = await fn();
  if (result.error) {
    throw result.error;
  }
  return result.data;
});
```

### 2. withPerformanceTracking Mock Pattern

**Always use this pattern**:
```typescript
mockWithPerformanceTracking.mockImplementation(
  async (service, method, fn) => await fn()
);
```

### 3. crypto.randomUUID Mock

**If your service uses crypto.randomUUID()** (check in create methods):
```typescript
beforeEach(() => {
  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "test-uuid-1234"),
    },
    writable: true,
    configurable: true,
  });
  // ... rest of setup
});
```

### 4. Application Service Error Handling

**For "not found" errors**, the error gets converted:
```typescript
// Domain throws ORDER_NOT_FOUND
throw productErrorHandler.createError(ORDER_NOT_FOUND, "Order not found", "Service");

// Application service converts to:
throw new ProductApplicationError(ORDER_FETCH_FAILED, "Failed to fetch order")
```

**So in tests, expect the converted error**:
```typescript
await expect(service.getById("non-existent")).rejects.toMatchObject({
  code: "ORDER_FETCH_FAILED",  // Not ORDER_NOT_FOUND
  message: "Failed to fetch order",
});
```

### 5. Timestamp Fields

**Always include timestamp fields in mocked responses**:
```typescript
const mockEntity = {
  id: "entity-1",
  // ... other fields
  created_at: null,      // or "2023-01-01T00:00:00Z"
  updated_at: null,      // if entity has this field
  price_updated_at: null // if entity has this field
};
```

---

## Troubleshooting

### Issue: "crypto.randomUUID is not a function"

**Solution**: Add crypto mock in beforeEach:
```typescript
beforeEach(() => {
  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "test-uuid-1234"),
    },
    writable: true,
    configurable: true,
  });
  // ... rest
});
```

### Issue: Error expectations don't match

**Check**: Look at the application service error handling pattern. Often "not found" errors get converted to generic fetch errors in the catch block.

### Issue: Test timeout with React hooks

**Solution**: Ensure you're using `waitFor`:
```typescript
await waitFor(() => expect(result.current.isSuccess).toBe(true));
```

### Issue: "Cannot read property 'data' of undefined"

**Solution**: Check that DatabaseWrapper mock returns `result.data` directly:
```typescript
mockDatabaseWrapper.executeQuery.mockImplementation(async (fn) => {
  const result = await fn();
  if (result.error) throw result.error;
  return result.data;  // Must return result.data
});
```

### Issue: Dependency service not mocked

**Solution**: If your service depends on another service, mock it:
```typescript
jest.mock("../../data/[dependency]Service", () => ({
  [dependency]Service: {
    getById: jest.fn(),
    // ... other methods used
  },
}));
```

---

## Testing Checklist

### Data Layer Tests
- [ ] getById - success, null, error
- [ ] getAll - success, empty array, error
- [ ] getAll variants (getActive, getByX, etc.) - success, empty, error
- [ ] create - success, null (failure), error
- [ ] update - success, not found, error
- [ ] delete - success, error
- [ ] Special methods (getWithDetails, etc.)

### Application Service Tests
- [ ] All data layer tests plus:
- [ ] Validation errors for create
- [ ] Validation errors for update
- [ ] Business logic transformations
- [ ] Error conversion patterns

### Hooks Tests
- [ ] All query hooks - success, disabled state
- [ ] All mutation hooks - success
- [ ] Query key correctness
- [ ] Invalidation patterns

### Final Verification
- [ ] All tests pass (100%)
- [ ] No linter errors
- [ ] Tests follow established patterns
- [ ] Coverage is comprehensive

---

## Example: Complete Feature Test Structure

See working examples:
- `src/features/orders/__tests__/` - Full example
- `src/features/payouts/__tests__/` - Full example
- `src/features/reviews/__tests__/` - Full example

Each demonstrates:
- Proper mocking patterns
- Error handling
- Test organization
- Coverage completeness

---

## Summary

Following this guide ensures:
✅ Consistent test patterns across features
✅ Comprehensive coverage
✅ Reliable and maintainable tests
✅ Fast feedback during development
✅ Confidence in refactoring

**Key Principles**:
1. Test each layer independently
2. Mock external dependencies properly
3. Test success, failure, and error paths
4. Use proven patterns from working tests
5. Verify 100% test pass rate before moving on

---

*Last Updated: Based on orders feature test implementation*

