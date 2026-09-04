# Staff Management & Permissions Schema

## Overview

This document outlines the SQL schema for managing staff (admins, moderators, and fulfillment team), granular permissions system, and shift/work schedule tracking.

## Key Design Principles

1. **Granular Permissions**: Each task (print, quality check, validate return) is a separate permission
2. **Flexible Assignment**: Admins or managers can assign permissions to fulfillment staff
3. **Clear Separation**: Admins/moderators are separate from fulfillment staff, but permissions determine capabilities
4. **Shift Tracking**: Complete shift/work schedule tracking for accountability
5. **Activity Audit**: Log all activities with permission and shift context

---

## 1. Core Staff Table

```sql
-- Main staff table (all staff: admins, moderators, fulfillment)
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(500),

  -- Staff type (high-level classification)
  staff_type VARCHAR(50) NOT NULL, -- 'admin', 'moderator', 'fulfillment'
  CONSTRAINT valid_staff_type CHECK (staff_type IN ('admin', 'moderator', 'fulfillment')),

  -- Employment info
  employee_id VARCHAR(50) UNIQUE,
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'terminated'

  -- Management hierarchy
  reports_to INTEGER REFERENCES staff(id), -- Manager (admin or fulfillment_manager)
  department VARCHAR(50), -- 'operations', 'quality_control', 'shipping', 'admin', 'moderation'

  -- Created by (for audit)
  created_by INTEGER REFERENCES staff(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_staff_clerk_user_id ON staff(clerk_user_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_type ON staff(staff_type);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_reports_to ON staff(reports_to);
```

---

## 2. Permissions System (Granular & Flexible)

```sql
-- Permissions definition (granular tasks)
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'printing', 'quality', 'shipping', 'returns', 'admin', 'moderation'

  -- Permission metadata
  requires_approval BOOLEAN DEFAULT false, -- Some actions need manager approval
  risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff permissions assignment (Many-to-Many: Staff ↔ Permissions)
CREATE TABLE staff_permissions (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

  -- Assignment details
  assigned_by INTEGER NOT NULL REFERENCES staff(id), -- Admin or manager who assigned
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional: temporary permissions
  revoked_at TIMESTAMP WITH TIME ZONE, -- Soft revoke
  revoked_by INTEGER REFERENCES staff(id), -- Who revoked it

  -- Notes
  notes TEXT, -- Why this permission was assigned

  -- Status
  is_active BOOLEAN DEFAULT true,

  UNIQUE(staff_id, permission_id) -- One active permission assignment per staff
);

CREATE INDEX idx_staff_permissions_staff ON staff_permissions(staff_id);
CREATE INDEX idx_staff_permissions_permission ON staff_permissions(permission_id);
CREATE INDEX idx_staff_permissions_active ON staff_permissions(staff_id, is_active) WHERE is_active = true;
```

---

## 3. Permission Assignment (Application Layer)

**Note**: Permission assignment rules are handled in the application layer, not in the database. This provides:

- **Flexibility**: Easier to change rules without migrations
- **Complexity**: Business logic is easier to maintain in code
- **Validation**: Can include complex validation rules
- **Audit**: Still tracked via `staff_permissions.assigned_by`

**Example Application Layer Rules**:

- Admins can assign any permission
- Managers (with `assign_permissions` permission) can assign permissions in their department
- Some permissions require manager approval (handled in application logic)

---

## 4. Shift/Work Schedule Tracking

```sql
-- Work shifts
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff(id),

  -- Shift details
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0, -- Break time in minutes

  -- Shift type
  shift_type VARCHAR(50), -- 'morning', 'afternoon', 'night', 'overtime', 'on_call'

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  clock_in_at TIMESTAMP WITH TIME ZONE, -- Actual clock-in time
  clock_out_at TIMESTAMP WITH TIME ZONE, -- Actual clock-out time

  -- Tracking
  created_by INTEGER REFERENCES staff(id), -- Who scheduled it
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shifts_staff ON shifts(staff_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shifts_status ON shifts(status);
```

**Note**: Recurring shift patterns can be added later if needed. For now, shifts are created individually or can be generated via application logic.

---

## 5. Activity Logging (Who Did What, When)

```sql
-- Staff activity log (simplified - tracks essential actions)
CREATE TABLE staff_activities (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  permission_id INTEGER REFERENCES permissions(id), -- Which permission was used (if applicable)

  -- Activity details
  activity_type VARCHAR(100) NOT NULL, -- 'print_product', 'quality_check', 'package_order', 'validate_return', etc.

  -- Related entity (consolidated)
  related_entity JSONB DEFAULT '{}', -- {"type": "order", "id": "uuid-123", "description": "..."}

  -- Context
  shift_id INTEGER REFERENCES shifts(id), -- During which shift (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_staff_activities_staff ON staff_activities(staff_id);
CREATE INDEX idx_staff_activities_permission ON staff_activities(permission_id);
CREATE INDEX idx_staff_activities_type ON staff_activities(activity_type);
CREATE INDEX idx_staff_activities_shift ON staff_activities(shift_id);
CREATE INDEX idx_staff_activities_created ON staff_activities(created_at);

-- Example related_entity JSONB:
-- {"type": "physical_inventory", "id": "uuid-123", "sku": "SHAR-HOD-BLK-L-241201"}
-- {"type": "order", "id": "uuid-456", "order_number": "ORD-12345"}
```

**Simplification Rationale**:

- Removed `activity_description` (can be derived from `activity_type` or stored in `related_entity`)
- Consolidated `related_type` and `related_id` into single `related_entity` JSONB field
- Removed `metadata` (merged into `related_entity` if needed)
- Removed `ip_address` and `user_agent` (use separate audit_logs table if needed for security)

---

## 6. Updates to Existing Tables

### Update `physical_printed_inventory`

```sql
-- Add staff tracking to physical_printed_inventory (item-level operations)
ALTER TABLE physical_printed_inventory
ADD COLUMN printed_by INTEGER REFERENCES staff(id),
ADD COLUMN printed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN packaged_by INTEGER REFERENCES staff(id),
ADD COLUMN packaged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN quality_checked_by INTEGER REFERENCES staff(id),
ADD COLUMN quality_checked_at TIMESTAMP WITH TIME ZONE;
```

**Note**: `printed_by` and `quality_checked_by` are item-level operations (each printed item is checked individually).

### Update `orders` Table

```sql
-- Add staff tracking to orders (order-level operations)
ALTER TABLE orders
ADD COLUMN shipped_by INTEGER REFERENCES staff(id),
ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
```

**Note**: `packaged_by` and `shipped_by` are order-level operations (entire order is packaged/shipped together).

### Quality Control Checks Table

```sql
-- Quality control checks (if not exists, or create)
CREATE TABLE quality_control_checks (
  id SERIAL PRIMARY KEY,
  physical_inventory_id UUID NOT NULL REFERENCES physical_printed_inventory(id),

  checked_by INTEGER NOT NULL REFERENCES staff(id),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  passed BOOLEAN NOT NULL,
  notes TEXT,

  -- Quality criteria
  print_quality VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor'
  color_accuracy VARCHAR(20),
  size_accuracy VARCHAR(20),
  defects_found TEXT[],

  can_resell BOOLEAN DEFAULT false,
  requires_repair BOOLEAN DEFAULT false,
  scrap BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Update `print_jobs` Table

```sql
-- Add staff tracking to existing print_jobs table
ALTER TABLE print_jobs
ADD COLUMN assigned_to INTEGER REFERENCES staff(id); -- Who performs the print job (replaces assigned_printer)
```

**Note**: The `print_jobs` table already exists. This migration adds staff reference to track who performs print operations. The assigned person starts and completes the job (tracked via existing `started_at` and `completed_at` timestamps). The existing `assigned_printer` field (string) can be migrated to `assigned_to` (staff reference) or kept for compatibility.

---

## 7. Seed Data for Permissions

```sql
-- Insert default permissions
INSERT INTO permissions (permission_code, permission_name, description, category, risk_level) VALUES

-- Printing permissions
('print_products', 'Print Products', 'Can print product designs onto garments', 'printing', 'medium'),
('manage_print_jobs', 'Manage Print Jobs', 'Can assign, start, and complete print jobs', 'printing', 'medium'),
('view_print_queue', 'View Print Queue', 'Can view pending and in-progress print jobs', 'printing', 'low'),

-- Quality permissions
('check_quality', 'Perform Quality Checks', 'Can perform quality checks on printed products', 'quality', 'medium'),
('approve_quality', 'Approve Quality', 'Can approve products for resale after quality check', 'quality', 'high'),
('reject_quality', 'Reject Quality', 'Can reject products and mark for reprint/repair', 'quality', 'high'),

-- Returns permissions
('validate_return', 'Validate Returns', 'Can validate and process returned items', 'returns', 'medium'),
('approve_resale', 'Approve Resale', 'Can approve returned items for resale inventory', 'returns', 'high'),
('process_return_inventory', 'Process Return Inventory', 'Can update inventory when returns are processed', 'returns', 'medium'),

-- Shipping permissions
('print_delivery_slips', 'Print Delivery Slips', 'Can print shipping labels and delivery slips', 'shipping', 'low'),
('package_orders', 'Package Orders', 'Can package orders for shipping', 'shipping', 'low'),
('process_shipping', 'Process Shipping', 'Can create shipping labels and process shipments', 'shipping', 'medium'),
('track_shipments', 'Track Shipments', 'Can update shipment tracking information', 'shipping', 'low'),

-- Admin permissions (separate)
('manage_staff', 'Manage Staff', 'Can create/edit/delete staff members', 'admin', 'high'),
('assign_permissions', 'Assign Permissions', 'Can assign permissions to staff', 'admin', 'high'),
('manage_affiliates', 'Manage Affiliates', 'Can approve/suspend affiliates', 'admin', 'high'),
('view_analytics', 'View Analytics', 'Can access analytics dashboard', 'admin', 'low'),
('manage_products', 'Manage Products', 'Can create/edit/delete products', 'admin', 'high'),

-- Moderation permissions (separate)
('moderate_affiliates', 'Moderate Affiliates', 'Can review and moderate affiliate profiles', 'moderation', 'medium'),
('moderate_content', 'Moderate Content', 'Can moderate user-generated content', 'moderation', 'medium'),
('flag_suspicious_activity', 'Flag Suspicious Activity', 'Can flag affiliates for review', 'moderation', 'low');
```

---

## 8. Example Usage Queries

### Assign Permission to Staff Member

```sql
-- Example: Give John permission to print products
INSERT INTO staff_permissions (staff_id, permission_id, assigned_by, notes)
VALUES (
  (SELECT id FROM staff WHERE email = 'john@example.com'),
  (SELECT id FROM permissions WHERE permission_code = 'print_products'),
  (SELECT id FROM staff WHERE staff_type = 'admin'), -- Admin assigns
  'John completed print training'
);
```

### Check if Staff Member Has Permission

```sql
-- Example: Check if John can print
SELECT sp.*, p.permission_code, p.permission_name
FROM staff_permissions sp
JOIN permissions p ON sp.permission_id = p.id
WHERE sp.staff_id = (SELECT id FROM staff WHERE email = 'john@example.com')
  AND p.permission_code = 'print_products'
  AND sp.is_active = true
  AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
  AND sp.revoked_at IS NULL;
```

### Get All Permissions for a Staff Member

```sql
-- Get all active permissions for a staff member
SELECT
  p.permission_code,
  p.permission_name,
  p.category,
  sp.assigned_at,
  sp.expires_at,
  s_assigned.first_name || ' ' || s_assigned.last_name AS assigned_by_name
FROM staff_permissions sp
JOIN permissions p ON sp.permission_id = p.id
JOIN staff s_assigned ON sp.assigned_by = s_assigned.id
WHERE sp.staff_id = :staff_id
  AND sp.is_active = true
  AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
  AND sp.revoked_at IS NULL
ORDER BY p.category, p.permission_name;
```

### Track Staff Activities During a Shift

```sql
-- Get all activities for a staff member during a specific shift
SELECT
  sa.activity_type,
  sa.related_entity,
  sa.created_at,
  p.permission_code
FROM staff_activities sa
LEFT JOIN permissions p ON sa.permission_id = p.id
WHERE sa.staff_id = :staff_id
  AND sa.shift_id = :shift_id
ORDER BY sa.created_at DESC;
```

---

## 9. Workflow Examples

### Workflow 1: Assign Print Permission

1. Admin/Manager logs into system
2. Navigates to staff management
3. Selects staff member (e.g., John)
4. Selects permission to assign (e.g., `print_products`)
5. Application layer validates if assigner has permission to assign (business logic)
6. System creates record in `staff_permissions` table with `assigned_by`
7. Staff member (John) can now print products

### Workflow 2: Staff Member Performs Action

1. Staff member logs in and clocks in (creates `shift` record)
2. Staff member attempts to print a product
3. System checks `staff_permissions` for active `print_products` permission
4. If permission exists and is active:
   - Action is performed
   - Activity is logged in `staff_activities` with `shift_id` reference
   - `physical_printed_inventory.printed_by` is set to staff member ID
5. If permission doesn't exist:
   - Action is denied
   - Activity is logged as "denied" with reason

### Workflow 3: Shift Management

1. Manager creates shift schedule (one-time shifts in `shifts` table, or generate via application logic)
2. Staff member clocks in → `shift.clock_in_at` is set, `status` = 'in_progress'
3. Staff member performs activities → all activities linked to `shift_id`
4. Staff member clocks out → `shift.clock_out_at` is set, `status` = 'completed'
5. System can calculate hours worked, activities per shift, etc.

---

## 10. Considerations & Questions

### Questions for Clarification:

1. **Permission Expiration**: Should permissions expire automatically (e.g., annual review)?
2. **Approval Workflows**: Do you need approval workflows for sensitive permissions?
3. **Manager Role**: Should managers be a separate `staff_type` or a permission?
4. **Time Tracking**: Do you need detailed time tracking (hours worked per day/week)?

### Security Considerations:

1. **Permission Checks**: Always verify permissions in application layer before allowing actions
2. **Audit Trail**: All permission assignments and revocations should be logged
3. **Soft Deletes**: Use `deleted_at` for staff to preserve history
4. **Clerk Integration**: Sync `staff_type` and key permissions to Clerk `publicMetadata` for frontend checks

### Performance Considerations:

1. **Permission Caching**: Cache staff permissions in application layer (with TTL)
2. **Activity Log Cleanup**: Consider archiving old activity logs
3. **Index Usage**: All foreign keys and frequently queried columns are indexed

---

## 11. Integration Points

### With Existing Tables:

- **`physical_printed_inventory`**: Tracks `printed_by`, `quality_checked_by` (item-level operations)
- **`orders`**: Tracks `packaged_by`, `shipped_by` (order-level operations); staff activities can reference order IDs
- **`quality_control_checks`**: Links to `staff.id` via `checked_by`
- **`print_jobs`**: Tracks staff assignment via `assigned_to`

### With Clerk Authentication:

- **`staff.clerk_user_id`**: Links to Clerk user
- **Permission Sync**: Sync active permissions to Clerk `publicMetadata` for frontend authorization
- **Role Mapping**: Map `staff_type` to Clerk roles

---

## 12. Migration Strategy

### Phase 1: Create Core Tables

1. Create `staff` table
2. Create `permissions` table
3. Create `staff_permissions` table
4. Seed default permissions

### Phase 2: Add Shift Tracking

1. Create `shifts` table

### Phase 3: Add Activity Logging

1. Create `staff_activities` table

### Phase 4: Update Existing Tables

1. Add staff tracking columns to `physical_printed_inventory`
2. Create/update `quality_control_checks` table
3. Add staff tracking columns to existing `print_jobs` table
4. Add staff tracking columns to `orders` table

### Phase 5: Data Migration

1. Migrate existing admin/moderator users to `staff` table
2. Assign default permissions based on roles
3. Update existing records with staff references where possible

---

## Next Steps

1. Review and approve this schema design
2. Clarify any questions above
3. Create migration scripts
4. Implement application layer services
5. Build UI for permission management and shift scheduling
