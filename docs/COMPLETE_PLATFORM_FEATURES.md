# 🎯 Complete Platform Features - Referio Affiliate Marketing Platform

## Overview

**Referio** is a comprehensive affiliate marketing platform for print-on-demand products. This document provides a complete list of all features and capabilities across all 12 feature modules.

---

## 📦 Core Features (12 Feature Modules)

### 1. **Affiliates** (`src/features/affiliates/`)

**Purpose**: Manage affiliate partners who promote and sell products

**Capabilities**:
- ✅ **Profile Management**
  - Create, update, and delete affiliate profiles
  - Customize profiles (bio, avatar, background image)
  - Social media links (Instagram, LinkedIn, TikTok)
  - Personal information (name, email, username, birthdate, gender)
  
- ✅ **Status Management**
  - Active, inactive, suspended statuses
  - Status filtering and search
  
- ✅ **Search & Discovery**
  - Search affiliates by name, email, username
  - Filter by status, referral source
  - Get affiliate by ID
  
- ✅ **Integration**
  - Clerk authentication integration
  - Links to orders, commissions, analytics

**React Hooks**: `useAffiliates`, `useAffiliate`, `useCreateAffiliate`, `useUpdateAffiliate`, `useDeleteAffiliate`

---

### 2. **Orders** (`src/features/orders/`)

**Purpose**: Manage customer orders from affiliates

**Capabilities**:
- ✅ **Order Management**
  - Create, update, delete orders
  - Order status tracking (pending, processing, shipped, delivered, cancelled, returned)
  - Order number generation
  - Order notes and metadata
  
- ✅ **Order Items**
  - Add/remove order items
  - Link items to product designs
  - Link items to physical printed inventory (printed_product_id)
  - Quantity and pricing management
  
- ✅ **Customer Information**
  - Customer name, phone, email
  - Shipping address (address, city, state/province)
  - Customer contact management
  
- ✅ **Shipping & Delivery**
  - Shipping cost calculation
  - Delivery company tracking
  - Tracking number management
  - Staff tracking (shipped_by, shipped_at)
  
- ✅ **Financial**
  - Order total calculation
  - Discount amount tracking
  - Shipping cost management
  
- ✅ **Filtering & Search**
  - Filter by affiliate
  - Filter by status
  - Filter by date range
  - Filter by shipped by staff member
  - Get orders with items (detailed view)

**React Hooks**: `useOrders`, `useOrder`, `useOrdersByAffiliate`, `useOrdersByStatus`, `useCreateOrder`, `useUpdateOrder`, `useDeleteOrder`

---

### 3. **Products** (`src/features/products/`)

**Purpose**: Manage product catalog, designs, and product combinations

**Capabilities**:

#### 3.1 **Product Templates**
- ✅ Create, update, delete product templates (base products like T-shirt, Hoodie, Mug)
- ✅ Template details (name, description, category, base price)
- ✅ Active/inactive status management
- ✅ Get all templates or active templates only

#### 3.2 **Products**
- ✅ Create, update, delete products (specific products with templates)
- ✅ Link products to templates
- ✅ Product details (name, description, pricing)
- ✅ Active/inactive status
- ✅ Get products by template
- ✅ Get product with template details

#### 3.3 **Product Sizes**
- ✅ Create, update, delete product sizes
- ✅ Size management per product
- ✅ Sort order for sizes
- ✅ Delete all sizes for a product

#### 3.4 **Designs**
- ✅ Create, update, delete designs (artwork/designs)
- ✅ Design details (title, description, design file URL, thumbnail)
- ✅ Design categories and tags
- ✅ Print areas configuration
- ✅ Public/featured status
- ✅ Get public designs
- ✅ Get featured designs
- ✅ Get designs by creator

#### 3.5 **Product Designs**
- ✅ Create, update, delete product designs (product + design combinations)
- ✅ Product design details (name, description, price, print placement)
- ✅ Design gallery URLs
- ✅ Active/inactive status
- ✅ Featured status
- ✅ Get active product designs
- ✅ Get featured product designs
- ✅ Get recently added product designs (with date filtering)
- ✅ Get product designs by product ID
- ✅ Get product designs by design ID
- ✅ Get product design with full details (product + design info)

**React Hooks**: 
- Templates: `useProductTemplates`, `useProductTemplate`, `useActiveProductTemplates`
- Products: `useProducts`, `useProduct`, `useProductsByTemplate`, `useActiveProducts`
- Sizes: `useProductSizes`, `useProductSizesByProduct`
- Designs: `useDesigns`, `useDesign`, `usePublicDesigns`, `useFeaturedDesigns`
- Product Designs: `useProductDesigns`, `useProductDesign`, `useActiveProductDesigns`, `useFeaturedProductDesigns`, `useRecentlyAddedProductDesigns`

---

### 4. **Payouts** (`src/features/payouts/`)

**Purpose**: Manage commissions and affiliate payouts

**Capabilities**:

#### 4.1 **Commissions**
- ✅ Create, update, delete commissions
- ✅ Commission calculation (order amount × commission rate)
- ✅ Commission status (pending, paid, cancelled)
- ✅ Link commissions to orders and affiliates
- ✅ Commission amount and rate tracking
- ✅ Get commissions by affiliate
- ✅ Get commissions by order
- ✅ Get commissions by status
- ✅ Get pending commissions
- ✅ Get paid commissions
- ✅ Commission validation

#### 4.2 **Withdrawals**
- ✅ Create, update, delete withdrawal requests
- ✅ Withdrawal status (pending, approved, rejected, paid)
- ✅ Withdrawal amount tracking
- ✅ Link withdrawals to affiliates
- ✅ Get withdrawals by affiliate
- ✅ Get withdrawals by status
- ✅ Withdrawal validation

#### 4.3 **Payouts**
- ✅ Create, update, delete payouts
- ✅ Payout status tracking
- ✅ Link payouts to withdrawals
- ✅ Payout amount tracking
- ✅ Get payouts by affiliate
- ✅ Get payouts by status

**React Hooks**: 
- Commissions: `useCommissions`, `useCommission`, `useCommissionsByAffiliate`, `useCommissionsByOrder`, `useCommissionsByStatus`
- Withdrawals: `useWithdrawals`, `useWithdrawal`, `useWithdrawalsByAffiliate`, `useWithdrawalsByStatus`
- Payouts: `usePayouts`, `usePayout`, `usePayoutsByAffiliate`, `usePayoutsByStatus`

---

### 5. **Gamification** (`src/features/gamification/`)

**Purpose**: Engage and motivate affiliates through game-like mechanics

**Capabilities**:

#### 5.1 **XP (Experience Points)**
- ✅ Award XP for activities (orders, course completions, referrals)
- ✅ XP event logging
- ✅ Total XP tracking per affiliate
- ✅ XP history

#### 5.2 **Levels**
- ✅ Level progression based on XP
- ✅ Level thresholds configuration
- ✅ Automatic level calculation
- ✅ Level benefits

#### 5.3 **Badges**
- ✅ Badge creation and management
- ✅ Badge types (milestone, level, activity)
- ✅ Badge rarity (common, rare, epic, legendary)
- ✅ Automatic badge awarding
- ✅ Badge requirements tracking
- ✅ Get badges by affiliate
- ✅ Get earned badges

#### 5.4 **Quests**
- ✅ Quest creation and management
- ✅ Quest types (daily, weekly, special)
- ✅ Quest requirements and rewards
- ✅ Quest progress tracking
- ✅ Quest completion
- ✅ Get active quests
- ✅ Get quests by affiliate

#### 5.5 **Streaks**
- ✅ Streak tracking (daily activity)
- ✅ Streak maintenance
- ✅ Streak bonuses
- ✅ Streak history

#### 5.6 **Leaderboards**
- ✅ Global leaderboard
- ✅ Weekly leaderboard
- ✅ Monthly leaderboard
- ✅ Leaderboard caching
- ✅ Rank calculation

#### 5.7 **Bonuses**
- ✅ XP bonuses
- ✅ Commission bonuses
- ✅ Bonus awarding
- ✅ Bonus history

**React Hooks**: `useXP`, `useLevels`, `useBadges`, `useQuests`, `useStreaks`, `useLeaderboard`, `useBonuses`

---

### 6. **Courses** (`src/features/courses/`)

**Purpose**: Educational content for affiliates

**Capabilities**:

#### 6.1 **Courses**
- ✅ Create, update, delete courses
- ✅ Course details (title, description, thumbnail)
- ✅ Course status (draft, published, archived)
- ✅ Course order/sorting

#### 6.2 **Course Modules**
- ✅ Create, update, delete modules
- ✅ Module details (title, description, order)
- ✅ Link modules to courses

#### 6.3 **Course Videos**
- ✅ Create, update, delete videos
- ✅ Video details (title, description, video URL, duration)
- ✅ Link videos to modules
- ✅ Video order/sorting

#### 6.4 **Enrollments**
- ✅ Enroll affiliates in courses
- ✅ Enrollment status tracking
- ✅ Get enrollments by affiliate
- ✅ Get enrollments by course

#### 6.5 **Progress Tracking**
- ✅ Course progress tracking
- ✅ Video progress tracking
- ✅ Completion percentage
- ✅ Last accessed tracking

#### 6.6 **Completions**
- ✅ Course completion tracking
- ✅ Completion date
- ✅ Get completed courses by affiliate

#### 6.7 **Analytics**
- ✅ Course analytics
- ✅ Enrollment statistics
- ✅ Completion rates

**React Hooks**: `useCourses`, `useCourse`, `useCourseModules`, `useCourseVideos`, `useEnrollments`, `useCourseProgress`, `useVideoProgress`, `useCourseCompletions`

---

### 7. **Analytics** (`src/features/analytics/`)

**Purpose**: Provide insights and metrics for affiliates and platform

**Capabilities**:

#### 7.1 **Affiliate Analytics**
- ✅ Comprehensive affiliate statistics
- ✅ Order metrics (total, delivered, cancelled, pending, processing, shipped, returned)
- ✅ Delivery rate calculation
- ✅ Cancel rate calculation
- ✅ Financial metrics (total revenue, total commissions, average order value, average commission)
- ✅ Pending vs paid commissions
- ✅ Time period filtering (today, week, month, custom date range)

#### 7.2 **Weekly Revenue**
- ✅ Daily revenue breakdown for a week
- ✅ Revenue trends
- ✅ Date-based filtering

#### 7.3 **Top Products**
- ✅ Top performing products for affiliates
- ✅ Sort by order count or commission value
- ✅ Limit results
- ✅ Time period filtering

#### 7.4 **Trending Product Designs** ("On Fire")
- ✅ Identify trending product designs
- ✅ Metrics: order count, revenue, growth rate
- ✅ Compare current vs previous period
- ✅ Growth rate calculation
- ✅ Filter by minimum order count
- ✅ Sort by order count, revenue, or growth
- ✅ Period filtering (today, week, month)

#### 7.5 **High Commission Products** ("Double Commission")
- ✅ Identify high commission product designs
- ✅ Filter by physically printed inventory available for resale
- ✅ Return rate calculation
- ✅ Commission metrics
- ✅ Filter by minimum return count and commission threshold
- ✅ Sort by commission amount, return rate, or order count
- ✅ Period filtering (today, week, month)

**React Hooks**: `useAffiliateAnalytics`, `useWeeklyRevenue`, `useTopProducts`, `useTrendingProductDesigns`, `useHighCommissionProductDesigns`

---

### 8. **Inventory** (`src/features/inventory/`)

**Purpose**: Manage raw (blank) and physical printed inventory

**Capabilities**:

#### 8.1 **Raw Inventory** (Blank Products)
- ✅ Create, update, delete raw inventory
- ✅ Inventory details (product ID, size, quantity)
- ✅ Reserved quantity tracking
- ✅ Available quantity calculation (quantity - reserved_quantity)
- ✅ Reorder point tracking
- ✅ Cost per unit tracking
- ✅ Warehouse location tracking
- ✅ Get inventory by product ID
- ✅ Get inventory by product ID and size
- ✅ Reserve inventory
- ✅ Release reserved inventory
- ✅ Consume inventory (reserve + reduce quantity)

#### 8.2 **Physical Printed Inventory** (Printed Products)
- ✅ Create, update, delete physical printed inventory
- ✅ Inventory details (product design ID, size, SKU, batch number)
- ✅ Status tracking (printed, reserved, available, shipped, delivered, returned, damaged)
- ✅ Condition tracking
- ✅ Quality check tracking (passed, notes, checked by, checked at)
- ✅ Warehouse and shelf location tracking
- ✅ Cost tracking (COGS, print cost, material cost)
- ✅ Return tracking (reason, can resell, resale price)
- ✅ Staff tracking (printed_by, packaged_by, quality_checked_by)
- ✅ Timestamp tracking (printed_at, packaged_at, delivered_at, returned_at)
- ✅ Get inventory by product design ID
- ✅ Get inventory by product design ID and size
- ✅ Get inventory by SKU
- ✅ Get inventory by status
- ✅ Get inventory by staff member
- ✅ Get available for resale inventory
- ✅ Get available count by product design and size
- ✅ Mark as reserved, available, shipped, returned
- ✅ Mark as resale eligible

**React Hooks**: 
- Raw: `useRawInventory`, `useRawInventoryByProductId`, `useRawInventoryByProductIdAndSize`, `useAvailableRawInventoryQuantity`, `useCreateRawInventory`, `useUpdateRawInventory`, `useReserveRawInventory`, `useReleaseRawInventory`, `useConsumeRawInventory`
- Physical: `usePhysicalPrintedInventory`, `usePhysicalPrintedInventoryByProductDesignId`, `usePhysicalPrintedInventoryBySku`, `usePhysicalPrintedInventoryByStatus`, `useAvailableForResaleInventory`, `useAvailablePhysicalPrintedInventoryCount`, `useCreatePhysicalPrintedInventory`, `useUpdatePhysicalPrintedInventory`

---

### 9. **Staff** (`src/features/staff/`)

**Purpose**: Manage fulfillment staff, admins, and moderators

**Capabilities**:

#### 9.1 **Staff Management**
- ✅ Create, update, delete staff members
- ✅ Staff details (name, email, clerk user ID, staff type, department)
- ✅ Staff types (fulfillment, admin, moderator)
- ✅ Staff status (active, inactive, suspended)
- ✅ Get staff by type
- ✅ Get staff by status
- ✅ Get staff by department
- ✅ Get staff by Clerk user ID

#### 9.2 **Permissions**
- ✅ Create, update, delete permissions
- ✅ Permission details (code, name, description, category)
- ✅ Permission categories (orders, inventory, products, staff, etc.)
- ✅ Get permissions by code
- ✅ Get permissions by category

#### 9.3 **Staff Permissions**
- ✅ Assign permissions to staff
- ✅ Revoke permissions
- ✅ Get active permissions by staff
- ✅ Get permissions with details
- ✅ Permission expiration (optional)

#### 9.4 **Shifts**
- ✅ Create, update, delete shifts
- ✅ Shift details (staff ID, start time, end time, status)
- ✅ Shift status (scheduled, active, completed, cancelled)
- ✅ Clock in/out functionality
- ✅ Get shifts by staff
- ✅ Get shifts by date range
- ✅ Get shifts by status
- ✅ Get active shift for staff member

#### 9.5 **Staff Activities**
- ✅ Log staff activities
- ✅ Activity types (order_created, inventory_updated, etc.)
- ✅ Related entity tracking (orders, inventory, etc.)
- ✅ Get activities by staff
- ✅ Get activities by shift
- ✅ Get activities by type
- ✅ Get activities by date range

**React Hooks**: 
- Staff: `useStaff`, `useAllStaff`, `useStaffByType`, `useStaffByStatus`, `useCreateStaff`, `useUpdateStaff`
- Permissions: `usePermissions`, `usePermission`, `usePermissionsByCategory`
- Staff Permissions: `useStaffPermissions`, `useActiveStaffPermissions`, `useAssignPermission`, `useRevokePermission`
- Shifts: `useShifts`, `useShift`, `useShiftsByStaff`, `useActiveShift`, `useCreateShift`, `useClockIn`, `useClockOut`
- Activities: `useStaffActivities`, `useCreateStaffActivity`

---

### 10. **Notifications** (`src/features/notifications/`)

**Purpose**: Send and manage notifications to users

**Capabilities**:
- ✅ Create, update, delete notifications
- ✅ Notification details (title, message, type, user ID)
- ✅ Notification types (order, commission, payout, system, etc.)
- ✅ Notification status (unread, read, archived)
- ✅ Get notifications by user
- ✅ Get notifications by type
- ✅ Get notifications by status
- ✅ Mark as read
- ✅ Mark as archived

**React Hooks**: `useNotifications`, `useNotification`, `useNotificationsByUser`, `useNotificationsByType`, `useCreateNotification`, `useMarkAsRead`

---

### 11. **Histories** (`src/features/histories/`)

**Purpose**: Track activity history and audit trail

**Capabilities**:
- ✅ Create history records
- ✅ History details (user ID, action type, entity type, entity ID, description)
- ✅ Get history by user
- ✅ Get history by entity type
- ✅ Get history by date range
- ✅ Pagination support
- ✅ Filtering and sorting

**React Hooks**: `useHistories`, `useHistoriesByUser`, `useHistoriesByEntity`, `useCreateHistory`

---

### 12. **Cart** (Referenced in codebase)

**Purpose**: Shopping cart functionality

**Capabilities**:
- ✅ Cart management
- ✅ Cart items management
- ✅ Cart validation
- ✅ Cart total calculation

---

## 🔧 Technical Features

### **Architecture**
- ✅ Clean Architecture (Domain, Data, Application, Presentation layers)
- ✅ Feature-based organization (12 independent features)
- ✅ Dependency injection
- ✅ Repository pattern
- ✅ Service layer orchestration

### **Data Layer**
- ✅ Database abstraction (`DatabaseWrapper`)
- ✅ Performance tracking for all queries
- ✅ Audit logging for mutations
- ✅ Type-safe database operations
- ✅ Soft delete support
- ✅ Error handling with custom error types

### **Application Layer**
- ✅ Business logic separation
- ✅ Validation (Zod schemas)
- ✅ Consistent error handling
- ✅ Service orchestration
- ✅ Transaction support (sequential)

### **Presentation Layer**
- ✅ React Query hooks for data fetching
- ✅ Standardized query/mutation patterns
- ✅ Cache management
- ✅ Loading and error states
- ✅ Optimistic updates

### **Testing**
- ✅ Comprehensive test coverage (1,034 tests, 99.6% pass rate)
- ✅ Data layer tests
- ✅ Application layer tests
- ✅ React hooks tests
- ✅ Consistent test patterns

---

## 📊 Business Workflows

### **Order Fulfillment Workflow**
1. Affiliate creates order → Order created with status "pending"
2. Order processed → Status changed to "processing"
3. Inventory reserved → Raw inventory reserved or physical inventory marked as reserved
4. Product printed → Physical printed inventory created with status "printed"
5. Quality checked → Inventory marked as quality checked
6. Packaged → Inventory marked as packaged
7. Shipped → Order status "shipped", inventory status "shipped", tracking number added
8. Delivered → Order status "delivered", inventory status "delivered"
9. Returned → Order status "returned", inventory status "returned", can_resell flag set

### **Commission Workflow**
1. Order created → Commission calculated
2. Commission created with status "pending"
3. Order delivered → Commission status remains "pending" (until payout)
4. Payout processed → Commission status changed to "paid"

### **Inventory Management Workflow**
1. Raw inventory added → Quantity available for printing
2. Order placed → Inventory reserved
3. Product printed → Physical printed inventory created
4. Quality checked → Inventory quality verified
5. Shipped → Inventory status updated
6. Returned → Inventory marked for resale (if eligible)

---

## 🎯 Key Platform Capabilities Summary

### **For Affiliates**
- ✅ Create and manage orders
- ✅ Track commissions and earnings
- ✅ View analytics and performance metrics
- ✅ Complete courses and earn XP
- ✅ Earn badges and level up
- ✅ Participate in quests and leaderboards
- ✅ Request payouts
- ✅ View trending and high commission products

### **For Admins**
- ✅ Manage affiliates
- ✅ Manage products and designs
- ✅ Manage orders and fulfillment
- ✅ Manage staff and permissions
- ✅ Manage inventory
- ✅ Process payouts
- ✅ View platform analytics
- ✅ Manage courses and gamification

### **For Staff**
- ✅ Clock in/out shifts
- ✅ Process orders
- ✅ Print products
- ✅ Quality check inventory
- ✅ Package and ship orders
- ✅ Track activities

---

## 📈 Platform Statistics

- **Total Features**: 12
- **Total Tests**: 1,034 (99.6% pass rate)
- **Architecture**: Clean Architecture with DDD
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Authentication**: Clerk
- **State Management**: React Query (TanStack Query)
- **Testing**: Jest

---

**Last Updated**: December 2024  
**Platform Version**: 1.0.0

