# Database Schema Organization Proposal

## Current State Analysis

Based on the codebase analysis, you have a mixed ecosystem with:

1. **Referio** - Affiliate marketing platform
2. **Marketplace/E-commerce** - Print-on-demand marketplace (Aneek)
3. **Courses** - Platform educational feature
4. **Gamification** - Engagement system (prefixed with `rf_`)

## Recommended Schema Organization

### **Option 1: PostgreSQL Schemas (RECOMMENDED)**

```
public schema (shared/common data):
├── affiliates                    # Shared across platforms
├── employees                     # Admin/staff (shared)
├── audit_logs                   # System-wide audit trail
└── reference_data               # Shared reference tables (optional)

referio schema (Referio affiliate platform - ALL Referio features):
├── orders                       # referio_orders (affiliate orders)
├── order_items                  # referio_order_items
├── commissions                  # Commission tracking
├── affiliate_withdrawals        # Withdrawal requests
├── courses                      # Course catalog (Referio feature)
├── course_modules               # Course modules
├── course_videos                # Video content
├── course_enrollments           # Affiliate enrollments
├── course_progress              # Progress tracking
├── video_progress               # Video progress
├── course_completions           # Completion records
├── course_analytics             # Analytics
├── rf_affiliate_xp              # Gamification (Referio feature)
├── rf_badges                    # Gamification
├── rf_quests                    # Gamification
├── rf_xp_events                 # Gamification
├── rf_levels                    # Gamification
├── rf_leaderboard_cache         # Gamification
└── rf_affiliate_bonuses         # Gamification

marketplace schema (Aneek marketplace):
├── orders                       # Marketplace orders (with agent_id, store_id, etc.)
├── order_item                   # Existing order items
├── products                     # Product catalog
├── items                        # Product variants
├── inventory                   # Inventory tracking
├── carts                         # Shopping carts
├── cart_items                   # Cart items
├── customers                    # Customer accounts
├── addresses                    # Customer addresses
├── product_templates            # Design-centric POD
├── designs                      # Design-centric POD
├── design_products              # Design-centric POD
├── discounts                    # Discounts/coupons
├── coupon_templates             # Coupon system
└── delivery_histories           # Delivery tracking

shared schema (Optional - very common data):
└── [future shared data if needed]
```

## Migration Strategy

### Phase 1: Create Schemas

```sql
CREATE SCHEMA IF NOT EXISTS referio;
CREATE SCHEMA IF NOT EXISTS marketplace;
-- No separate courses schema - courses are part of Referio platform
```

### Phase 2: Move Tables to Appropriate Schemas

**Move to `referio` schema (ALL Referio platform tables):**

- `commissions` → `referio.commissions`
- `affiliate_withdrawals` → `referio.affiliate_withdrawals`
- All `rf_*` tables → `referio` schema (gamification)
- All `course_*` tables → `referio` schema (courses feature)
  - `courses` → `referio.courses`
  - `course_modules` → `referio.course_modules`
  - `course_videos` → `referio.course_videos`
  - `course_enrollments` → `referio.course_enrollments`
  - `course_progress` → `referio.course_progress`
  - `video_progress` → `referio.video_progress`
  - `video_milestones` → `referio.video_milestones`
  - `course_completions` → `referio.course_completions`
  - `course_analytics` → `referio.course_analytics`
- Create new `referio.orders` and `referio.order_items`

**Move to `marketplace` schema:**

- `orders` (marketplace) → `marketplace.orders`
- `products`, `items`, `inventory` → `marketplace` schema
- `carts`, `cart_items` → `marketplace` schema
- `customers`, `addresses` → `marketplace` schema
- `product_templates`, `designs`, etc. → `marketplace` schema
- `discounts`, `coupon_*` → `marketplace` schema
- `delivery_histories` → `marketplace` schema

**Keep in `public` schema:**

- `affiliates` (shared)
- `employees` (shared admin)
- `audit_logs` (shared)

### Phase 3: Update Foreign Keys

All cross-schema references use fully qualified names:

```sql
-- Example: referio orders referencing public affiliates
referio.orders.affiliate_id → public.affiliates.id

-- Example: referio course enrollments referencing public affiliates
referio.course_enrollments.affiliate_id → public.affiliates.id
-- Note: Course tables may still reference 'partners' - need to update to 'affiliates'

-- Example: referio commissions referencing marketplace orders (if needed)
referio.commissions.order_id → marketplace.orders.id
```

**Important:** Course tables currently reference `partners` table. When moving to `referio` schema, update references:

- `course_enrollments.partner_id` → Should reference `public.affiliates.id`
- `video_progress.partner_id` → Should reference `public.affiliates.id`
- `course_progress.partner_id` → Should reference `public.affiliates.id`
- `course_completions.partner_id` → Should reference `public.affiliates.id`

## Benefits of This Organization

### 1. **Clear Separation**

- Each platform has its own schema
- Easy to identify which tables belong to which platform
- No naming conflicts

### 2. **Shared Data Strategy**

- `public.affiliates` can be referenced from any schema
- Easy to add shared tables later (move to `public` or create `shared` schema)

### 3. **Independent Development**

- Teams can work on different schemas
- Migrations don't conflict
- Clear ownership

### 4. **Security & Permissions**

- Schema-level permissions (RLS policies per schema)
- Can restrict access at schema level

### 5. **Future Flexibility**

- Easy to split to separate databases if needed
- Easy to add new platforms (create new schema)
- Can share data by moving to `public` schema

## Cross-Schema Queries

```sql
-- Query across schemas is straightforward:
SELECT o.*, a.email
FROM referio.orders o
JOIN public.affiliates a ON o.affiliate_id = a.id;

-- Or in application code:
-- Supabase automatically handles cross-schema queries
```

## Alternative: Keep in Public with Prefixes

If you prefer to stay in `public` schema:

```
public schema:
├── affiliates
├── referio_orders
├── referio_order_items
├── referio_commissions (or keep commissions)
├── marketplace_orders (rename from orders)
├── marketplace_products (rename from products)
└── course_courses (rename from courses)
```

**Pros**: Simpler migration, no schema changes needed
**Cons**: Less clear separation, longer table names, all still in one namespace

## Recommendation

**Use PostgreSQL schemas** for:

- ✅ Clear separation
- ✅ Better organization
- ✅ Future flexibility
- ✅ Security boundaries
- ✅ Professional structure

The migration is straightforward and the benefits far outweigh the effort.

## Questions to Decide

1. Should `customers` be in `marketplace` or `public`?
   - If customers can be shared → `public`
   - If marketplace-only → `marketplace`

2. Should `affiliates` stay in `public`?
   - YES (shared across platforms)

3. Any other tables that should be shared?
   - Review each table individually

4. Do you want to keep current `orders` table for marketplace or create new one?
   - Recommendation: Keep in `marketplace` schema, create new for `referio`

---

**What do you think? Should we proceed with schema-based organization?**
