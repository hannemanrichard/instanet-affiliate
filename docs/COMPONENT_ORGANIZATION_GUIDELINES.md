# Component Organization Guidelines

## Overview

This document outlines the standardized component organization patterns implemented across all features in the Referio platform. These guidelines ensure consistency, maintainability, and scalability across the entire codebase.

## Standard Feature Presentation Structure

Every feature should follow this consistent directory structure:

```
src/features/{feature}/presentation/
├── components/
│   ├── forms/                    # Form components
│   │   ├── fields/              # Reusable form field components
│   │   ├── sections/            # Form section components
│   │   ├── validation/          # Form validation components
│   │   ├── {Feature}Form.tsx    # Main form component
│   │   └── index.ts             # Form exports
│   ├── tables/                  # Table components
│   │   ├── columns/             # Table column definitions
│   │   ├── filters/             # Table filter components
│   │   ├── actions/             # Table action components
│   │   ├── {Feature}Table.tsx   # Main table component
│   │   └── index.ts             # Table exports
│   ├── dialogs/                 # Dialog components
│   │   ├── creation/            # Creation dialog components
│   │   ├── details/             # Details dialog components
│   │   ├── confirmation/        # Confirmation dialog components
│   │   ├── tracking/            # Tracking dialog components (if applicable)
│   │   └── index.ts             # Dialog exports
│   ├── sheets/                  # Sheet components
│   │   ├── creation/            # Creation sheet components
│   │   ├── editing/             # Editing sheet components
│   │   ├── details/             # Details sheet components
│   │   └── index.ts             # Sheet exports
│   ├── cards/                   # Card components
│   │   ├── summary/             # Summary card components
│   │   ├── details/             # Details card components
│   │   ├── preview/             # Preview card components
│   │   └── index.ts             # Card exports
│   ├── buttons/                 # Button components
│   │   ├── actions/             # Action button components
│   │   ├── navigation/          # Navigation button components
│   │   └── index.ts             # Button exports
│   ├── flows/                   # Multi-step flow components
│   │   └── index.ts             # Flow exports
│   └── index.ts                 # Main component exports
├── hooks/                       # Feature-specific presentation hooks
├── utils/                       # Feature-specific presentation utilities
└── index.ts                     # Feature presentation exports
```

## Component Size Guidelines

### Maximum Component Sizes

- **Form sections**: 150 lines
- **Table components**: 200 lines
- **Dialog/Sheet components**: 100 lines
- **Card components**: 100 lines
- **Button components**: 50 lines
- **Field components**: 75 lines

### When to Break Down Components

Break down components when they:

- Exceed size limits
- Handle multiple responsibilities
- Contain complex business logic
- Have multiple conditional rendering paths
- Mix UI and business logic concerns

## Naming Conventions

### File Naming

- Use PascalCase for component files: `ProductDetails.tsx`
- Use descriptive names that indicate component type: `ProductPricingCard.tsx`
- Include component type in name when helpful: `AddProductSheet.tsx`

### Directory Naming

- Use lowercase with hyphens for directories: `product-details/`
- Use descriptive names: `creation/`, `details/`, `confirmation/`
- Group by functionality: `forms/`, `tables/`, `dialogs/`

### Component Naming

- Use PascalCase for component names: `ProductDetails`
- Use descriptive names: `ProductPricingCard`
- Include component type when helpful: `AddProductSheet`

## Import/Export Strategy

### Barrel Exports

Use barrel exports (`index.ts` files) to create clean import paths:

```typescript
// components/forms/index.ts
export { ProductForm } from "./ProductForm";
export { ItemForm } from "./ItemForm";
export * from "./fields";
export * from "./sections";

// Usage
import { ProductForm, ProductSelector } from "@/features/products/presentation";
```

### Export Organization

Organize exports alphabetically within each category:

```typescript
// Main feature index.ts
// Cards
export * from "./components/cards";

// Dialogs
export * from "./components/dialogs";

// Forms
export * from "./components/forms";

// Tables
export * from "./components/tables";
```

## Component Breakdown Patterns

### Large Form Components

Break down large form components into:

- **Form sections**: Logical groupings of related fields
- **Form fields**: Individual reusable field components
- **Form validation**: Validation-specific components

Example:

```
forms/
├── LeadForm.tsx (main container)
├── sections/
│   ├── CustomerInfoSection.tsx
│   ├── ItemsSection.tsx
│   └── OrderSummarySection.tsx
├── fields/
│   ├── ProductSelector.tsx
│   ├── ColorSelector.tsx
│   └── QuantityInput.tsx
└── index.ts
```

### Large Table Components

Break down large table components into:

- **Columns**: Column definition components
- **Filters**: Filter-specific components
- **Actions**: Action-specific components

Example:

```
tables/
├── LeadsTable.tsx (main container)
├── columns/
│   └── leadsColumns.tsx
├── filters/
│   └── LeadsFilters.tsx
├── actions/
│   ├── BulkActions.tsx
│   └── RowActions.tsx
└── index.ts
```

### Large Detail Components

Break down large detail components into:

- **Info cards**: Basic information display
- **Pricing cards**: Pricing information display
- **Gallery cards**: Media display components

Example:

```
cards/
├── details/
│   ├── ProductInfoCard.tsx
│   ├── ProductPricingCard.tsx
│   └── ProductGalleryCard.tsx
└── index.ts
```

## Separation of Concerns

### UI vs Business Logic

- **UI Components**: Handle presentation and user interaction
- **Business Logic**: Handle data processing and validation
- **Hooks**: Encapsulate business logic and state management

### Component Responsibilities

Each component should have a single, clear responsibility:

- **Form fields**: Handle input and validation
- **Cards**: Display specific information
- **Dialogs**: Handle modal interactions
- **Tables**: Display and manage tabular data

## Reusability Guidelines

### Reusable Components

Create reusable components for:

- Common form fields
- Standard card layouts
- Shared dialog patterns
- Common button styles

### Component Props

Design components with clear, minimal props:

```typescript
interface ProductSelectorProps {
  form: UseFormReturn<ProductFormValues>;
  index: number;
  products: Product[];
  onProductChange: (productId: string, index: number) => void;
}
```

## Migration Strategy

### Gradual Migration

1. Start with most complex features (Leads, Products)
2. Maintain backward compatibility during transition
3. Update imports incrementally
4. Test functionality after each migration phase

### Testing Strategy

- Ensure all existing tests continue to pass
- Add tests for new component structure
- Verify functionality after each migration phase

## Benefits of This Organization

### Maintainability

- Smaller, focused components are easier to understand and modify
- Clear separation of concerns reduces complexity
- Predictable file locations improve developer experience

### Reusability

- Form fields can be reused across different forms
- Card components can be shared across different views
- Consistent patterns enable component sharing

### Scalability

- Easy to add new components in appropriate locations
- Consistent patterns for future features
- Better code organization as features grow

### Developer Experience

- Predictable file locations
- Clear component hierarchy
- Easier onboarding for new developers
- Consistent patterns across features

## Implementation Examples

### Leads Feature (Complex)

```
src/features/leads/presentation/components/
├── forms/
│   ├── fields/           # 9 reusable field components
│   ├── sections/         # 6 form section components
│   └── LeadForm.tsx      # Main form (114 lines → 89 lines)
├── tables/
│   ├── columns/          # Column definitions
│   ├── filters/          # Filter components
│   ├── actions/          # Bulk and row actions
│   └── LeadsTable.tsx    # Main table (297 lines → 255 lines)
├── dialogs/
│   ├── creation/         # Creation dialogs
│   ├── details/          # Details dialogs
│   └── confirmation/     # Confirmation dialogs
└── ...
```

### Products Feature (Complex)

```
src/features/products/presentation/components/
├── cards/
│   ├── details/          # 3 focused card components
│   └── summary/          # Summary components
├── forms/                # Form components
├── tables/               # Table components
├── sheets/               # Sheet components
└── ProductDetails.tsx    # Main details (248 lines → 65 lines)
```

### Orders Feature (Simple)

```
src/features/orders/presentation/components/
├── tables/
│   ├── columns/          # Column definitions
│   ├── filters/          # Filter components
│   └── OrdersTable.tsx   # Main table
├── dialogs/
│   ├── details/          # Details dialogs
│   └── tracking/         # Tracking dialogs
└── cards/
    └── details/          # Details cards
```

## Conclusion

This standardized component organization provides a solid foundation for maintaining and scaling the Referio platform. By following these guidelines, developers can:

- Quickly locate and understand components
- Easily add new features following established patterns
- Maintain consistency across the entire codebase
- Improve code quality and developer experience

The organization has been successfully implemented across all major features (Leads, Products, Orders, Parcels, Partners, Payouts) and serves as a template for future development.
