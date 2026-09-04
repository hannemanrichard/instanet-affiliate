# Complete Guide: Migrate Referio to Separate Database

## Overview

This guide provides step-by-step instructions to move all Referio platform tables, indexes, functions, and data to a completely separate database.

---

## Step 1: Identify All Referio Components

### Tables to Migrate:

#### Core Referio Tables:

- `referio_orders`
- `referio_order_items`
- `commissions`
- `affiliate_withdrawals`
- `affiliates` (if not shared, otherwise replicate)

#### Course System Tables:

- `courses`
- `course_modules`
- `course_videos`
- `course_enrollments`
- `video_progress`
- `video_milestones`
- `course_progress`
- `course_completions`
- `course_analytics`

#### Gamification Tables (rf\_\*):

- `rf_affiliate_xp`
- `rf_xp_events`
- `rf_badges`
- `rf_affiliate_badges` (if exists)
- `rf_levels`
- `rf_streaks` (or `rf_affiliate_streaks`)
- `rf_leaderboard_cache`
- `rf_quests`
- `rf_quest_steps`
- `rf_affiliate_quests` (if exists)
- `rf_quest_rewards` (if exists)
- `rf_affiliate_bonuses`
- `rf_bonus_configurations` (if exists)

#### Other:

- `delivery_histories` (if Referio-specific)

---

## Step 2: Create Database Extraction Script

### Option A: Using pg_dump (Recommended)

```bash
# Extract schema only (no data)
pg_dump -h <host> -U <user> -d <source_db> \
  --schema-only \
  --no-owner \
  --no-acl \
  -t 'referio_orders' \
  -t 'referio_order_items' \
  -t 'commissions' \
  -t 'affiliate_withdrawals' \
  -t 'courses' \
  -t 'course_*' \
  -t 'rf_*' \
  -t 'video_progress' \
  -t 'video_milestones' \
  -f referio_schema.sql

# Extract data only (if migrating data)
pg_dump -h <host> -U <user> -d <source_db> \
  --data-only \
  --no-owner \
  --no-acl \
  -t 'referio_orders' \
  -t 'referio_order_items' \
  -t 'commissions' \
  -t 'affiliate_withdrawals' \
  -t 'courses' \
  -t 'course_*' \
  -t 'rf_*' \
  -t 'video_progress' \
  -t 'video_milestones' \
  -f referio_data.sql
```

### Option B: Using SQL Script (Custom)

Create a script that generates DDL for all Referio tables, indexes, and functions.

---

## Step 3: Create the New Supabase Project

### Create New Supabase Project

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Click "New Project"**
3. **Project Settings**:
   - **Name**: `referio` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose appropriate region
   - **Pricing Plan**: Select your plan
4. **Wait for project to initialize** (2-3 minutes)
5. **Save Project Credentials**:
   - Go to Project Settings → API
   - Copy:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon/public key**: For client-side access
     - **service_role key**: For server-side/admin access
   - Go to Project Settings → Database
   - Copy:
     - **Connection string** (if needed for migrations)

### Supabase Extensions

Supabase automatically includes these extensions:

- `uuid-ossp` (for UUID generation)
- `pgcrypto` (for encryption)
- `extensions` schema is available

**No need to manually create extensions!**

---

## Step 4: Create Consolidated Migration Script

This script creates all Referio tables, indexes, and functions in the correct order.

### Structure:

```sql
-- ==============================================
-- REFERIO DATABASE SETUP
-- ==============================================
-- This script creates all Referio tables, indexes, and functions
-- Run this on the NEW Referio database

BEGIN;

-- ==============================================
-- 1. AFFILIATES TABLE (Core - No dependencies)
-- ==============================================
-- Migrate from: database/migrations/010_create_affiliates_table.sql
-- Include: CREATE TABLE, indexes, sequences

-- ==============================================
-- 2. COMMISSIONS TABLE
-- ==============================================
-- Migrate from: database/migrations/013_create_commissions_table.sql
-- Depends on: affiliates

-- ==============================================
-- 3. AFFILIATE WITHDRAWALS TABLE
-- ==============================================
-- Migrate from: database/migrations/014_create_affiliate_withdrawals_table.sql
-- Depends on: affiliates

-- ==============================================
-- 4. REFERIO ORDERS TABLES
-- ==============================================
-- Migrate from: database/migrations/020_create_referio_orders_table.sql
-- Depends on: affiliates
-- Includes: referio_orders, referio_order_items
-- Includes: all indexes and triggers

-- ==============================================
-- 5. COURSE SYSTEM TABLES
-- ==============================================
-- Migrate from: database/migrations/015_create_course_system_tables.sql
-- Depends on: affiliates
-- Includes: courses, course_modules, course_videos,
--           course_enrollments, video_progress, video_milestones,
--           course_progress, course_completions, course_analytics

-- ==============================================
-- 6. COURSE SYSTEM INDEXES
-- ==============================================
-- Migrate from: database/migrations/016_create_course_system_indexes.sql

-- ==============================================
-- 7. COURSE SYSTEM FUNCTIONS
-- ==============================================
-- Migrate from: database/migrations/017_create_course_system_functions.sql

-- ==============================================
-- 8. GAMIFICATION TABLES (rf_*)
-- ==============================================
-- Migrate from: database/migrations/019_create_gamification_tables.sql
-- Depends on: affiliates
-- Includes: rf_affiliate_xp, rf_xp_events, rf_badges, rf_affiliate_badges,
--           rf_levels, rf_streaks, rf_leaderboard_cache, rf_quests,
--           rf_quest_steps, rf_affiliate_quests, rf_quest_rewards,
--           rf_affiliate_bonuses, rf_bonus_configurations

-- ==============================================
-- 9. GAMIFICATION INDEXES
-- ==============================================
-- Migrate from: database/migrations/020_create_gamification_indexes.sql

-- ==============================================
-- 10. GAMIFICATION FUNCTIONS
-- ==============================================
-- Migrate from: database/migrations/021_create_gamification_functions.sql

-- ==============================================
-- 11. AFFILIATE FUNCTIONS
-- ==============================================
-- Migrate from: database/migrations/012_create_affiliate_functions.sql
-- Note: May need updates if referencing marketplace tables

COMMIT;
```

---

## Step 5: Execute Migration Script on Supabase

### Option A: Using Supabase Dashboard SQL Editor (Recommended for First Run)

1. **Open Supabase Dashboard** → Your Referio project
2. **Go to SQL Editor**
3. **Click "New Query"**
4. **Copy and paste** the entire `scripts/generate_referio_migration.sql` file
5. **Click "Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
6. **Verify success** - Check for any errors

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your new Referio project
supabase link --project-ref <your-referio-project-ref>
# Project ref is in your project URL: https://<project-ref>.supabase.co

# Push migration file
supabase db push --file scripts/generate_referio_migration.sql

# Or use migrations folder structure
mkdir -p supabase/migrations
cp scripts/generate_referio_migration.sql supabase/migrations/001_referio_complete_schema.sql
supabase db push
```

### Option C: Using psql with Connection String

```bash
# Get connection string from Supabase Dashboard → Settings → Database → Connection string
# Use "Transaction" mode connection string

# Run migration
psql "<your-connection-string>" -f scripts/generate_referio_migration.sql
```

---

## Step 6: Update Foreign Keys and Enable RLS

### Update Foreign Keys

Since `affiliates` will be in the Referio database (not shared):

1. All foreign keys to `affiliates` remain valid (same DB) ✅
2. Remove any foreign keys to marketplace tables if they exist ✅
3. Update any functions that reference external tables ✅

### Enable Row Level Security (RLS) on Supabase

Supabase requires RLS policies for data access. Add these after creating tables:

```sql
-- Enable RLS on all tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referio_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referio_order_items ENABLE ROW LEVEL SECURITY;
-- ... enable for all Referio tables

-- Create RLS Policies (Example - adjust based on your auth needs)
-- Policy: Affiliates can only see their own data
CREATE POLICY "Affiliates can view own profile"
  ON affiliates FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

-- Policy: Affiliates can update own profile
CREATE POLICY "Affiliates can update own profile"
  ON affiliates FOR UPDATE
  USING (auth.uid()::text = clerk_user_id);

-- Policy: Affiliates can view own orders
CREATE POLICY "Affiliates can view own orders"
  ON referio_orders FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Add similar policies for all tables based on your requirements
-- See Supabase RLS documentation: https://supabase.com/docs/guides/auth/row-level-security
```

**Note**: Since you're using Clerk, you may need to:

- Store Clerk user ID in `affiliates.clerk_user_id`
- Create functions to map Clerk ID to affiliate_id
- Or use JWT claims in RLS policies

---

## Step 7: Migrate Data (If Needed)

### If Moving Existing Data from Old Supabase Project:

#### Option A: Using Supabase Dashboard

1. **Export from Old Project**:
   - Go to old Supabase project → Table Editor
   - For each table, click "..." → "Export" → "CSV"
   - Save all CSV files

2. **Import to New Project**:
   - Go to new Referio project → Table Editor
   - Click "Insert" → "Import data from CSV"
   - Import tables in dependency order:
     - 1. `affiliates`
     - 2. `courses`, `rf_levels`, `rf_badges`, `rf_quests`
     - 3. All other tables

#### Option B: Using pg_dump with Supabase Connection

```bash
# Get connection string from OLD project
# Supabase Dashboard → Settings → Database → Connection string (Transaction mode)

# Export data
pg_dump "<old-connection-string>" \
  --data-only \
  --inserts \
  -t 'affiliates' \
  -t 'commissions' \
  -t 'affiliate_withdrawals' \
  -t 'referio_orders' \
  -t 'referio_order_items' \
  -t 'courses' \
  -t 'course_*' \
  -t 'rf_*' \
  > referio_data_export.sql

# Get connection string from NEW Referio project
# Import to new database
psql "<new-connection-string>" < referio_data_export.sql
```

#### Option C: Using Supabase CLI

```bash
# Link to old project
supabase link --project-ref <old-project-ref>

# Dump data
supabase db dump --data-only -f referio_data.sql

# Link to new project
supabase link --project-ref <new-referio-project-ref>

# Restore data
supabase db restore referio_data.sql
```

### If Starting Fresh:

- No data migration needed
- Tables are ready for new data

---

## Step 8: Update Application Code

### A. Update Supabase Client Configuration

Create new client for Referio database:

```typescript
// src/infrastructure/supabase/referioClient.ts
import { createClient } from "@supabase/supabase-js";
import type { ReferioDatabase } from "./referioTypes";

const referioUrl = process.env.NEXT_PUBLIC_REFERIO_SUPABASE_URL!;
const referioKey = process.env.NEXT_PUBLIC_REFERIO_SUPABASE_ANON_KEY!;

export const referioSupabase = createClient<ReferioDatabase>(
  referioUrl,
  referioKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

### B. Update Environment Variables

```env
# Old (if shared)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# New (Separate databases)
# Marketplace/Aneek
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Referio
NEXT_PUBLIC_REFERIO_SUPABASE_URL=...
NEXT_PUBLIC_REFERIO_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_REFERIO_SUPABASE_SERVICE_ROLE_KEY=...
```

### C. Update Service Files

Update all Referio service files to use `referioSupabase`:

```typescript
// Before
import { supabase } from "@/infrastructure/supabase/client";
supabase.from('courses')...

// After
import { referioSupabase } from "@/infrastructure/supabase/referioClient";
referioSupabase.from('courses')...
```

**Files to Update:**

- `src/features/courses/data/*`
- `src/features/gamification/data/*`
- `src/features/orders/data/ordersService.ts`
- `src/features/payouts/data/commissionsService.ts`
- `src/features/payouts/data/withdrawalsService.ts`
- `src/features/affiliates/data/affiliatesService.ts`

### D. Update Type Generation

```bash
# Generate types for Referio database
# Get project ID from Supabase Dashboard → Settings → General → Reference ID

npx supabase gen types typescript \
  --project-id <referio_project_id> \
  > src/infrastructure/supabase/referioTypes.ts

# Or if using Supabase CLI with linked project
supabase gen types typescript --local > src/infrastructure/supabase/referioTypes.ts

# Update package.json script
# "referio:types": "npx supabase gen types typescript --project-id <referio_project_id> > src/infrastructure/supabase/referioTypes.ts"
```

### E. Remove Schema References

Remove all `.schema('referio')` or `.schema('referrio')` calls:

```typescript
// Before
supabase.schema('referio').from('courses')...

// After
referioSupabase.from('courses')...
```

---

## Step 9: Update Tests

Update all test files to use the new Referio client:

```typescript
// Update test setup
import { referioSupabase } from "@/infrastructure/supabase/referioClient";

// Update mocks
jest.mock("@/infrastructure/supabase/referioClient", () => ({
  referioSupabase: {
    from: jest.fn(),
    // ... other methods
  },
}));
```

---

## Step 10: Verification Checklist

- [ ] All Referio tables created in new database
- [ ] All indexes created
- [ ] All functions/triggers created
- [ ] Foreign keys working correctly
- [ ] Types generated for new database
- [ ] All service files updated to use `referioSupabase`
- [ ] Environment variables updated
- [ ] Tests updated and passing
- [ ] Application connects to both databases correctly
- [ ] No references to old schema in code

---

## Step 11: Cleanup (After Verification)

### Remove Old Referio Tables from Original Database:

```sql
-- ONLY AFTER VERIFYING NEW DB WORKS CORRECTLY
BEGIN;

DROP TABLE IF EXISTS referio_order_items CASCADE;
DROP TABLE IF EXISTS referio_orders CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS affiliate_withdrawals CASCADE;
DROP TABLE IF EXISTS course_analytics CASCADE;
DROP TABLE IF EXISTS course_completions CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS video_milestones CASCADE;
DROP TABLE IF EXISTS video_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_videos CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
-- ... all rf_* tables
DROP TABLE IF EXISTS rf_affiliate_bonuses CASCADE;
DROP TABLE IF EXISTS rf_bonus_configurations CASCADE;
DROP TABLE IF EXISTS rf_quest_rewards CASCADE;
DROP TABLE IF EXISTS rf_affiliate_quests CASCADE;
DROP TABLE IF EXISTS rf_quest_steps CASCADE;
DROP TABLE IF EXISTS rf_quests CASCADE;
DROP TABLE IF EXISTS rf_leaderboard_cache CASCADE;
DROP TABLE IF EXISTS rf_streaks CASCADE;
DROP TABLE IF EXISTS rf_levels CASCADE;
DROP TABLE IF EXISTS rf_affiliate_badges CASCADE;
DROP TABLE IF EXISTS rf_badges CASCADE;
DROP TABLE IF EXISTS rf_xp_events CASCADE;
DROP TABLE IF EXISTS rf_affiliate_xp CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_referio_orders_updated_at CASCADE;
DROP FUNCTION IF EXISTS calculate_referio_order_commission CASCADE;
DROP FUNCTION IF EXISTS update_referio_order_total CASCADE;
DROP FUNCTION IF EXISTS enroll_affiliate_in_course CASCADE;
DROP FUNCTION IF EXISTS update_video_progress CASCADE;
DROP FUNCTION IF EXISTS update_course_progress CASCADE;
DROP FUNCTION IF EXISTS get_affiliate_course_stats CASCADE;
-- ... all rf_* functions
DROP FUNCTION IF EXISTS rf_initialize_affiliate_xp CASCADE;
DROP FUNCTION IF EXISTS rf_add_affiliate_xp CASCADE;
DROP FUNCTION IF EXISTS rf_check_and_award_badges CASCADE;
-- ... etc

-- Drop sequences if any
DROP SEQUENCE IF EXISTS commissions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS affiliate_withdrawals_id_seq CASCADE;

COMMIT;
```

**⚠️ WARNING**: Only run cleanup after fully verifying the new database works!

---

## Step 12: Documentation Updates

Update:

- README.md with new database setup
- Environment variable documentation
- Deployment documentation
- Architecture diagrams

---

## Troubleshooting

### Common Issues:

1. **Foreign Key Errors**
   - Ensure `affiliates` table exists and has data before creating dependent tables
   - Check all foreign key references are valid
   - In Supabase, check Table Editor → Constraints tab

2. **RLS (Row Level Security) Issues**
   - Supabase blocks all queries by default if RLS is enabled
   - Check Table Editor → RLS section
   - Verify policies allow your operations
   - Use Service Role key for admin operations (bypasses RLS)

3. **Function Dependencies**
   - Functions may depend on tables - create tables first
   - Functions may reference other functions - check creation order
   - View functions in Supabase: Database → Functions

4. **Type Generation Issues**
   - Ensure you're generating from the correct project ID
   - Get project ID from: Dashboard → Settings → General → Reference ID
   - Clear TypeScript cache: `rm -rf tsconfig.tsbuildinfo`
   - Regenerate: `npm run referio:types`

5. **Connection Issues**
   - Verify environment variables are set correctly
   - Check Supabase project URLs and keys (Dashboard → Settings → API)
   - Test connection: Use Supabase Dashboard → SQL Editor
   - Ensure project is not paused (free tier pauses after inactivity)

6. **Clerk Integration with Supabase**
   - Since you use Clerk for auth, RLS policies may need custom logic
   - Consider using Supabase functions to map Clerk user_id to affiliate_id
   - Or disable RLS temporarily and handle auth in application layer

7. **Migration Script Errors**
   - Check Supabase SQL Editor for specific error messages
   - Supabase shows line numbers for SQL errors
   - Some errors may be due to existing objects - use `CREATE TABLE IF NOT EXISTS` or `DROP TABLE IF EXISTS` first

---

## Migration Order Summary (Supabase-Specific)

1. ✅ **Create new Supabase project** (Dashboard → New Project)
2. ✅ **Save project credentials** (URL, anon key, service_role key)
3. ✅ **Run migration script** (SQL Editor or CLI)
   - Execute `scripts/generate_referio_migration.sql`
4. ✅ **Enable RLS and create policies** (if needed)
5. ✅ **Migrate data** (if moving existing data)
   - Use Table Editor → Import CSV or pg_dump
6. ✅ **Generate TypeScript types**
   - `npx supabase gen types typescript --project-id <referio_project_id>`
7. ✅ **Update application code**
   - Create new Supabase client for Referio
   - Update all service files
8. ✅ **Update environment variables**
   - Add Referio project URL and keys
9. ✅ **Update tests**
   - Mock new Referio client
10. ✅ **Verify everything works**
    - Test all CRUD operations
    - Test RLS policies
11. ✅ **Cleanup old Supabase project** (after verification)
    - Remove Referio tables from old project

---

## Next Steps

After migration, you'll have:

- ✅ Completely isolated Referio database
- ✅ Independent scaling
- ✅ Clear separation of concerns
- ✅ Easier maintenance

Good luck with the migration! 🚀
