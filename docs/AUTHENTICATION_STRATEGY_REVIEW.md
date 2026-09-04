# 🔐 Authentication Strategy Review & Improvement Plan

## Current State Analysis

### ✅ **What's Working Well**

1. **Clerk Integration**
   - ✅ Using Clerk for authentication (industry-standard)
   - ✅ Middleware-based route protection
   - ✅ Session management handled by Clerk
   - ✅ OAuth providers support

2. **Basic Role-Based Access Control**
   - ✅ Role-based route protection in middleware
   - ✅ Client-side `RoleGuard` component
   - ✅ Role stored in Clerk `publicMetadata`

3. **Onboarding Flow**
   - ✅ Onboarding status tracking
   - ✅ Automatic role assignment ("partner" by default)

---

## 🔴 **Critical Issues Identified**

### **1. Role System Confusion** ⚠️ **HIGH PRIORITY**

**Problem:**
- **Clerk Roles**: `"admin"` | `"partner"` (stored in `publicMetadata.role`)
- **Database Staff Types**: `"admin"` | `"moderator"` | `"fulfillment"` (stored in `staff.staff_type`)
- **No Connection**: Clerk roles and staff types are disconnected

**Current Code:**
```typescript
// Middleware checks Clerk role
if (sessionClaims?.metadata?.role === "admin") {
  return NextResponse.next();
}

// But staff table has different types
staff_type: "admin" | "moderator" | "fulfillment"
```

**Impact:**
- Staff members can't be properly authenticated
- No way to check if a Clerk user is staff
- Role checks are inconsistent
- Staff permissions can't be enforced

---

### **2. Missing Staff Authentication Flow** 🔴 **CRITICAL**

**Problem:**
- Staff table has `clerk_user_id` but no authentication flow
- No way to identify staff members from Clerk session
- Staff can't log in with their staff permissions

**Missing:**
- Staff login/registration flow
- Staff role assignment in Clerk
- Staff permission checking
- Staff session management

---

### **3. No API Route Permission Checks** 🔴 **CRITICAL SECURITY RISK**

**Problem:**
- API routes don't validate user permissions
- No role checks in API handlers
- Anyone with a valid session can call any API

**Example:**
```typescript
// Current: No permission checks
export async function POST(request: Request) {
  const body = await request.json();
  const order = await ordersApplicationService.createOrder(body);
  return NextResponse.json(order);
}

// Should be:
export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Check if user can create orders
  if (sessionClaims?.metadata?.role !== "partner" && 
      sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // ... rest of logic
}
```

**Impact:**
- **Security vulnerability**: Unauthorized access to APIs
- **Data breach risk**: Users can access/modify data they shouldn't
- **Compliance issues**: No audit trail of who did what

---

### **4. No Row Level Security (RLS)** 🔴 **CRITICAL SECURITY RISK**

**Problem:**
- Supabase RLS policies not implemented
- Database-level access control missing
- Direct database access possible if API is bypassed

**Impact:**
- Even if API is secured, direct database access is possible
- No defense-in-depth security
- Data can be accessed without going through application layer

---

### **5. Inconsistent Permission Checking** ⚠️ **MEDIUM PRIORITY**

**Problem:**
- Some routes check roles, others don't
- No centralized permission checking utility
- Permission logic scattered across codebase

**Example:**
```typescript
// Middleware checks role
if (sessionClaims?.metadata?.role === "admin") { ... }

// But API routes don't check
export async function POST() { ... } // No checks!

// Components check differently
const isAdmin = user?.publicMetadata?.role === "admin";
```

---

### **6. No Granular Permissions** ⚠️ **MEDIUM PRIORITY**

**Problem:**
- Only role-based access (admin/partner)
- Staff have granular permissions in database but they're not used
- Can't check specific permissions (e.g., "can_print_products")

**Current:**
```typescript
// Only checks role
if (isAdmin) { ... }
```

**Should Support:**
```typescript
// Check specific permission
if (hasPermission("print_products")) { ... }
```

---

### **7. Missing Session Validation** ⚠️ **MEDIUM PRIORITY**

**Problem:**
- No session expiration handling
- No refresh token management
- No session invalidation on role/permission changes

---

### **8. No Multi-Factor Authentication (MFA)** ⚠️ **LOW PRIORITY**

**Problem:**
- MFA not enforced for sensitive operations
- No 2FA for admin actions
- No MFA for staff operations

---

## 🎯 **Recommended Authentication Strategy**

### **Phase 1: Unified Role System** (Priority: CRITICAL)

#### **1.1 Define Unified Role Hierarchy**

```typescript
// Unified role system
type UserRole = 
  | "affiliate"      // Affiliate/Partner (default)
  | "staff"          // Staff member (fulfillment, moderator)
  | "admin";         // Platform admin

// Staff sub-types (stored in database)
type StaffType = 
  | "fulfillment"    // Fulfillment staff
  | "moderator"      // Moderator
  | "admin";         // Staff admin (can manage staff)

// Granular permissions (stored in database)
type Permission = 
  | "print_products"
  | "quality_check"
  | "process_shipping"
  | "manage_orders"
  | "manage_affiliates"
  | "manage_staff"
  | ...;
```

#### **1.2 Role Assignment Strategy**

```typescript
// Clerk publicMetadata structure
{
  role: "affiliate" | "staff" | "admin",
  staffId?: number,              // If staff, link to staff table
  affiliateId?: number,          // If affiliate, link to affiliates table
  permissions?: string[],        // Cached permissions (optional)
  onboardingComplete: boolean
}
```

#### **1.3 Staff Authentication Flow**

```typescript
// When staff member logs in:
1. User authenticates with Clerk
2. Check if clerk_user_id exists in staff table
3. If yes:
   - Set role = "staff" in Clerk metadata
   - Set staffId in Clerk metadata
   - Load permissions from staff_permissions table
   - Cache permissions in session (optional)
4. If no:
   - Check if admin (special handling)
   - Otherwise, default to "affiliate"
```

---

### **Phase 2: API Route Protection** (Priority: CRITICAL)

#### **2.1 Create Auth Utilities**

```typescript
// src/shared/utils/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { staffApplicationService } from "@/features/staff/application/services/staffApplicationService";

export async function getAuthenticatedUser() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const role = sessionClaims?.metadata?.role as string;
  const staffId = sessionClaims?.metadata?.staffId as number | undefined;
  const affiliateId = sessionClaims?.metadata?.affiliateId as number | undefined;

  return {
    userId,
    user,
    role,
    staffId,
    affiliateId,
    sessionClaims,
  };
}

export async function requireRole(allowedRoles: string[]) {
  const { role } = await getAuthenticatedUser();
  
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  return getAuthenticatedUser();
}

export async function requirePermission(permission: string) {
  const { role, staffId } = await getAuthenticatedUser();
  
  // Admins have all permissions
  if (role === "admin") {
    return getAuthenticatedUser();
  }
  
  // Staff need specific permission
  if (role === "staff" && staffId) {
    const hasPermission = await staffApplicationService.hasPermission(
      staffId,
      permission
    );
    
    if (!hasPermission) {
      throw new Error(`Forbidden: Missing permission: ${permission}`);
    }
    
    return getAuthenticatedUser();
  }
  
  // Affiliates have limited permissions (check in application layer)
  throw new Error(`Forbidden: Missing permission: ${permission}`);
}
```

#### **2.2 Protect API Routes**

```typescript
// src/app/api/orders/route.ts
import { requireRole } from "@/shared/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Require affiliate or admin role
    const { userId, role, affiliateId } = await requireRole([
      "affiliate",
      "admin",
    ]);

    const body = await request.json();

    // If affiliate, ensure they can only create orders for themselves
    if (role === "affiliate" && body.affiliate_id !== affiliateId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot create orders for other affiliates" },
        { status: 403 }
      );
    }

    const order = await ordersApplicationService.createOrder(body);
    return NextResponse.json(order);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### **Phase 3: Database-Level Security** (Priority: CRITICAL)

#### **3.1 Implement Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Orders: Affiliates can only see their own orders
CREATE POLICY "Affiliates can view their own orders"
  ON orders FOR SELECT
  USING (
    affiliate_id = (
      SELECT id FROM affiliates 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Orders: Admins can see all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND staff_type = 'admin'
    )
  );

-- Staff: Staff can only see their own record
CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Staff: Admins can view all staff
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.clerk_user_id = auth.jwt() ->> 'sub'
      AND s.staff_type = 'admin'
    )
  );
```

#### **3.2 Create Supabase Auth Functions**

```sql
-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Check if user is staff
  IF EXISTS (
    SELECT 1 FROM staff 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ) THEN
    RETURN 'staff';
  END IF;
  
  -- Check if user is affiliate
  IF EXISTS (
    SELECT 1 FROM affiliates 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ) THEN
    RETURN 'affiliate';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **Phase 4: Enhanced Middleware** (Priority: HIGH)

#### **4.1 Update Middleware with Staff Support**

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { staffApplicationService } from "@/features/staff/application/services/staffApplicationService";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/set-role",
  "/api/uploadthing",
  "/api/clerk/update-user",
]);

const isAffiliateRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/orders(.*)",
  "/products(.*)",
  "/payouts(.*)",
  "/analytics(.*)",
  "/courses(.*)",
  "/gamification(.*)",
  "/profile(.*)",
]);

const isStaffRoute = createRouteMatcher([
  "/staff(.*)",
  "/inventory(.*)",
  "/fulfillment(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/staff(.*)",
  "/affiliates(.*)",
  "/analytics(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Unauthenticated users
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Check onboarding
  const onboardingComplete = sessionClaims?.metadata?.onboardingComplete;
  if (!onboardingComplete && req.nextUrl.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Get role from metadata or database
  let role = sessionClaims?.metadata?.role as string;
  let staffId = sessionClaims?.metadata?.staffId as number | undefined;

  // If role not in metadata, check database
  if (!role) {
    // Check if user is staff
    try {
      const staff = await staffApplicationService.getStaffByClerkUserId(userId);
      if (staff) {
        role = "staff";
        staffId = staff.id;
        
        // Update Clerk metadata (async, don't block)
        clerk.users.updateUser(userId, {
          publicMetadata: {
            role: "staff",
            staffId: staff.id,
          },
        }).catch(console.error);
      } else {
        // Check if affiliate
        // ... check affiliates table
        role = "affiliate";
      }
    } catch (error) {
      // Default to affiliate if check fails
      role = "affiliate";
    }
  }

  // Route access control
  if (role === "admin") {
    return NextResponse.next(); // Admins can access everything
  }

  if (role === "staff") {
    // Staff can access staff routes and affiliate routes (limited)
    if (isStaffRoute(req) || isAffiliateRoute(req)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/staff/dashboard", req.url));
  }

  if (role === "affiliate") {
    // Affiliates can only access affiliate routes
    if (isAffiliateRoute(req)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unknown role, redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
});
```

---

### **Phase 5: Permission System** (Priority: MEDIUM)

#### **5.1 Create Permission Checking Service**

```typescript
// src/shared/services/permissionService.ts
import { staffApplicationService } from "@/features/staff/application/services/staffApplicationService";
import { getAuthenticatedUser } from "@/shared/utils/auth";

export class PermissionService {
  static async hasPermission(permission: string): Promise<boolean> {
    const { role, staffId } = await getAuthenticatedUser();

    // Admins have all permissions
    if (role === "admin") {
      return true;
    }

    // Staff need specific permission
    if (role === "staff" && staffId) {
      return await staffApplicationService.hasPermission(staffId, permission);
    }

    // Affiliates have limited permissions
    const affiliatePermissions = [
      "view_own_orders",
      "create_orders",
      "view_own_commissions",
      "request_payout",
    ];

    return affiliatePermissions.includes(permission);
  }

  static async requirePermission(permission: string): Promise<void> {
    const hasPermission = await this.hasPermission(permission);
    
    if (!hasPermission) {
      throw new Error(`Forbidden: Missing permission: ${permission}`);
    }
  }
}
```

#### **5.2 Add Permission Checks to Application Services**

```typescript
// src/features/orders/application/services/ordersApplicationService.ts
import { PermissionService } from "@/shared/services/permissionService";

export class OrdersApplicationService {
  async createOrder(order: CreateOrderRequest): Promise<OrderEntity> {
    // Check permission
    await PermissionService.requirePermission("create_orders");
    
    // ... rest of logic
  }

  async updateOrder(id: string, order: UpdateOrderRequest): Promise<OrderEntity> {
    // Check permission
    await PermissionService.requirePermission("manage_orders");
    
    // ... rest of logic
  }
}
```

---

### **Phase 6: Enhanced Client-Side Auth** (Priority: MEDIUM)

#### **6.1 Update useAuth Hook**

```typescript
// src/shared/hooks/use-auth.ts
"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { staffApplicationService } from "@/features/staff/application/services/staffApplicationService";

export function useAuth() {
  const { user, isLoaded } = useUser();
  
  const role = user?.publicMetadata?.role as string | undefined;
  const staffId = user?.publicMetadata?.staffId as number | undefined;
  const affiliateId = user?.publicMetadata?.affiliateId as number | undefined;

  // Fetch staff permissions if staff
  const { data: permissions } = useQuery({
    queryKey: ["staff-permissions", staffId],
    queryFn: () => staffApplicationService.getStaffPermissions(staffId!),
    enabled: role === "staff" && !!staffId,
  });

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isAffiliate = role === "affiliate";

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    if (isStaff && permissions) {
      return permissions.some(p => p.permission_code === permission);
    }
    // Affiliate permissions (hardcoded for now)
    const affiliatePermissions = [
      "view_own_orders",
      "create_orders",
      "view_own_commissions",
    ];
    return affiliatePermissions.includes(permission);
  };

  return {
    user,
    isLoaded,
    role,
    staffId,
    affiliateId,
    isAdmin,
    isStaff,
    isAffiliate,
    permissions,
    hasPermission,
  };
}
```

#### **6.2 Create PermissionGuard Component**

```typescript
// src/shared/components/auth/PermissionGuard.tsx
"use client";

import { useAuth } from "@/shared/hooks/use-auth";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Critical Security Fixes** (Week 1-2)

- [ ] Create unified role system
- [ ] Implement API route protection utilities
- [ ] Add permission checks to all API routes
- [ ] Implement RLS policies for all tables
- [ ] Update middleware with staff support

### **Phase 2: Staff Authentication** (Week 3-4)

- [ ] Create staff authentication flow
- [ ] Link Clerk users to staff table
- [ ] Update role assignment logic
- [ ] Test staff login/access

### **Phase 3: Permission System** (Week 5-6)

- [ ] Create permission checking service
- [ ] Add permission checks to application services
- [ ] Update client-side auth hooks
- [ ] Create PermissionGuard component

### **Phase 4: Testing & Documentation** (Week 7-8)

- [ ] Write tests for auth utilities
- [ ] Test all permission scenarios
- [ ] Document authentication flow
- [ ] Security audit

---

## 🎯 **Expected Outcomes**

### **Security Improvements:**
- ✅ All API routes protected
- ✅ Database-level security (RLS)
- ✅ Consistent permission checking
- ✅ Defense-in-depth security

### **Functionality Improvements:**
- ✅ Staff can authenticate and access system
- ✅ Granular permissions working
- ✅ Unified role system
- ✅ Better user experience

### **Maintainability:**
- ✅ Centralized auth utilities
- ✅ Consistent patterns
- ✅ Easy to add new permissions
- ✅ Clear documentation

---

## 📊 **Priority Matrix**

| Issue | Priority | Impact | Effort | Timeline |
|-------|----------|--------|--------|----------|
| API Route Protection | 🔴 Critical | High | Medium | Week 1-2 |
| RLS Policies | 🔴 Critical | High | High | Week 1-2 |
| Unified Role System | 🔴 Critical | High | Medium | Week 1-2 |
| Staff Authentication | 🟠 High | High | Medium | Week 3-4 |
| Permission System | 🟠 High | Medium | High | Week 5-6 |
| Enhanced Middleware | 🟡 Medium | Medium | Low | Week 3-4 |
| Client-Side Auth | 🟡 Medium | Low | Low | Week 5-6 |
| MFA | 🟢 Low | Low | High | Future |

---

**Last Updated:** December 2024  
**Next Review:** After Phase 1 implementation

