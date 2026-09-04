# 🚫 When NOT to Use Optimistic UI - Referio Platform

## 📋 Executive Summary

While optimistic UI can dramatically improve user experience, there are critical scenarios in the Referio affiliate marketing platform where optimistic updates should be **avoided** or used with **extreme caution**. This document identifies these anti-patterns to prevent data corruption, security vulnerabilities, and business logic violations.

---

## 🚨 Critical Anti-Patterns

### **1. Financial Operations** ❌ **NEVER USE OPTIMISTIC UI**

| **Operation**               | **Risk Level**  | **Reason**                            | **Alternative**                     |
| --------------------------- | --------------- | ------------------------------------- | ----------------------------------- |
| **Payout Creation**         | 🔴 **CRITICAL** | Money transactions must be atomic     | Show loading state, confirm success |
| **Commission Calculations** | 🔴 **CRITICAL** | Financial accuracy is paramount       | Real-time validation only           |
| **Payment Processing**      | 🔴 **CRITICAL** | Cannot show false payment status      | Loading indicators + confirmation   |
| **Balance Updates**         | 🔴 **CRITICAL** | False balance could cause disputes    | Server-validated updates only       |
| **Refund Processing**       | 🔴 **CRITICAL** | Money operations require verification | No optimistic updates               |

**Example - Payout Creation:**

```typescript
// ❌ NEVER DO THIS
const createPayoutMutation = useOptimisticMutation(
  (data) => payoutsService.createPayout(data),
  {
    optimisticUpdate: (data) => {
      // ❌ NEVER show optimistic payout - could show false money
      queryClient.setQueryData(["payouts"], (oldData) => [
        ...oldData,
        optimisticPayout,
      ]);
    },
  }
);

// ✅ CORRECT APPROACH
const createPayoutMutation = useStandardMutation(
  (data) => payoutsService.createPayout(data),
  {
    onSuccess: (data) => {
      // Only update after server confirmation
      queryClient.setQueryData(["payouts"], (oldData) => [...oldData, data]);
      toast({ title: "Payout created successfully" });
    },
  }
);
```

### **2. Authentication & Authorization** ❌ **NEVER USE OPTIMISTIC UI**

| **Operation**          | **Risk Level**  | **Reason**                                 | **Alternative**               |
| ---------------------- | --------------- | ------------------------------------------ | ----------------------------- |
| **Login/Logout**       | 🔴 **CRITICAL** | Security state must be server-validated    | Redirect on server response   |
| **Role Changes**       | 🔴 **CRITICAL** | Access control cannot be optimistic        | Server-validated role updates |
| **Permission Updates** | 🔴 **CRITICAL** | Security implications of false permissions | Real-time permission checks   |
| **Session Management** | 🔴 **CRITICAL** | Authentication state is security-critical  | Server-controlled sessions    |

**Example - Role Assignment:**

```typescript
// ❌ NEVER DO THIS
const updateRoleMutation = useOptimisticMutation(
  (data) => authService.updateUserRole(data),
  {
    optimisticUpdate: (data) => {
      // ❌ NEVER show optimistic role - security risk
      queryClient.setQueryData(["user"], (oldUser) => ({
        ...oldUser,
        role: data.role,
      }));
    },
  }
);

// ✅ CORRECT APPROACH
const updateRoleMutation = useStandardMutation(
  (data) => authService.updateUserRole(data),
  {
    onSuccess: (data) => {
      // Server validates and returns actual role
      queryClient.setQueryData(["user"], data);
      // Force re-authentication if role changed
      if (data.role !== currentUser.role) {
        window.location.reload();
      }
    },
  }
);
```

### **3. Data Integrity Operations** ⚠️ **USE WITH EXTREME CAUTION**

| **Operation**                  | **Risk Level**  | **Reason**                                 | **Guidelines**             |
| ------------------------------ | --------------- | ------------------------------------------ | -------------------------- |
| **Lead Creation**              | 🔴 **CRITICAL** | Financial impact, commission calculations  | Standard mutations only    |
| **Lead Updates**               | 🔴 **CRITICAL** | Business logic, workflow triggers          | Standard mutations only    |
| **Lead Status to "Confirmed"** | 🔴 **CRITICAL** | Financial implications, payout eligibility | Standard mutations only    |
| **Order Creation**             | 🔴 **CRITICAL** | Inventory impact, commission triggers      | Standard mutations only    |
| **Order Updates**              | 🔴 **CRITICAL** | Business rules, financial calculations     | Standard mutations only    |
| **Order Status Changes**       | 🔴 **CRITICAL** | Inventory and business rules apply         | Standard mutations only    |
| **Product Inventory Updates**  | 🟡 **MEDIUM**   | Stock levels affect business logic         | Real-time inventory checks |
| **Commission Status Changes**  | 🔴 **CRITICAL** | Financial implications                     | Standard mutations only    |

**Example - Lead Creation (CORRECT APPROACH):**

```typescript
// ✅ CORRECT APPROACH - No optimistic updates for lead creation
const createLeadMutation = useStandardMutation(
  async (data: LeadFormValues): Promise<void> => {
    // Server validates all business rules
    const result = await workflowService.createLead(data, partnerId);
    if (result.error) {
      throw new Error(result.error.message);
    }
  },
  {
    onSuccess: () => {
      // Only update UI after server confirmation
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Lead creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  }
);
```

### **4. External API Dependencies** ❌ **AVOID OPTIMISTIC UI**

| **Operation**         | **Risk Level** | **Reason**                       | **Alternative**              |
| --------------------- | -------------- | -------------------------------- | ---------------------------- |
| **Email Sending**     | 🟡 **MEDIUM**  | External service reliability     | Show "sending" state         |
| **SMS Notifications** | 🟡 **MEDIUM**  | Third-party service dependency   | Loading state + confirmation |
| **File Uploads**      | 🟡 **MEDIUM**  | Network and storage dependencies | Progress indicators          |
| **Webhook Calls**     | 🟡 **MEDIUM**  | External system integration      | No optimistic updates        |

### **5. Audit & Compliance Operations** ❌ **NEVER USE OPTIMISTIC UI**

| **Operation**          | **Risk Level**  | **Reason**                        | **Alternative**           |
| ---------------------- | --------------- | --------------------------------- | ------------------------- |
| **Audit Log Creation** | 🔴 **CRITICAL** | Compliance requires accurate logs | Server-only logging       |
| **Data Export**        | 🟡 **MEDIUM**   | Export accuracy is critical       | Progress indicators       |
| **Backup Operations**  | 🟡 **MEDIUM**   | Data integrity requirements       | Server-controlled backups |
| **Compliance Reports** | 🔴 **CRITICAL** | Legal accuracy required           | No optimistic updates     |

---

## 🎯 Safe Optimistic UI Patterns

### **✅ Safe Operations for Optimistic UI**

| **Operation**        | **Why Safe**           | **Implementation**         |
| -------------------- | ---------------------- | -------------------------- |
| **UI State Changes** | No business impact     | Optimistic updates OK      |
| **Search/Filter**    | Read-only operations   | Show cached results        |
| **Navigation**       | No data modification   | Instant page transitions   |
| **Form Drafts**      | Local state only       | Auto-save to local storage |
| **UI Preferences**   | User-specific settings | Optimistic with fallback   |

### **✅ Conditional Optimistic UI**

```typescript
// Safe optimistic pattern with validation
const updateLeadMutation = useOptimisticMutation(
  (data) => leadsService.updateLead(data),
  {
    optimisticUpdate: (data) => {
      // Only if we can validate the change locally
      if (isValidLeadUpdate(data)) {
        queryClient.setQueryData(["leads", data.id], data);
      }
    },
    onError: (error, data) => {
      // Always rollback on error
      queryClient.invalidateQueries(["leads", data.id]);
    },
  }
);

function isValidLeadUpdate(data: LeadUpdateData): boolean {
  // Local validation before optimistic update
  return (
    data.name?.length > 0 &&
    data.email?.includes("@") &&
    data.status !== "confirmed"
  ); // Don't optimistically confirm
}
```

---

## 🛡️ Risk Mitigation Strategies

### **1. Server-Side Validation**

```typescript
// Always validate on server
const updateLeadStatus = async (leadId: number, status: string) => {
  // Server validates business rules
  const validation = await validateLeadStatusChange(leadId, status);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return await updateLead(leadId, status);
};
```

### **2. Rollback Mechanisms**

```typescript
// Always implement rollback
const mutation = useOptimisticMutation(mutationFn, {
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(["leads"]);

    // Snapshot previous value
    const previousData = queryClient.getQueryData(["leads"]);

    // Optimistic update
    queryClient.setQueryData(["leads"], optimisticData);

    return { previousData };
  },
  onError: (error, variables, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(["leads"], context.previousData);
    }
  },
});
```

### **3. User Feedback**

```typescript
// Clear user communication
const mutation = useOptimisticMutation(mutationFn, {
  onMutate: () => {
    toast({
      title: "Updating...",
      description: "Changes will be confirmed shortly",
      variant: "default",
    });
  },
  onError: () => {
    toast({
      title: "Update Failed",
      description: "Changes have been reverted",
      variant: "destructive",
    });
  },
});
```

---

## 📊 Decision Matrix

| **Operation Type**  | **Financial Impact** | **Security Impact** | **Data Integrity** | **Use Optimistic UI?** |
| ------------------- | -------------------- | ------------------- | ------------------ | ---------------------- |
| **Payout Creation** | 🔴 High              | 🔴 High             | 🔴 High            | ❌ **NEVER**           |
| **Lead Creation**   | 🔴 High              | 🟢 Low              | 🔴 High            | ❌ **NEVER**           |
| **Lead Updates**    | 🔴 High              | 🟢 Low              | 🔴 High            | ❌ **NEVER**           |
| **Order Creation**  | 🔴 High              | 🟢 Low              | 🔴 High            | ❌ **NEVER**           |
| **Order Updates**   | 🔴 High              | 🟢 Low              | 🔴 High            | ❌ **NEVER**           |
| **Product Search**  | 🟢 None              | 🟢 Low              | 🟢 None            | ✅ **SAFE**            |
| **Profile Update**  | 🟢 None              | 🟡 Medium           | 🟢 Low             | ✅ **SAFE**            |
| **Navigation**      | 🟢 None              | 🟢 None             | 🟢 None            | ✅ **SAFE**            |

---

## 🎯 Implementation Guidelines

### **1. Pre-Implementation Checklist**

- [ ] Is this a financial operation? → **NO OPTIMISTIC UI**
- [ ] Does this affect security/authentication? → **NO OPTIMISTIC UI**
- [ ] Can we validate the change locally? → **CAUTIOUS OPTIMISTIC UI**
- [ ] Is this a read-only operation? → **SAFE OPTIMISTIC UI**
- [ ] Can we implement proper rollback? → **REQUIRED FOR ALL**

### **2. Code Review Checklist**

- [ ] Financial operations use standard mutations
- [ ] Authentication operations use standard mutations
- [ ] All optimistic updates have rollback mechanisms
- [ ] Error handling is comprehensive
- [ ] User feedback is clear and accurate

### **3. Testing Requirements**

- [ ] Test rollback scenarios
- [ ] Test network failure cases
- [ ] Test concurrent operation conflicts
- [ ] Test data consistency after errors
- [ ] Test user experience during failures

---

## 📝 Conclusion

Optimistic UI is a powerful tool for improving user experience, but it must be used judiciously in the Referio platform. **Financial operations, authentication, and data integrity operations should never use optimistic UI** due to the risk of data corruption, security vulnerabilities, and business logic violations.

**Key Principles:**

1. **When in doubt, don't use optimistic UI**
2. **Always implement rollback mechanisms**
3. **Validate server-side for critical operations**
4. **Provide clear user feedback**
5. **Test failure scenarios thoroughly**

By following these guidelines, you can safely implement optimistic UI where it provides value while avoiding the risks associated with inappropriate use.

---

_Generated for: Referio Affiliate Marketing Platform_  
_Focus: Anti-patterns and Risk Mitigation_  
_Last Updated: $(date)_
