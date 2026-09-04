# Audit Logging Guide

## Overview

The audit logging system automatically tracks all INSERT, UPDATE, and DELETE operations across the application. This provides a complete audit trail for compliance, debugging, and tracking data changes.

## Architecture

### Components

1. **`audit_logs` table** - Stores all audit entries
2. **`AuditLogger` class** - Handles logging to the database
3. **`DatabaseWrapper`** - Automatically triggers audit logging on mutations
4. **`idUtils`** - Helper to determine ID field type (integer vs UUID)

## Database Schema

The `audit_logs` table supports both integer and UUID primary keys:

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NULL,           -- For integer IDs
  record_uuid UUID NULL,            -- For UUID IDs
  action VARCHAR(20) NOT NULL,      -- INSERT, UPDATE, DELETE
  old_values JSONB NULL,            -- Previous values
  new_values JSONB NULL,            -- New values
  changed_by INTEGER NULL,          -- affiliate_id or employee_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Usage

### Basic Usage in Services

Audit logging is enabled by adding `auditLog` configuration to `DatabaseWrapper.executeMutation`:

```typescript
await DatabaseWrapper.executeMutation(
  async () => {
    const { data, error } = await supabase
      .from("orders")
      .insert({ ... })
      .select()
      .single();
    return { data, error };
  },
  {
    operation: "create",
    table: "orders",
    auditLog: {
      enabled: true,
      action: "INSERT",
      recordId: newOrderId,        // or will be extracted from data.id
      changedBy: affiliateId,      // affiliate_id or employee_id
      newValues: { ... },          // Optional: override default (uses data)
    },
  }
);
```

### INSERT Operations

```typescript
async create(order: CreateOrderRequest): Promise<OrderEntity> {
  const orderId = crypto.randomUUID();

  const newOrder = await DatabaseWrapper.executeMutation(
    async () => {
      const { data, error } = await supabase
        .from("orders")
        .insert({ id: orderId, ...order })
        .select()
        .single();
      return { data, error };
    },
    {
      operation: "create",
      table: "orders",
      auditLog: {
        enabled: true,
        action: "INSERT",
        recordId: orderId,           // Required for INSERT
        changedBy: order.affiliate_id,
        newValues: {
          // Optional: specify which fields to log
          affiliate_id: order.affiliate_id,
          status: order.status,
          total: order.total,
        },
      },
    }
  );

  return this.mapToOrderEntity(newOrder);
}
```

### UPDATE Operations

For UPDATE operations, you should fetch the old values first:

```typescript
async update(id: string, updates: Partial<OrderEntity>): Promise<OrderEntity> {
  // Get old values for audit log
  const oldOrder = await this.getById(id);
  if (!oldOrder) {
    throw new Error("Order not found");
  }

  const updatedOrder = await DatabaseWrapper.executeMutation(
    async () => {
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      return { data, error };
    },
    {
      operation: "update",
      table: "orders",
      auditLog: {
        enabled: true,
        action: "UPDATE",
        recordId: id,
        changedBy: updates.affiliate_id || oldOrder.affiliate_id,
        oldValues: {
          // Log fields that changed
          status: oldOrder.status,
          total: oldOrder.total,
        },
        newValues: updates,
      },
    }
  );

  return this.mapToOrderEntity(updatedOrder);
}
```

### DELETE Operations

```typescript
async delete(id: string): Promise<void> {
  // Get old values for audit log
  const oldOrder = await this.getById(id);

  await DatabaseWrapper.executeMutation(
    async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);
      return { data: { id }, error };
    },
    {
      operation: "delete",
      table: "orders",
      auditLog: {
        enabled: true,
        action: "DELETE",
        recordId: id,
        changedBy: oldOrder?.affiliate_id,
        oldValues: oldOrder ? {
          status: oldOrder.status,
          customer_name: oldOrder.customer_name,
        } : undefined,
      },
    }
  );
}
```

## Record ID Handling

The system automatically handles both integer and UUID IDs:

- **Integer IDs** (e.g., `affiliates.id`): Uses `record_id` field
- **UUID IDs** (e.g., `orders.id`): Uses `record_uuid` field

If `recordId` is not provided in `auditLog`, the system will try to extract it from the returned data using:

- `data.id`
- `data.record_id`
- `data.recordId`

## Querying Audit Logs

### Get audit logs for a specific record

```typescript
import { AuditLogger } from "@/shared/utils/auditLogger";

// For integer ID
const logs = await AuditLogger.getAuditLogs("orders", orderId, 50);

// For UUID ID
const logs = await AuditLogger.getAuditLogs("orders", orderUuid, 50);
```

### Get audit logs for a table

```typescript
const logs = await AuditLogger.getTableAuditLogs("orders", 100);
```

### Get audit logs for a user

```typescript
const logs = await AuditLogger.getUserAuditLogs(affiliateId, 100);
```

## Best Practices

1. **Always include `changedBy`** - Use `affiliate_id` or `employee_id` to track who made the change
2. **Log meaningful fields** - Don't log every field, focus on important business fields
3. **Handle missing records** - For UPDATE/DELETE, handle cases where the record doesn't exist
4. **Don't log sensitive data** - Exclude passwords, tokens, or other sensitive information from `oldValues`/`newValues`
5. **Keep it lightweight** - Only log essential fields to avoid bloating the audit_logs table

## Performance Considerations

- Audit logging is **non-blocking** - failures won't break your operations
- Logging happens **asynchronously** after the mutation succeeds
- Use indexes on `table_name`, `record_id`/`record_uuid`, and `created_at` for fast queries

## Migration

To set up audit logging in your database:

1. Run the migration:

   ```bash
   # Run database/migrations/028_create_audit_logs_table.sql in Supabase
   ```

2. Regenerate Supabase types:

   ```bash
   npm run supabase:types
   ```

3. Start using audit logging in your services (see examples above)

## Example: Complete Service Implementation

See `src/features/orders/data/ordersService.ts` for a complete example of audit logging integration.
