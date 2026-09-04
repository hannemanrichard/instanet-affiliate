# Component Organization Improvement Plan

## Current Issues Identified

### 1. Inconsistent Component Grouping

- **Leads**: Good form section organization but flat structure for other components
- **Products**: All components in single directory without logical grouping
- **Orders**: Simple flat structure, needs better organization
- **Parcels**: Mixed organization patterns
- **Partners/Payouts**: Very flat structures

### 2. Large, Complex Components

- `LeadForm.tsx` (114 lines) - Multiple responsibilities
- `ProductDetails.tsx` (248 lines) - UI + business logic mixed
- `LeadsTable.tsx` (297 lines) - Very complex with multiple concerns
- `ItemsSection.tsx` (386 lines) - Extremely large and complex

### 3. Mixed Responsibilities

- Components handling both UI and business logic
- Form components mixed with display components
- Table components with embedded filter logic

## Recommended Organization Structure

### Standard Feature Presentation Structure

```
src/features/{feature}/presentation/
├── components/
│   ├── forms/
│   │   ├── sections/           # Form section components
│   │   ├── fields/             # Reusable form field components
│   │   ├── validation/         # Form validation components
│   │   └── index.ts           # Form exports
│   ├── tables/
│   │   ├── columns/           # Table column definitions
│   │   ├── filters/           # Table filter components
│   │   ├── actions/           # Table action components
│   │   └── index.ts           # Table exports
│   ├── dialogs/
│   │   ├── creation/          # Creation dialog components
│   │   ├── details/           # Details dialog components
│   │   ├── confirmation/      # Confirmation dialog components
│   │   └── index.ts           # Dialog exports
│   ├── sheets/
│   │   ├── creation/          # Creation sheet components
│   │   ├── editing/           # Editing sheet components
│   │   └── index.ts           # Sheet exports
│   ├── cards/
│   │   ├── summary/           # Summary card components
│   │   ├── details/           # Details card components
│   │   └── index.ts           # Card exports
│   ├── buttons/
│   │   ├── actions/           # Action button components
│   │   ├── navigation/        # Navigation button components
│   │   └── index.ts           # Button exports
│   └── index.ts               # Main component exports
├── hooks/                     # Feature-specific presentation hooks
├── utils/                     # Feature-specific presentation utilities
└── index.ts                   # Feature presentation exports
```

## Implementation Plan

### Phase 1: Leads Feature Reorganization

**Priority: High** - Most complex feature with good foundation

#### Current Structure Issues:

- `LeadsTable.tsx` (297 lines) - Too complex, mixed concerns
- `LeadForm.tsx` (114 lines) - Could be better organized
- `ItemsSection.tsx` (386 lines) - Extremely large, needs breakdown
- Flat structure for non-form components

#### Proposed Structure:

```
src/features/leads/presentation/components/
├── forms/
│   ├── sections/
│   │   ├── CustomerInfoSection.tsx
│   │   ├── LocationSection.tsx
│   │   ├── ItemsSection.tsx (break down further)
│   │   ├── OrderSummarySection.tsx
│   │   ├── NotesSection.tsx
│   │   └── OrderTypeSection.tsx
│   ├── fields/
│   │   ├── ProductSelector.tsx
│   │   ├── ColorSelector.tsx
│   │   ├── SizeSelector.tsx
│   │   └── QuantityInput.tsx
│   └── LeadForm.tsx
├── tables/
│   ├── columns/
│   │   └── leadsColumns.tsx
│   ├── filters/
│   │   └── LeadsFilters.tsx
│   ├── actions/
│   │   ├── BulkActions.tsx
│   │   └── RowActions.tsx
│   └── LeadsTable.tsx
├── dialogs/
│   ├── creation/
│   │   └── LeadCreationDialog.tsx
│   ├── details/
│   │   └── LeadDetailsDialog.tsx
│   └── confirmation/
│       └── DeleteLeadDialog.tsx
├── sheets/
│   └── creation/
│       └── AddLeadSheet.tsx
├── buttons/
│   └── actions/
│       └── AddLeadButton.tsx
└── flows/
    └── LeadCreationFlow.tsx
```

### Phase 2: Products Feature Reorganization

**Priority: High** - Complex feature with mixed responsibilities

#### Current Structure Issues:

- `ProductDetails.tsx` (248 lines) - Multiple responsibilities
- All components in flat structure
- Mixed form and display components

#### Proposed Structure:

```
src/features/products/presentation/components/
├── forms/
│   ├── ProductForm.tsx
│   ├── ItemForm.tsx
│   └── ImagesForm.tsx
├── tables/
│   ├── columns/
│   │   └── productsColumns.tsx
│   ├── filters/
│   │   └── ProductsFilters.tsx
│   └── ProductsTable.tsx
├── dialogs/
│   └── details/
│       └── ProductDetailsDialog.tsx
├── sheets/
│   ├── creation/
│   │   └── AddProductSheet.tsx
│   ├── editing/
│   │   ├── AddItemSheet.tsx
│   │   └── AddImagesSheet.tsx
│   └── details/
│       └── ProductDetailsSheet.tsx
├── cards/
│   ├── summary/
│   │   └── ProductSummaryCard.tsx
│   └── details/
│       ├── ProductInfoCard.tsx
│       ├── ProductPricingCard.tsx
│       └── ProductGalleryCard.tsx
├── buttons/
│   └── actions/
│       └── AddProductButton.tsx
└── details/
    └── ProductDetails.tsx (refactored)
```

### Phase 3: Orders Feature Reorganization

**Priority: Medium** - Simpler structure but needs consistency

#### Proposed Structure:

```
src/features/orders/presentation/components/
├── tables/
│   ├── columns/
│   │   └── ordersColumns.tsx
│   ├── filters/
│   │   └── OrdersFilters.tsx
│   └── OrdersTable.tsx
├── dialogs/
│   ├── details/
│   │   └── OrderDetailsDialog.tsx
│   └── tracking/
│       └── OrderTrackingDialog.tsx
├── cards/
│   └── details/
│       └── OrderDetails.tsx
```

### Phase 4: Other Features

**Priority: Low** - Apply consistent patterns

#### Parcels, Partners, Payouts:

- Apply similar organizational patterns
- Create consistent subdirectory structure
- Separate concerns properly

## Component Breakdown Strategy

### Large Component Decomposition

#### 1. ItemsSection.tsx (386 lines) → Multiple Components

```
forms/sections/items/
├── ItemsSection.tsx (main container)
├── ItemRow.tsx (individual item row)
├── ProductSelector.tsx
├── ColorSelector.tsx
├── SizeSelector.tsx
├── QuantityInput.tsx
├── PriceDisplay.tsx
└── DiscountControls.tsx
```

#### 2. LeadsTable.tsx (297 lines) → Separated Concerns

```
tables/
├── LeadsTable.tsx (main container)
├── filters/LeadsFilters.tsx
├── actions/BulkActions.tsx
├── actions/RowActions.tsx
└── columns/leadsColumns.tsx
```

#### 3. ProductDetails.tsx (248 lines) → Card-based Structure

```
details/
├── ProductDetails.tsx (main container)
└── cards/
    ├── ProductInfoCard.tsx
    ├── ProductPricingCard.tsx
    └── ProductGalleryCard.tsx
```

## Benefits of This Organization

### 1. **Improved Maintainability**

- Smaller, focused components
- Clear separation of concerns
- Easier to locate and modify specific functionality

### 2. **Better Reusability**

- Form fields can be reused across different forms
- Table components can be shared
- Consistent patterns across features

### 3. **Enhanced Developer Experience**

- Predictable file locations
- Clear component hierarchy
- Easier onboarding for new developers

### 4. **Scalability**

- Easy to add new components in appropriate locations
- Consistent patterns for future features
- Better code organization as features grow

## Implementation Guidelines

### 1. **Component Size Limits**

- Form sections: Max 150 lines
- Table components: Max 200 lines
- Dialog/Sheet components: Max 100 lines
- Card components: Max 100 lines

### 2. **Naming Conventions**

- Use descriptive, specific names
- Include component type in name (Card, Dialog, Sheet, etc.)
- Group related components with consistent prefixes

### 3. **Import/Export Strategy**

- Use barrel exports (index.ts files)
- Group related exports logically
- Maintain clean import paths

### 4. **File Organization Rules**

- One component per file
- Related components in subdirectories
- Consistent directory structure across features
- Clear separation between different component types

## Migration Strategy

### 1. **Gradual Migration**

- Start with most complex features (Leads, Products)
- Maintain backward compatibility during transition
- Update imports incrementally

### 2. **Testing Strategy**

- Ensure all existing tests continue to pass
- Add tests for new component structure
- Verify functionality after each migration phase

### 3. **Documentation Updates**

- Update component documentation
- Create migration guides
- Update development guidelines

This organization plan will significantly improve the maintainability, scalability, and developer experience of the codebase while maintaining all existing functionality.
