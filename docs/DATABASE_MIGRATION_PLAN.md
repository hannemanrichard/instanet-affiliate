# Database Migration Plan: Current to Upcoming Structure

## Overview

This document outlines the migration plan from the current database structure to the upcoming structure. The key challenge is that the **upcoming structure has a different `partners` table** that serves a different purpose (ecommerce_owner/affiliate partners) compared to the current structure's `partners` table (affiliate marketing partners).

## Current Structure Analysis

### Key Tables in Current Structure:

- **`partners`** - Affiliate marketing partners (referral partners)
- **`products`** - Product catalog with variants
- **`items`** - Product variants (color, size, COG)
- **`inventory`** - Physical inventory tracking
- **`orders`** - Customer orders
- **`leads`** - Lead management
- **`commissions`** - Partner commission tracking
- **`withdraws`** - Partner withdrawal requests

### Current Partners Table Structure:

```typescript
partners: {
  id: number;
  fullname: string | null;
  email: string | null;
  username: string | null;
  avatar: string | null;
  background: string | null;
  bio: string | null;
  birthdate: string | null;
  gender: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  referral_source: string | null;
  status: string;
  created_at: string;
}
```

## Upcoming Structure Analysis

### Key Changes in Upcoming Structure:

- **`partners`** - Now represents ecommerce_owner/affiliate partners (different business model)
- **`customers`** - Customer management
- **`employees`** - Staff management
- **`product_pages`** - Product catalog pages
- **`product_variants`** - Product variants
- **`carts`** - Shopping cart functionality
- **`orders`** - Enhanced order management
- **`addresses`** - Customer addresses
- **`audit_logs`** - System audit trail

### Upcoming Partners Table Structure:

```typescript
partners: {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  website: string | null;
  phone: string | null;
  partner_type: "ecommerce_owner" | "affiliate";
  status: "active" | "inactive" | "suspended" | "pending_approval";
  is_verified: boolean | null;
  approved_at: string | null;
  approved_by: number | null;
  verification_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
```

## Migration Strategy

### Phase 1: Create Affiliate Marketing Tables

**Problem**: The upcoming `partners` table serves a different purpose (ecommerce_owner/affiliate partners) than the current `partners` table (affiliate marketing partners).

**Solution**: Create affiliate marketing tables to preserve and enhance the current affiliate functionality.

#### 1.1 Create Affiliates Table

```sql
-- Create affiliates table to replace current partners functionality
CREATE TABLE affiliates (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(100),
  avatar VARCHAR(500),
  background VARCHAR(500),
  bio TEXT,
  birthdate DATE,
  gender VARCHAR(20),
  instagram VARCHAR(255),
  linkedin VARCHAR(255),
  tiktok VARCHAR(255),
  referral_source VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_username ON affiliates(username);
CREATE INDEX idx_affiliates_status ON affiliates(status);
```

#### 1.2 Create Commissions Table

```sql
-- Create commissions table to track affiliate earnings
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id VARCHAR(255) REFERENCES orders(id), -- UUID string from orders table
  lead_id INTEGER REFERENCES leads(id),
  product_id INTEGER REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

#### 1.3 Create Affiliate Withdrawals Table

```sql
-- Create affiliate_withdrawals table to manage affiliate payouts
CREATE TABLE affiliate_withdrawals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by INTEGER REFERENCES employees(id),
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Phase 2: Update Foreign Key References

#### 2.1 Update Commissions Table

```sql
-- Add new affiliate_id column
ALTER TABLE commissions ADD COLUMN affiliate_id INTEGER;

-- Migrate data
UPDATE commissions
SET affiliate_id = partner_id
WHERE partner_id IS NOT NULL;

-- Add foreign key constraint
ALTER TABLE commissions
ADD CONSTRAINT fk_commissions_affiliate_id
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Drop old foreign key constraint
ALTER TABLE commissions DROP CONSTRAINT commissions_partner_id_fkey;

-- Drop old column
ALTER TABLE commissions DROP COLUMN partner_id;
```

#### 2.2 Update Leads Table

```sql
-- Add new affiliate_id column
ALTER TABLE leads ADD COLUMN affiliate_id INTEGER;

-- Migrate data
UPDATE leads
SET affiliate_id = partner_id
WHERE partner_id IS NOT NULL;

-- Add foreign key constraint
ALTER TABLE leads
ADD CONSTRAINT fk_leads_affiliate_id
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Drop old foreign key constraint
ALTER TABLE leads DROP CONSTRAINT leads_partner_id_fkey;

-- Drop old column
ALTER TABLE leads DROP COLUMN partner_id;
```

#### 2.3 Update Orders Table

```sql
-- Add new affiliate_id column (nullable for orders from other ecosystem apps)
ALTER TABLE orders ADD COLUMN affiliate_id INTEGER;

-- Add foreign key constraint (nullable)
ALTER TABLE orders
ADD CONSTRAINT fk_orders_affiliate_id
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Create index for better performance
CREATE INDEX idx_orders_affiliate_id ON orders(affiliate_id);
```

**Note**: `affiliate_id` is nullable because orders can come from multiple sources in the ecosystem:

- ✅ **Referio orders**: Have `affiliate_id` for commission tracking
- ✅ **Other ecosystem apps**: Have `affiliate_id = NULL` (no commission)

#### 2.4 Update Parcels Table

```sql
-- Add new affiliate_id column
ALTER TABLE parcels ADD COLUMN affiliate_id INTEGER;

-- Migrate data
UPDATE parcels
SET affiliate_id = partner_id
WHERE partner_id IS NOT NULL;

-- Add foreign key constraint
ALTER TABLE parcels
ADD CONSTRAINT fk_parcels_affiliate_id
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Drop old foreign key constraint
ALTER TABLE parcels DROP CONSTRAINT parcels_partner_id_fkey;

-- Drop old column
ALTER TABLE parcels DROP COLUMN partner_id;
```

#### 2.5 Update Withdraws Table

```sql
-- Add new affiliate_id column
ALTER TABLE withdraws ADD COLUMN affiliate_id INTEGER;

-- Migrate data
UPDATE withdraws
SET affiliate_id = partner_id
WHERE partner_id IS NOT NULL;

-- Add foreign key constraint
ALTER TABLE withdraws
ADD CONSTRAINT fk_withdraws_affiliate_id
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id);

-- Drop old foreign key constraint
ALTER TABLE withdraws DROP CONSTRAINT withdraws_partner_id_fkey;

-- Drop old column
ALTER TABLE withdraws DROP COLUMN partner_id;
```

### Phase 3: Implement Upcoming Structure

#### 3.1 Create New Tables

```sql
-- Create customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create addresses table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Algeria',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_pages table
CREATE TABLE product_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE product_variants (
  id VARCHAR(255) PRIMARY KEY,
  product_page_id INTEGER NOT NULL REFERENCES product_pages(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  weight DECIMAL(8, 2),
  color VARCHAR(50),
  size VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id),
  page_id INTEGER NOT NULL REFERENCES product_pages(id),
  product_variant_id VARCHAR(255) REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  record_uuid VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by INTEGER REFERENCES employees(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2 Create Enums

```sql
-- Create partner_type enum
CREATE TYPE partner_type AS ENUM ('ecommerce_owner', 'affiliate');

-- Create partner_status enum
CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
```

#### 3.3 Create New Partners Table

```sql
-- Create new partners table for upcoming structure
CREATE TABLE partners_new (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  business_registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(20),
  partner_type partner_type NOT NULL,
  status partner_status DEFAULT 'pending_approval',
  is_verified BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by INTEGER REFERENCES employees(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_partners_new_clerk_user_id ON partners_new(clerk_user_id);
CREATE INDEX idx_partners_new_email ON partners_new(email);
CREATE INDEX idx_partners_new_partner_type ON partners_new(partner_type);
CREATE INDEX idx_partners_new_status ON partners_new(status);
```

### Phase 4: Data Migration

#### 4.1 Migrate Products to Product Pages

```sql
-- Migrate products to product_pages
INSERT INTO product_pages (id, title, description, slug, is_active, created_at)
SELECT
  id,
  name,
  description,
  LOWER(REPLACE(name, ' ', '-')),
  TRUE,
  created_at
FROM products;

-- Migrate items to product_variants
INSERT INTO product_variants (id, product_page_id, name, color, size, cost, is_active, created_at)
SELECT
  CONCAT('variant_', id),
  product_id,
  CONCAT(product, ' ', COALESCE(color, ''), ' ', COALESCE(size, '')),
  color,
  size,
  cog,
  TRUE,
  COALESCE(created_at, NOW())
FROM items;
```

#### 4.2 Migrate Orders to New Structure

```sql
-- Create customers from orders
INSERT INTO customers (id, email, first_name, last_name, phone, created_at)
SELECT DISTINCT
  ROW_NUMBER() OVER (ORDER BY MIN(created_at)) + 1000, -- Start from 1000 to avoid conflicts
  CONCAT('customer_', MIN(id), '@example.com'),
  first_name,
  last_name,
  phone,
  MIN(created_at)
FROM orders
WHERE first_name IS NOT NULL AND last_name IS NOT NULL
GROUP BY first_name, last_name, phone;

-- Update orders with customer_id
UPDATE orders
SET customer_id = c.id
FROM customers c
WHERE orders.first_name = c.first_name
  AND orders.last_name = c.last_name
  AND orders.phone = c.phone;
```

### Phase 5: Application Layer Updates

#### 5.1 Update Domain Entities

```typescript
// Update partner-related entities
export interface AffiliateEntity {
  id: number;
  fullname: string | null;
  email: string | null;
  username: string | null;
  avatar: string | null;
  background: string | null;
  bio: string | null;
  birthdate: string | null;
  gender: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  referral_source: string | null;
  status: string;
  created_at: string;
}

export interface PartnerEntity {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  website: string | null;
  phone: string | null;
  partner_type: "ecommerce_owner" | "affiliate";
  status: "active" | "inactive" | "suspended" | "pending_approval";
  is_verified: boolean | null;
  approved_at: string | null;
  approved_by: number | null;
  verification_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
```

#### 5.2 Update Services

```typescript
// Update partner services to use affiliates
export class AffiliateService {
  async getAffiliate(id: number): Promise<AffiliateEntity> {
    // Implementation for affiliate operations
  }

  async createAffiliate(data: CreateAffiliateData): Promise<AffiliateEntity> {
    // Implementation for affiliate creation
  }

  async updateAffiliate(
    id: number,
    data: UpdateAffiliateData
  ): Promise<AffiliateEntity> {
    // Implementation for affiliate updates
  }
}

// New partner service for upcoming structure
export class PartnerService {
  async getPartner(id: number): Promise<PartnerEntity> {
    // Implementation for partner operations
  }

  async createPartner(data: CreatePartnerData): Promise<PartnerEntity> {
    // Implementation for partner creation
  }

  async approvePartner(id: number, approvedBy: number): Promise<PartnerEntity> {
    // Implementation for partner approval
  }
}
```

#### 5.3 Update API Endpoints

```typescript
// Update API routes
// /api/affiliates/* - for affiliate marketing functionality
// /api/partners/* - for ecommerce_owner/affiliate functionality

// Example API structure
app.get("/api/affiliates", affiliateController.getAllAffiliates);
app.get("/api/affiliates/:id", affiliateController.getAffiliate);
app.post("/api/affiliates", affiliateController.createAffiliate);
app.put("/api/affiliates/:id", affiliateController.updateAffiliate);

app.get("/api/partners", partnerController.getAllPartners);
app.get("/api/partners/:id", partnerController.getPartner);
app.post("/api/partners", partnerController.createPartner);
app.put("/api/partners/:id/approve", partnerController.approvePartner);
```

### Phase 6: Testing and Validation

#### 6.1 Data Integrity Checks

```sql
-- Verify affiliate data migration
SELECT COUNT(*) FROM affiliates;
SELECT COUNT(*) FROM partners; -- Should match

-- Verify foreign key updates
SELECT COUNT(*) FROM commissions WHERE affiliate_id IS NOT NULL;
SELECT COUNT(*) FROM leads WHERE affiliate_id IS NOT NULL;
SELECT COUNT(*) FROM orders WHERE affiliate_id IS NOT NULL;
SELECT COUNT(*) FROM withdraws WHERE affiliate_id IS NOT NULL;

-- Verify new structure
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM product_pages;
SELECT COUNT(*) FROM product_variants;
SELECT COUNT(*) FROM carts;
```

#### 6.2 Application Testing

- Test affiliate management functionality
- Test partner management functionality
- Test order processing with new structure
- Test commission calculations
- Test withdrawal processing

### Phase 7: Cleanup

#### 7.1 Remove Old Tables

```sql
-- Drop old partners table after verification
DROP TABLE partners;

-- Rename new partners table
ALTER TABLE partners_new RENAME TO partners;
```

#### 7.2 Update Application Configuration

```typescript
// Update database configuration
export const databaseConfig = {
  tables: {
    affiliates: "affiliates",
    partners: "partners",
    customers: "customers",
    employees: "employees",
    product_pages: "product_pages",
    product_variants: "product_variants",
    carts: "carts",
    cart_items: "cart_items",
    orders: "orders",
    addresses: "addresses",
    audit_logs: "audit_logs",
  },
};
```

## Risk Mitigation

### 1. Backup Strategy

- Create full database backup before migration
- Test migration on staging environment first
- Keep rollback scripts ready

### 2. Gradual Migration

- Migrate in phases to minimize risk
- Test each phase thoroughly before proceeding
- Maintain backward compatibility during transition

### 3. Data Validation

- Verify data integrity at each step
- Compare record counts before and after migration
- Test critical business functions

### 4. Rollback Plan

- Keep original table structure available
- Maintain foreign key constraints during migration
- Have rollback scripts ready for each phase

## Timeline

### Week 1: Preparation

- Create backup
- Set up staging environment
- Prepare migration scripts

### Week 2: Phase 1-2

- Create affiliates table
- Migrate partners data
- Update foreign key references

### Week 3: Phase 3-4

- Create new tables
- Migrate data to new structure
- Test data integrity

### Week 4: Phase 5-6

- Update application layer
- Test functionality
- Fix any issues

### Week 5: Phase 7

- Cleanup old tables
- Final testing
- Deploy to production

## Conclusion

This migration plan ensures a smooth transition from the current structure to the upcoming structure while preserving the affiliate marketing functionality through the new `affiliates` table. The key insight is recognizing that the upcoming `partners` table serves a different business purpose and creating a separate `affiliates` table to maintain the current affiliate marketing functionality.

The migration is designed to be safe, reversible, and maintain data integrity throughout the process.
