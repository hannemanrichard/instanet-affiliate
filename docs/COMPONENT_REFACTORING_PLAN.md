# Component Refactoring Plan

## Clean Architecture Component Organization for Referio Platform

### Overview

This plan outlines a comprehensive refactoring strategy to properly organize components according to clean architecture principles. The goal is to move all feature-specific components to their respective feature's presentation layer and organize shared components under `src/shared/components`.

## Current Issues Identified

### 1. **Mixed Component Organization**

- Feature-specific components are scattered in `src/components/` instead of being in their respective feature's presentation layer
- Shared components are mixed with feature-specific ones
- No clear separation between domain-specific and reusable components

### 2. **Inconsistent Structure**

- Some features have empty `presentation/` folders while their components are in `src/components/`
- Duplicate navigation components (`sidebar.tsx`, `affiliate-sidebar.tsx`, `main-nav.tsx`)
- UI components mixed with business logic components

### 3. **Import Path Confusion**

- Components import from various locations without clear patterns
- No standardized way to access shared vs feature-specific components

## Target Architecture

```
src/
├── features/
│   ├── leads/
│   │   ├── presentation/
│   │   │   ├── components/
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── LeadsTable.tsx
│   │   │   │   ├── LeadDetailsDialog.tsx
│   │   │   │   ├── AddLeadButton.tsx
│   │   │   │   ├── AddLeadSheet.tsx
│   │   │   │   └── columns.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useBulkActions.ts
│   │   │   └── index.ts
│   │   ├── application/
│   │   ├── data/
│   │   └── domain/
│   ├── products/
│   │   ├── presentation/
│   │   │   ├── components/
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductsTable.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   ├── AddProductButton.tsx
│   │   │   │   ├── AddProductSheet.tsx
│   │   │   │   ├── AddImagesSheet.tsx
│   │   │   │   ├── AddItemSheet.tsx
│   │   │   │   ├── ImagesForm.tsx
│   │   │   │   ├── ItemForm.tsx
│   │   │   │   └── columns.tsx
│   │   │   └── index.ts
│   │   ├── application/
│   │   ├── data/
│   │   └── domain/
│   └── [other features...]
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   ├── UserNav.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── auth/
│   │   │   ├── RoleGuard.tsx
│   │   │   └── SignOutButton.tsx
│   │   ├── forms/
│   │   │   ├── ProfileForm.tsx
│   │   │   └── SettingsForm.tsx
│   │   ├── dashboard/
│   │   │   └── PartnerDashboard.tsx
│   │   ├── shells/
│   │   │   └── Shell.tsx
│   │   └── ui/ (existing UI components)
│   ├── hooks/
│   ├── utils/
│   └── types/
└── app/ (Next.js app router)
```

## Refactoring Strategy

### Phase 1: Analysis and Preparation (Week 1)

#### 1.1 Component Classification

- **Feature-Specific Components**: Components that belong to a specific business domain
- **Shared Components**: Components used across multiple features or general layout components
- **UI Components**: Reusable UI primitives (already in `src/components/ui/`)

#### 1.2 Dependency Analysis

- Map all import dependencies between components
- Identify circular dependencies
- Plan import path updates

#### 1.3 Create Target Structure

- Create empty presentation folders for each feature
- Set up proper index.ts files for exports
- Prepare shared components structure

### Phase 2: Feature Components Migration (Week 2-3)

#### 2.1 Leads Feature

**Move from:** `src/components/leads/`
**Move to:** `src/features/leads/presentation/components/`

**Components to move:**

- `lead-form.tsx` → `LeadForm.tsx`
- `leads-table.tsx` → `LeadsTable.tsx`
- `lead-details-dialog.tsx` → `LeadDetailsDialog.tsx`
- `add-lead-button.tsx` → `AddLeadButton.tsx`
- `add-lead-sheet.tsx` → `AddLeadSheet.tsx`
- `columns.tsx` → `columns.tsx`
- `use-bulk-actions.ts` → `hooks/useBulkActions.ts`

**Update imports:**

```typescript
// Before
import { LeadForm } from "@/components/leads/lead-form";

// After
import { LeadForm } from "@/features/leads/presentation";
```

#### 2.2 Products Feature

**Move from:** `src/components/products/`
**Move to:** `src/features/products/presentation/components/`

**Components to move:**

- `product-form.tsx` → `ProductForm.tsx`
- `products-table.tsx` → `ProductsTable.tsx`
- `product-details.tsx` → `ProductDetails.tsx`
- `add-product-button.tsx` → `AddProductButton.tsx`
- `add-product-sheet.tsx` → `AddProductSheet.tsx`
- `add-images-sheet.tsx` → `AddImagesSheet.tsx`
- `add-item-sheet.tsx` → `AddItemSheet.tsx`
- `images-form.tsx` → `ImagesForm.tsx`
- `item-form.tsx` → `ItemForm.tsx`
- `columns.tsx` → `columns.tsx`

#### 2.3 Orders Feature

**Move from:** `src/components/orders/`
**Move to:** `src/features/orders/presentation/components/`

**Components to move:**

- `orders-table.tsx` → `OrdersTable.tsx`
- `order-details-dialog.tsx` → `OrderDetailsDialog.tsx`
- `order-details.tsx` → `OrderDetails.tsx`
- `order-tracking-dialog.tsx` → `OrderTrackingDialog.tsx`
- `columns.tsx` → `columns.tsx`

#### 2.4 Partners Feature

**Move from:** `src/components/partners/`
**Move to:** `src/features/partners/presentation/components/`

**Components to move:**

- `partners-table.tsx` → `PartnersTable.tsx`

#### 2.5 Payouts/Balance Feature

**Move from:** `src/components/balance/`
**Move to:** `src/features/payouts/presentation/components/`

**Components to move:**

- `ActiveBalance.tsx` → `ActiveBalance.tsx`
- `PaymentStatistics.tsx` → `PaymentStatistics.tsx`
- `RecentPayments.tsx` → `RecentPayments.tsx`
- `RequestWithdrawButton.tsx` → `RequestWithdrawButton.tsx`
- `RequestWithdrawDialog.tsx` → `RequestWithdrawDialog.tsx`

### Phase 3: Shared Components Organization (Week 4)

#### 3.1 Layout Components

**Move from:** `src/components/layout/`
**Move to:** `src/shared/components/layout/`

**Components to move:**

- `sidebar.tsx` → `AppSidebar.tsx` (consolidate with affiliate-sidebar.tsx)
- `top-nav.tsx` → `TopNav.tsx`
- `user-nav.tsx` → `UserNav.tsx`
- `theme-toggle.tsx` → `ThemeToggle.tsx`
- Remove `main-nav.tsx` and `affiliate-sidebar.tsx` (consolidate functionality)

#### 3.2 Auth Components

**Move from:** `src/components/auth/`
**Move to:** `src/shared/components/auth/`

**Components to move:**

- `role-guard.tsx` → `RoleGuard.tsx`
- `sign-out-button.tsx` → `SignOutButton.tsx`

#### 3.3 General Components

**Move from:** `src/components/`
**Move to:** `src/shared/components/`

**Components to move:**

- `profile/` → `forms/ProfileForm.tsx`
- `settings/` → `forms/SettingsForm.tsx`
- `dashboard/` → `dashboard/PartnerDashboard.tsx`
- `onboarding/` → `forms/OnboardingForm.tsx`
- `shells/` → `shells/Shell.tsx`
- `parcels/` → `tables/ParcelsTable.tsx` (if it's a generic table)

#### 3.4 UI Components

**Keep in:** `src/shared/components/ui/` (already properly organized)

### Phase 4: Import Path Updates (Week 5)

#### 4.1 Update All Import Statements

- Update imports in all components
- Update imports in pages and layouts
- Update imports in tests

#### 4.2 Create Barrel Exports

**Feature presentation index files:**

```typescript
// src/features/leads/presentation/index.ts
export { LeadForm } from "./components/LeadForm";
export { LeadsTable } from "./components/LeadsTable";
export { LeadDetailsDialog } from "./components/LeadDetailsDialog";
export { AddLeadButton } from "./components/AddLeadButton";
export { AddLeadSheet } from "./components/AddLeadSheet";
export { columns } from "./components/columns";
export { useBulkActions } from "./hooks/useBulkActions";
```

**Shared components index file:**

```typescript
// src/shared/components/index.ts
export * from "./layout";
export * from "./auth";
export * from "./forms";
export * from "./dashboard";
export * from "./shells";
export * from "./ui";
```

#### 4.3 Update App Router Imports

Update all page components to use new import paths:

```typescript
// Before
import { LeadsTable } from "@/components/leads/leads-table";

// After
import { LeadsTable } from "@/features/leads/presentation";
```

### Phase 5: Cleanup and Optimization (Week 6)

#### 5.1 Remove Old Structure

- Delete empty `src/components/` folders
- Remove duplicate components
- Clean up unused imports

#### 5.2 Consolidate Duplicate Components

- Merge `sidebar.tsx` and `affiliate-sidebar.tsx` into single `AppSidebar.tsx`
- Remove `main-nav.tsx` if functionality is covered by sidebar
- Consolidate navigation logic

#### 5.3 Update Documentation

- Update component documentation
- Update import guidelines
- Create component organization guidelines

## Detailed Migration Steps

### Step 1: Create Target Structure

```bash
# Create feature presentation folders
mkdir -p src/features/leads/presentation/components
mkdir -p src/features/leads/presentation/hooks
mkdir -p src/features/products/presentation/components
mkdir -p src/features/orders/presentation/components
mkdir -p src/features/partners/presentation/components
mkdir -p src/features/payouts/presentation/components

# Create shared components structure
mkdir -p src/shared/components/layout
mkdir -p src/shared/components/auth
mkdir -p src/shared/components/forms
mkdir -p src/shared/components/dashboard
mkdir -p src/shared/components/shells
```

### Step 2: Move Components with Git

```bash
# Move leads components
git mv src/components/leads/lead-form.tsx src/features/leads/presentation/components/LeadForm.tsx
git mv src/components/leads/leads-table.tsx src/features/leads/presentation/components/LeadsTable.tsx
git mv src/components/leads/lead-details-dialog.tsx src/features/leads/presentation/components/LeadDetailsDialog.tsx
git mv src/components/leads/add-lead-button.tsx src/features/leads/presentation/components/AddLeadButton.tsx
git mv src/components/leads/add-lead-sheet.tsx src/features/leads/presentation/components/AddLeadSheet.tsx
git mv src/components/leads/columns.tsx src/features/leads/presentation/components/columns.tsx
git mv src/components/leads/use-bulk-actions.ts src/features/leads/presentation/hooks/useBulkActions.ts

# Move products components
git mv src/components/products/product-form.tsx src/features/products/presentation/components/ProductForm.tsx
git mv src/components/products/products-table.tsx src/features/products/presentation/components/ProductsTable.tsx
git mv src/components/products/product-details.tsx src/features/products/presentation/components/ProductDetails.tsx
git mv src/components/products/add-product-button.tsx src/features/products/presentation/components/AddProductButton.tsx
git mv src/components/products/add-product-sheet.tsx src/features/products/presentation/components/AddProductSheet.tsx
git mv src/components/products/add-images-sheet.tsx src/features/products/presentation/components/AddImagesSheet.tsx
git mv src/components/products/add-item-sheet.tsx src/features/products/presentation/components/AddItemSheet.tsx
git mv src/components/products/images-form.tsx src/features/products/presentation/components/ImagesForm.tsx
git mv src/components/products/item-form.tsx src/features/products/presentation/components/ItemForm.tsx
git mv src/components/products/columns.tsx src/features/products/presentation/components/columns.tsx

# Continue for other features...
```

### Step 3: Update Component Names and Exports

**Example for LeadForm:**

```typescript
// src/features/leads/presentation/components/LeadForm.tsx
"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
// ... other imports

interface LeadFormProps {
  onSubmit: (data: LeadFormValues) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<LeadFormValues>;
}

export function LeadForm({
  onSubmit,
  isLoading,
  defaultValues,
}: LeadFormProps) {
  // ... component implementation
}
```

### Step 4: Create Index Files

**Feature presentation index:**

```typescript
// src/features/leads/presentation/index.ts
export { LeadForm } from "./components/LeadForm";
export { LeadsTable } from "./components/LeadsTable";
export { LeadDetailsDialog } from "./components/LeadDetailsDialog";
export { AddLeadButton } from "./components/AddLeadButton";
export { AddLeadSheet } from "./components/AddLeadSheet";
export { columns } from "./components/columns";
export { useBulkActions } from "./hooks/useBulkActions";
```

**Shared components index:**

```typescript
// src/shared/components/index.ts
export * from "./layout";
export * from "./auth";
export * from "./forms";
export * from "./dashboard";
export * from "./shells";
export * from "./ui";
```

### Step 5: Update Import Statements

**Before:**

```typescript
import { LeadForm } from "@/components/leads/lead-form";
import { ProductsTable } from "@/components/products/products-table";
import { AppSidebar } from "@/components/layout/sidebar";
```

**After:**

```typescript
import { LeadForm } from "@/features/leads/presentation";
import { ProductsTable } from "@/features/products/presentation";
import { AppSidebar } from "@/shared/components";
```

## Benefits of This Refactoring

### 1. **Clear Separation of Concerns**

- Feature-specific components are co-located with their business logic
- Shared components are clearly separated and reusable
- UI components remain as pure presentation primitives

### 2. **Improved Maintainability**

- Easier to find and modify feature-specific components
- Clear boundaries between features
- Reduced coupling between unrelated components

### 3. **Better Developer Experience**

- Intuitive file organization
- Clear import paths
- Easier onboarding for new developers

### 4. **Scalability**

- Easy to add new features following the same pattern
- Clear guidelines for component placement
- Consistent structure across the application

### 5. **Testing Benefits**

- Feature components can be tested in isolation
- Shared components have dedicated test suites
- Clear test organization mirrors component organization

## Migration Checklist

### Pre-Migration

- [ ] Backup current codebase
- [ ] Create feature branch for refactoring
- [ ] Document current component dependencies
- [ ] Plan import path updates

### During Migration

- [ ] Create target directory structure
- [ ] Move components using git mv
- [ ] Update component names to PascalCase
- [ ] Create index.ts files for exports
- [ ] Update all import statements
- [ ] Update component exports
- [ ] Consolidate duplicate components

### Post-Migration

- [ ] Run all tests to ensure nothing is broken
- [ ] Update documentation
- [ ] Remove old empty directories
- [ ] Update ESLint/TypeScript configuration if needed
- [ ] Create component organization guidelines

## Risk Mitigation

### 1. **Breaking Changes**

- **Risk**: Import path changes break existing code
- **Mitigation**: Use find/replace tools and comprehensive testing

### 2. **Circular Dependencies**

- **Risk**: Moving components creates circular imports
- **Mitigation**: Analyze dependencies before moving, use barrel exports carefully

### 3. **Build Issues**

- **Risk**: TypeScript/build errors due to path changes
- **Mitigation**: Update tsconfig.json paths, test builds frequently

### 4. **Team Coordination**

- **Risk**: Multiple developers working on different features
- **Mitigation**: Coordinate migration timing, use feature flags if needed

## Timeline

| Week | Phase             | Tasks                                                             |
| ---- | ----------------- | ----------------------------------------------------------------- |
| 1    | Analysis          | Component classification, dependency analysis, structure creation |
| 2    | Leads & Products  | Move leads and products components, update imports                |
| 3    | Orders & Partners | Move orders, partners, and payouts components                     |
| 4    | Shared Components | Move layout, auth, and general components                         |
| 5    | Import Updates    | Update all import statements, create barrel exports               |
| 6    | Cleanup           | Remove old structure, consolidate duplicates, documentation       |

## Success Metrics

### 1. **Code Organization**

- All feature components in their respective presentation layers
- Shared components properly organized
- No duplicate or orphaned components

### 2. **Import Clarity**

- Clear import paths following the new structure
- No relative imports more than 2 levels deep
- Consistent import patterns across the codebase

### 3. **Maintainability**

- New developers can easily find components
- Feature boundaries are clear
- Component responsibilities are well-defined

### 4. **Build Performance**

- No increase in build times
- No circular dependency warnings
- Clean TypeScript compilation

## Conclusion

This refactoring plan provides a comprehensive approach to organizing components according to clean architecture principles. The phased approach ensures minimal disruption while achieving a clear, maintainable, and scalable component structure.

The key benefits include:

- **Clear separation** between feature-specific and shared components
- **Improved maintainability** through logical organization
- **Better developer experience** with intuitive file structure
- **Scalable architecture** that supports future growth

By following this plan, the Referio platform will have a well-organized component structure that aligns with clean architecture principles and supports long-term maintainability.
