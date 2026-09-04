# Enhanced AsyncOperation Migration Guide

This guide helps you migrate from the old `useAsyncOperation` to the new `useEnhancedAsyncOperation` hook.

## 🚀 What's New

The enhanced version adds:

- **Caching** - Avoid duplicate requests
- **Request deduplication** - Multiple calls = single request
- **Background refetching** - Keep data fresh automatically
- **Stale-while-revalidate** - Show cached data while fetching fresh
- **Retry logic** - Automatic retry on failure
- **Network awareness** - Handle offline/online states
- **Cache invalidation** - Smart cache management

## 📋 Migration Steps

### Step 1: Update Imports

```typescript
// Before
import { useAsyncOperation } from "@/shared/hooks/useAsyncOperation";

// After
import { useEnhancedAsyncOperation } from "@/shared/hooks/useEnhancedAsyncOperation";
```

### Step 2: Update Hook Usage

#### Simple Migration (No Breaking Changes)

```typescript
// Before
const createLead = useAsyncOperation(
  leadsApplicationService.createLead,
  "CREATE_LEAD_FAILED"
);

// After (exact same behavior)
const createLead = useEnhancedAsyncOperation(
  leadsApplicationService.createLead,
  {
    errorCode: "CREATE_LEAD_FAILED",
    staleTime: 0, // No caching (same as old behavior)
    cacheTime: 0,
  }
);
```

#### Enhanced Migration (With Caching)

```typescript
// Before
const getAllLeads = useAsyncOperation(
  leadsApplicationService.getAllLeads,
  "FETCH_LEADS_FAILED"
);

// After (with caching benefits)
const getAllLeads = useEnhancedAsyncOperation(
  leadsApplicationService.getAllLeads,
  {
    cacheKey: "leads",
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    errorCode: "FETCH_LEADS_FAILED",
    retry: 3,
    onSuccess: (data) => {
      console.log(`Loaded ${data.length} leads`);
    },
  }
);
```

## 🔧 Configuration Options

### Caching Options

```typescript
{
  cacheKey: 'leads', // Unique key for caching
  staleTime: 5 * 60 * 1000, // How long data stays fresh (5 minutes)
  cacheTime: 30 * 60 * 1000, // How long to keep in cache (30 minutes)
}
```

### Network Options

```typescript
{
  retry: 3, // Number of retries (or true for default)
  retryDelay: 1000, // Delay between retries in ms
  refetchOnWindowFocus: true, // Refetch when window gains focus
  refetchOnReconnect: true, // Refetch when network reconnects
}
```

### Callbacks

```typescript
{
  onSuccess: (data) => {
    // Handle success
    invalidateCache('related-data');
  },
  onError: (error) => {
    // Handle error
    console.error('Operation failed:', error);
  }
}
```

### Advanced Options

```typescript
{
  enabled: !!someCondition, // Only run if condition is true
  keepPreviousData: true, // Keep old data while fetching new
  errorCode: "CUSTOM_ERROR_CODE", // Custom error code
}
```

## 📊 Migration Patterns

### 1. Data Fetching (Add Caching)

```typescript
// Before
const getProducts = useAsyncOperation(
  productsApplicationService.getAllProducts,
  "FETCH_PRODUCTS_FAILED"
);

// After
const getProducts = useEnhancedAsyncOperation(
  productsApplicationService.getAllProducts,
  {
    cacheKey: "products",
    staleTime: 10 * 60 * 1000, // 10 minutes
    errorCode: "FETCH_PRODUCTS_FAILED",
  }
);
```

### 2. Mutations (Add Cache Invalidation)

```typescript
// Before
const createProduct = useAsyncOperation(
  productsApplicationService.createProduct,
  "CREATE_PRODUCT_FAILED"
);

// After
const createProduct = useEnhancedAsyncOperation(
  productsApplicationService.createProduct,
  {
    cacheKey: "createProduct",
    staleTime: 0, // Don't cache mutations
    errorCode: "CREATE_PRODUCT_FAILED",
    onSuccess: () => {
      invalidateCache("products"); // Invalidate related caches
    },
  }
);
```

### 3. Conditional Operations

```typescript
// Before
const getProduct = useAsyncOperation(
  () => productsApplicationService.getProductById(productId),
  "FETCH_PRODUCT_FAILED"
);

// After
const getProduct = useEnhancedAsyncOperation(
  () => productsApplicationService.getProductById(productId),
  {
    cacheKey: `product-${productId}`,
    staleTime: 5 * 60 * 1000,
    enabled: !!productId, // Only run if productId exists
    errorCode: "FETCH_PRODUCT_FAILED",
  }
);
```

## 🛠️ Utility Functions

### Cache Management

```typescript
import {
  invalidateCache,
  clearAllCache,
  getCacheStats,
} from "@/shared/hooks/useEnhancedAsyncOperation";

// Invalidate specific cache entries
invalidateCache("leads"); // Invalidates all keys containing 'leads'

// Clear all cache
clearAllCache();

// Get cache statistics
const stats = getCacheStats();
console.log("Cache stats:", stats);
```

### Cache Invalidation Strategies

```typescript
// After creating a lead
const createLead = useEnhancedAsyncOperation(
  leadsApplicationService.createLead,
  {
    onSuccess: () => {
      // Strategy 1: Invalidate all lead-related caches
      invalidateCache("leads");

      // Strategy 2: Invalidate specific patterns
      invalidateCache("leads-partner-");
      invalidateCache("leads-status-");

      // Strategy 3: Invalidate by exact key
      invalidateCache("leads-list");
    },
  }
);
```

## 🧪 Testing

### Testing Cached Operations

```typescript
// Test that data is cached
const { execute } = useEnhancedAsyncOperation(mockService.getData, {
  cacheKey: "test-data",
  staleTime: 60000,
});

// First call
await execute();
expect(mockService.getData).toHaveBeenCalledTimes(1);

// Second call (should use cache)
await execute();
expect(mockService.getData).toHaveBeenCalledTimes(1); // Still 1!
```

### Testing Cache Invalidation

```typescript
// Test cache invalidation
const { execute, invalidate } = useEnhancedAsyncOperation(mockService.getData, {
  cacheKey: "test-data",
});

await execute();
invalidate();
await execute(); // Should fetch again
expect(mockService.getData).toHaveBeenCalledTimes(2);
```

## 🚨 Common Pitfalls

### 1. Forgetting Cache Keys

```typescript
// ❌ Bad - No cache key means no caching
const getData = useEnhancedAsyncOperation(
  service.getData,
  { staleTime: 60000 } // This won't work without cacheKey
);

// ✅ Good - Include cache key
const getData = useEnhancedAsyncOperation(service.getData, {
  cacheKey: "data",
  staleTime: 60000,
});
```

### 2. Not Invalidating Related Caches

```typescript
// ❌ Bad - Related data becomes stale
const createLead = useEnhancedAsyncOperation(service.createLead, {
  onSuccess: () => {
    // Missing cache invalidation
  },
});

// ✅ Good - Invalidate related caches
const createLead = useEnhancedAsyncOperation(service.createLead, {
  onSuccess: () => {
    invalidateCache("leads");
    invalidateCache("leads-partner-");
  },
});
```

### 3. Caching Mutations

```typescript
// ❌ Bad - Don't cache mutations
const createLead = useEnhancedAsyncOperation(service.createLead, {
  cacheKey: "createLead",
  staleTime: 60000, // This caches the mutation result
});

// ✅ Good - Don't cache mutations
const createLead = useEnhancedAsyncOperation(service.createLead, {
  cacheKey: "createLead",
  staleTime: 0, // No caching for mutations
});
```

## 📈 Performance Tips

### 1. Choose Appropriate Stale Times

```typescript
// Real-time data
{
  staleTime: 30 * 1000;
} // 30 seconds

// User data
{
  staleTime: 5 * 60 * 1000;
} // 5 minutes

// Static data
{
  staleTime: 60 * 60 * 1000;
} // 1 hour
```

### 2. Use keepPreviousData for Better UX

```typescript
// Show old data while fetching new data
const getData = useEnhancedAsyncOperation(service.getData, {
  cacheKey: "data",
  keepPreviousData: true, // Better UX
  staleTime: 60000,
});
```

### 3. Enable Background Refetching

```typescript
// Keep data fresh automatically
const getData = useEnhancedAsyncOperation(service.getData, {
  cacheKey: "data",
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});
```

## 🔄 Rollback Plan

If you need to rollback, simply change the import back:

```typescript
// Rollback
import { useAsyncOperation } from "@/shared/hooks/useAsyncOperation";

// And remove the options object
const operation = useAsyncOperation(service.method, "ERROR_CODE");
```

The old hook will continue to work exactly as before.
