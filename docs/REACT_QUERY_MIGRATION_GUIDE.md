# 🚀 React Query Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from `useAsyncOperation` to React Query hooks across all features in the application.

## ✅ Completed Migrations

The following features have been successfully migrated to React Query:

- ✅ **Partners** - Complete migration with legacy compatibility
- ✅ **Products** - Complete migration with legacy compatibility
- ✅ **Parcels** - Complete migration with legacy compatibility
- ✅ **Payouts** - Complete migration (was already partially migrated)

## 📁 New File Structure

Each migrated feature now has:

```
src/features/{feature}/application/
├── use{Feature}.ts                    # Legacy hooks (useAsyncOperation)
├── use{Feature}ReactQuery.ts          # New React Query hooks
├── index.ts                          # Exports both legacy and new hooks
└── services/                         # Application services
```

## 🔄 Migration Patterns

### 1. Query Hooks

**Before (useAsyncOperation):**

```typescript
const getAllPartners = useAsyncOperation(
  partnerApplicationService.getAllPartners,
  "FETCH_PARTNERS_FAILED"
);
```

**After (React Query):**

```typescript
const { data: partners, isLoading, error } = usePartners();
```

### 2. Mutation Hooks

**Before (useAsyncOperation):**

```typescript
const createPartner = useAsyncOperation(
  async (partnerData: CreatePartnerRequest) => {
    const result = await partnerApplicationService.createPartner(partnerData);
    await getAllPartners.execute();
    return result;
  },
  "CREATE_PARTNER_FAILED"
);
```

**After (React Query):**

```typescript
const createPartner = useCreatePartner();
// Automatic cache invalidation and success/error handling
```

### 3. Conditional Queries

**Before (useAsyncOperation):**

```typescript
useEffect(() => {
  if (partnerId) {
    getPartnerById.execute(partnerId);
  }
}, [partnerId]);
```

**After (React Query):**

```typescript
const { data: partner } = usePartner(partnerId);
// Automatically enabled/disabled based on partnerId
```

## 🎯 Available Hooks by Feature

### Partners

#### Query Hooks

- `usePartners()` - Get all partners
- `usePartner(partnerId)` - Get specific partner
- `usePartnerByEmail(email)` - Get partner by email
- `usePartnerByUsername(username)` - Get partner by username
- `usePartnerStats(partnerId)` - Get partner statistics
- `useSearchPartners(query)` - Search partners

#### Mutation Hooks

- `useCreatePartner()` - Create new partner
- `useUpdatePartner()` - Update partner
- `useDeletePartner()` - Delete partner
- `useUpdatePartnerStatus()` - Update partner status

#### Legacy Compatibility

- `usePartnersLegacy()` - Drop-in replacement for original `usePartners`
- `usePartnerLegacy(partnerId)` - Drop-in replacement for original `usePartner`

### Products

#### Query Hooks

- `useProducts()` - Get all products
- `useProduct(productId)` - Get specific product
- `useProductImages(productId)` - Get product images
- `useProductItems(productId)` - Get product items
- `useProductItem(itemId)` - Get specific product item
- `useProductCommissions(productIds)` - Get product commissions

#### Mutation Hooks

- `useCreateProduct()` - Create new product
- `useUpdateProduct()` - Update product
- `useDeleteProduct()` - Delete product
- `useAddProductImage()` - Add product image
- `useRemoveProductImage()` - Remove product image
- `useCreateProductItem()` - Create product item
- `useUpdateProductItem()` - Update product item
- `useDeleteProductItem()` - Delete product item

#### Legacy Compatibility

- `useProductsLegacy()` - Drop-in replacement for original `useProducts`
- `useProductLegacy(productId)` - Drop-in replacement for original `useProduct`

### Parcels

#### Query Hooks

- `useParcels()` - Get all parcels
- `useParcelsByPartner(partnerId)` - Get parcels by partner
- `useParcel(parcelId)` - Get specific parcel
- `useParcelByTracking(trackingNumber)` - Get parcel by tracking
- `useParcelsByStatus(status)` - Get parcels by status
- `useParcelsByPaymentStatus(paymentStatus)` - Get parcels by payment status

#### Mutation Hooks

- `useCreateParcel()` - Create new parcel
- `useUpdateParcel()` - Update parcel
- `useUpdateParcelStatus()` - Update parcel status
- `useDeleteParcel()` - Delete parcel

#### Legacy Compatibility

- `useParcelsLegacy()` - Drop-in replacement for original `useParcels`

### Payouts

#### Query Hooks

- `useCommissions(partnerId)` - Get commissions
- `useEligibleCommissions(partnerId)` - Get eligible commissions
- `useCommissionSummary(partnerId)` - Get commission summary
- `usePayouts(partnerId)` - Get payouts
- `usePayoutSummary(partnerId)` - Get payout summary
- `useWithdrawals(partnerId)` - Get withdrawals
- `useWithdrawalSummary(partnerId)` - Get withdrawal summary

#### Mutation Hooks

- `useCreateCommission()` - Create commission
- `useCreatePayout()` - Create payout
- `useProcessPayout()` - Process payout
- `useCompletePayout()` - Complete payout
- `useCreateWithdrawal()` - Create withdrawal
- `useApproveWithdrawal()` - Approve withdrawal
- `useRejectWithdrawal()` - Reject withdrawal

#### Legacy Compatibility

- `usePayoutOperations()` - Drop-in replacement for payout operations
- `useWithdrawalOperations()` - Drop-in replacement for withdrawal operations

## 🔧 Component Migration Steps

### Step 1: Update Imports

**Before:**

```typescript
import { usePartners } from "@/features/partners/application/usePartners";
```

**After:**

```typescript
import { usePartners } from "@/features/partners/application";
// or for new React Query hooks:
import { usePartners as usePartnersQuery } from "@/features/partners/application";
```

### Step 2: Update Hook Usage

**Before:**

```typescript
const { partners, isLoading, error, createPartner, isCreating, createError } =
  usePartners();

// Manual execution
const handleCreate = async (data) => {
  await createPartner(data);
};
```

**After (Legacy Compatibility):**

```typescript
const { partners, isLoading, error, createPartner, isCreating, createError } =
  usePartnersLegacy();

// Same interface, no changes needed
const handleCreate = async (data) => {
  await createPartner(data);
};
```

**After (Full React Query):**

```typescript
const { data: partners, isLoading, error } = usePartners();
const createPartner = useCreatePartner();

// React Query handles success/error automatically
const handleCreate = (data) => {
  createPartner.mutate(data);
};
```

### Step 3: Update Error Handling

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
// React Query mutations handle errors automatically
// Success/error toasts are built-in
// Custom error handling can be added via onError callback
```

### Step 4: Update Loading States

**Before:**

```typescript
const isLoading = isLoading || isCreating || isUpdating;
```

**After:**

```typescript
// React Query provides granular loading states
const isLoading = partnersQuery.isLoading;
const isCreating = createPartner.isPending;
```

## 🎨 Benefits of Migration

### 1. Automatic Caching

- Data is cached and shared across components
- Reduces unnecessary API calls
- Improves performance

### 2. Background Refetching

- Data stays fresh automatically
- Configurable stale time and cache time
- Smart refetching on window focus

### 3. Optimistic Updates

- UI updates immediately
- Automatic rollback on errors
- Better user experience

### 4. Error Handling

- Built-in retry logic
- Automatic error boundaries
- Consistent error states

### 5. Loading States

- Granular loading indicators
- Skeleton screens support
- Better UX patterns

## 🚨 Breaking Changes

### 1. Hook Return Values

- `execute` function is replaced with `mutate` for mutations
- `refetch` is available for queries
- Error handling is more granular

### 2. Manual Cache Management

- No need to manually refresh data after mutations
- Cache invalidation is automatic
- Manual refetch available when needed

### 3. Error States

- Errors are now per-operation instead of global
- Built-in retry mechanisms
- Better error recovery

## 🔄 Gradual Migration Strategy

### Phase 1: Legacy Compatibility (Current)

- Use `*Legacy` hooks for drop-in replacement
- No component changes required
- Immediate benefits of React Query

### Phase 2: Full Migration (Future)

- Replace legacy hooks with new React Query hooks
- Update component patterns
- Leverage advanced React Query features

### Phase 3: Cleanup (Future)

- Remove legacy hooks
- Remove `useAsyncOperation` dependency
- Optimize query patterns

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Migration Examples](./examples/)
- [Team Training Materials](./training/)

## 🆘 Troubleshooting

### Common Issues

1. **Type Errors**: Ensure all query keys are properly typed as `string[]`
2. **Cache Issues**: Use React Query DevTools to inspect cache state
3. **Infinite Loops**: Check dependency arrays in useEffect
4. **Stale Data**: Verify cache invalidation patterns

### Getting Help

- Check the [React Query Migration Plan](./REACT_QUERY_MIGRATION_PLAN.md)
- Review existing migrated components
- Consult the team for complex migration scenarios

---

_This migration ensures better performance, developer experience, and user experience while maintaining backward compatibility during the transition period._
