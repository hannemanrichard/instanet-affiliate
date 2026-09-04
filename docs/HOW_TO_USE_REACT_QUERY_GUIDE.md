# 🚀 **How to Use React Query Implementation Guide with AI Cursor**

## **Complete Step-by-Step Guide for Implementing React Query Patterns in Your Project**

---

## 📋 **Table of Contents**

1. [Pre-Implementation Setup](#1-pre-implementation-setup)
2. [AI Cursor Configuration](#2-ai-cursor-configuration)
3. [Step-by-Step Implementation Process](#3-step-by-step-implementation-process)
4. [AI Cursor Commands & Prompts](#4-ai-cursor-commands--prompts)
5. [Troubleshooting & Best Practices](#5-troubleshooting--best-practices)
6. [Project-Specific Adaptations](#6-project-specific-adaptations)

---

## 1. **Pre-Implementation Setup**

### **1.1 Prepare Your Project**

```bash
# 1. Install React Query dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools

# 2. Install additional dependencies (if not already installed)
npm install @types/node typescript
npm install react-hook-form zod @hookform/resolvers
npm install @radix-ui/react-toast # for toast notifications
```

### **1.2 Copy the Implementation Guide**

```bash
# Copy the guide to your project root
cp REACT_QUERY_IMPLEMENTATION_GUIDE.md ./your-project/

# Or download from the original source
# The guide should be in your project directory for easy reference
```

### **1.3 Project Structure Preparation**

Ensure your project has this basic structure:

```
your-project/
├── src/
│   ├── shared/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   └── providers/
│   │   ├── utils/
│   │   └── test-utils/
│   ├── features/
│   └── app/
├── REACT_QUERY_IMPLEMENTATION_GUIDE.md
└── package.json
```

---

## 2. **AI Cursor Configuration**

### **2.1 Enable AI Cursor Features**

1. **Open AI Cursor** in your project directory
2. **Enable AI Features**:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Cursor: Enable AI Features"
   - Select and enable

3. **Configure AI Settings**:
   - Go to Settings → AI
   - Enable "Auto-complete"
   - Enable "Code Generation"
   - Set context window to "Large" for better understanding

### **2.2 Create AI Cursor Context**

Create a `.cursorrules` file in your project root:

```markdown
# Cursor AI Rules for React Query Implementation

## Project Context

This project is implementing React Query patterns based on the comprehensive guide in REACT_QUERY_IMPLEMENTATION_GUIDE.md.

## Key Requirements

- Follow the exact patterns from the implementation guide
- Use TypeScript with proper type safety
- Implement clean architecture principles
- Add comprehensive error handling
- Include optimistic updates where appropriate
- Write tests for all hooks and components
- Use consistent naming conventions

## File Structure

- Follow the established file structure from the guide
- Place shared hooks in src/shared/hooks/
- Place providers in src/shared/lib/providers/
- Place utilities in src/shared/utils/
- Place feature hooks in src/features/[feature]/application/

## Code Standards

- Use const instead of functions
- Implement accessibility features
- Follow DRY principles
- Add comprehensive error handling
- Use proper TypeScript types
- Write unit tests for every function

## Reference

Always refer to REACT_QUERY_IMPLEMENTATION_GUIDE.md for exact patterns and implementations.
```

---

## 3. **Step-by-Step Implementation Process**

### **Step 1: Core Infrastructure Setup**

#### **3.1.1 Create React Query Provider**

**AI Cursor Command:**

```
@cursor Create the React Query provider following the exact pattern from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 1.1. Use TypeScript and include all the optimal defaults from the guide.
```

**Expected Result:**

- File: `src/shared/lib/providers/react-query.tsx`
- Contains QueryClient with optimal configuration
- Includes ReactQueryDevtools

#### **3.1.2 Update Root Layout**

**AI Cursor Command:**

```
@cursor Update the root layout to include the ReactQueryProvider following the pattern from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 1.2. Ensure proper provider wrapping order.
```

### **Step 2: Standardized Hook Patterns**

#### **3.2.1 Create Core Hooks**

**AI Cursor Command:**

```
@cursor Create the standardized React Query hooks file following the exact patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 2.1. Include useStandardQuery, useStandardMutation, useOptimisticMutation, usePaginatedQuery, and useInfiniteQueryHook with all the features from the guide.
```

**Expected Result:**

- File: `src/shared/hooks/useReactQuery.ts`
- Contains all standardized hooks
- Includes proper TypeScript types
- Has comprehensive error handling

### **Step 3: Query Key Management**

#### **3.3.1 Create Query Keys System**

**AI Cursor Command:**

```
@cursor Create the query key management system following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 3. Include QUERY_KEYS and INVALIDATION_PATTERNS. Adapt the keys to match my project's features: [list your features here].
```

**Example for E-commerce:**

```
@cursor Create the query key management system following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 3. Include QUERY_KEYS and INVALIDATION_PATTERNS. Adapt the keys to match my project's features: products, orders, customers, categories, cart, payments.
```

### **Step 4: Feature Implementation**

#### **3.4.1 Create Feature-Specific Hooks**

**AI Cursor Command:**

```
@cursor Create feature-specific hooks for [FEATURE_NAME] following the patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 5. Include CRUD operations, optimistic updates, and proper error handling. Use the standardized hooks from useReactQuery.ts.
```

**Example:**

```
@cursor Create feature-specific hooks for products following the patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 5. Include CRUD operations, optimistic updates, and proper error handling. Use the standardized hooks from useReactQuery.ts.
```

### **Step 5: Testing Implementation**

#### **3.5.1 Create Test Utilities**

**AI Cursor Command:**

```
@cursor Create React Query test utilities following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 7.1. Include renderWithQueryClient and createMockQueryClient functions with proper Jest configuration.
```

#### **3.5.2 Create Feature Tests**

**AI Cursor Command:**

```
@cursor Create comprehensive tests for the [FEATURE_NAME] hooks following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 7.2. Include success cases, error handling, and optimistic updates testing.
```

---

## 4. **AI Cursor Commands & Prompts**

### **4.1 Quick Implementation Commands**

#### **Full Implementation Command:**

```
@cursor Implement the complete React Query setup following REACT_QUERY_IMPLEMENTATION_GUIDE.md. Start with core infrastructure, then create standardized hooks, query key management, and implement for my features: [list features]. Include testing setup and ensure TypeScript compatibility.
```

#### **Migration from useAsyncOperation:**

```
@cursor Migrate my existing useAsyncOperation patterns to React Query following REACT_QUERY_IMPLEMENTATION_GUIDE.md migration section. Replace all useAsyncOperation usage with React Query equivalents, update loading states, and implement optimistic updates.
```

#### **Feature-Specific Implementation:**

```
@cursor Implement React Query for [FEATURE_NAME] feature following REACT_QUERY_IMPLEMENTATION_GUIDE.md patterns. Create CRUD hooks, optimistic updates, error handling, and comprehensive tests. Use the standardized patterns from the guide.
```

### **4.2 Specific Pattern Commands**

#### **Optimistic Updates:**

```
@cursor Implement optimistic updates for [FEATURE_NAME] following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 4. Include proper rollback mechanisms and error handling.
```

#### **Error Handling:**

```
@cursor Implement comprehensive error handling following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 6.1. Include toast notifications and proper error boundaries.
```

#### **Performance Optimization:**

```
@cursor Implement performance optimizations following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 6.2. Include prefetching, cache management, and proper staleTime configuration.
```

### **4.3 Testing Commands**

#### **Test Setup:**

```
@cursor Set up comprehensive testing for React Query hooks following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 7. Include mock utilities, test wrappers, and example test cases.
```

#### **Feature Testing:**

```
@cursor Create tests for [FEATURE_NAME] hooks following the testing patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md. Test success cases, error scenarios, and optimistic updates.
```

---

## 5. **Troubleshooting & Best Practices**

### **5.1 Common Issues & Solutions**

#### **Issue: AI Cursor Not Understanding Context**

**Solution:**

```
@cursor Please read the REACT_QUERY_IMPLEMENTATION_GUIDE.md file and understand the patterns. Then implement [specific feature] following the exact patterns from the guide.
```

#### **Issue: TypeScript Errors**

**Solution:**

```
@cursor Fix TypeScript errors in the React Query implementation. Ensure all types are properly defined following the patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md. Use proper generic types for hooks.
```

#### **Issue: Testing Setup Problems**

**Solution:**

```
@cursor Fix the testing setup for React Query hooks. Follow the exact testing patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md section 7. Ensure proper mocking and test utilities.
```

### **5.2 Best Practices**

#### **5.2.1 Provide Clear Context**

Always reference the guide when giving commands:

```
@cursor Following REACT_QUERY_IMPLEMENTATION_GUIDE.md section [X], implement [specific feature] with [specific requirements].
```

#### **5.2.2 Be Specific About Requirements**

```
@cursor Create useProducts hook following REACT_QUERY_IMPLEMENTATION_GUIDE.md section 5.3. Include: getProducts, getProductById, createProduct, updateProduct, deleteProduct with optimistic updates and proper error handling.
```

#### **5.2.3 Iterate and Refine**

```
@cursor Review the current React Query implementation and improve it following REACT_QUERY_IMPLEMENTATION_GUIDE.md best practices. Add missing features, fix any issues, and ensure consistency with the guide patterns.
```

---

## 6. **Project-Specific Adaptations**

### **6.1 E-commerce Project**

```
@cursor Adapt the React Query patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md for an e-commerce project. Create hooks for: products, categories, cart, orders, customers, payments. Include inventory management, price updates, and order tracking with optimistic updates.
```

### **6.2 SaaS Dashboard Project**

```
@cursor Adapt the React Query patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md for a SaaS dashboard. Create hooks for: users, subscriptions, analytics, settings, notifications. Include real-time updates, role-based access, and comprehensive error handling.
```

### **6.3 Blog/CMS Project**

```
@cursor Adapt the React Query patterns from REACT_QUERY_IMPLEMENTATION_GUIDE.md for a blog/CMS project. Create hooks for: posts, categories, tags, comments, media. Include draft management, publishing workflow, and search functionality.
```

### **6.4 Migration from Existing Patterns**

#### **From Redux:**

```
@cursor Migrate Redux data fetching to React Query following REACT_QUERY_IMPLEMENTATION_GUIDE.md. Replace Redux actions with React Query hooks, maintain state management, and implement optimistic updates.
```

#### **From SWR:**

```
@cursor Migrate SWR to React Query following REACT_QUERY_IMPLEMENTATION_GUIDE.md. Convert SWR hooks to React Query equivalents, update cache keys, and implement the standardized patterns from the guide.
```

#### **From Apollo Client:**

```
@cursor Migrate Apollo Client to React Query following REACT_QUERY_IMPLEMENTATION_GUIDE.md. Convert GraphQL queries to REST API calls with React Query, maintain caching strategies, and implement optimistic updates.
```

---

## 🎯 **Quick Start Checklist**

### **Phase 1: Setup (Day 1)**

- [ ] Copy REACT_QUERY_IMPLEMENTATION_GUIDE.md to project
- [ ] Install React Query dependencies
- [ ] Create .cursorrules file
- [ ] Set up basic project structure

### **Phase 2: Core Implementation (Day 2-3)**

- [ ] Implement React Query Provider
- [ ] Create standardized hooks
- [ ] Set up query key management
- [ ] Update root layout

### **Phase 3: Feature Implementation (Day 4-7)**

- [ ] Implement feature-specific hooks
- [ ] Add optimistic updates
- [ ] Implement error handling
- [ ] Add performance optimizations

### **Phase 4: Testing & Refinement (Day 8-10)**

- [ ] Set up testing utilities
- [ ] Write comprehensive tests
- [ ] Fix any issues
- [ ] Optimize performance

### **Phase 5: Migration & Cleanup (Day 11-14)**

- [ ] Migrate existing patterns
- [ ] Remove old code
- [ ] Update documentation
- [ ] Final testing

---

## 📚 **Additional Resources**

### **AI Cursor Shortcuts:**

- `Ctrl+Shift+P` → Open Command Palette
- `@cursor` → AI Command Mode
- `Ctrl+K` → AI Edit Mode
- `Ctrl+L` → AI Chat Mode

### **Useful Commands:**

```
@cursor Explain this React Query implementation
@cursor Optimize this React Query code
@cursor Add error handling to this hook
@cursor Create tests for this React Query hook
@cursor Migrate this useAsyncOperation to React Query
```

---

## 🚀 **Success Tips**

1. **Start Small**: Begin with one feature and expand
2. **Follow the Guide**: Always reference the implementation guide
3. **Test Thoroughly**: Write tests as you implement
4. **Iterate**: Use AI Cursor to refine and improve
5. **Document**: Keep track of changes and decisions
6. **Optimize**: Use AI Cursor to optimize performance

---

**Ready to implement? Start with the Quick Start Checklist and use the AI Cursor commands above to get your React Query implementation up and running!** 🎯
