# Prefix vs Separate Database: Complete Analysis

## Context

Two approaches to organize Referio platform tables:

1. **Prefix Approach**: Keep everything in one database with naming conventions (`referio_orders`, `rf_*`, `course_*`)
2. **Separate Database**: Move Referio tables to a completely separate database

---

## Option 1: Prefix Approach (Single Database)

### Pros ✅

#### Performance & Development

- **Fast TypeScript**: Single type file per database, manageable size
- **Simple Queries**: Direct joins across tables, no cross-database complexity
- **No Network Overhead**: All queries hit same database connection
- **Transaction Support**: ACID transactions across all tables (e.g., create order + commission in one transaction)
- **Easier Development**: One database to manage, one connection pool

#### Code Simplicity

- **No Schema Switching**: Direct table access `FROM orders` not `.schema('referio').from('orders')`
- **Standard Joins**: `JOIN affiliates ON ...` works everywhere
- **Unified Types**: All types in one `Database` type from Supabase
- **Consistent Patterns**: Same query patterns throughout codebase

#### Operations

- **Single Backup**: One database to backup/restore
- **Single Connection Pool**: More efficient connection management
- **Simple Monitoring**: One place to monitor performance
- **Easier Migrations**: Run all migrations in one transaction

#### Data Integrity

- **Foreign Keys**: Can enforce referential integrity across all tables
- **Atomic Operations**: Transactions span all features
- **Data Consistency**: Easier to maintain consistency

### Cons ❌

#### Organization

- **Longer Names**: `referio_orders` vs `orders` (minor, but exists)
- **Name Conflicts**: Must ensure prefixes don't clash (manageable)
- **Less "Clean" Separation**: Everything in one namespace (mostly aesthetic)

#### Scalability

- **Single Point of Scale**: One database handles all load
- **Shared Resources**: Marketplace and Referio compete for resources
- **Limited Isolation**: Heavy marketplace queries can impact Referio

#### Security

- **Shared Access**: Both platforms share same connection credentials
- **Less Isolation**: Harder to restrict access at database level

---

## Option 2: Separate Database

### Pros ✅

#### Isolation & Independence

- **Complete Isolation**: Zero impact between platforms
- **Independent Scaling**: Scale Referio and Marketplace separately
- **Independent Deployments**: Update one without affecting the other
- **Different Configurations**: Different performance settings per database

#### Security

- **Separate Credentials**: Different connection strings, different permissions
- **Schema Isolation**: One platform can't accidentally access other's data
- **Security Boundaries**: Easier to implement strict access controls

#### Organization

- **Clean Names**: `orders` in Referio DB vs `orders` in Marketplace DB
- **Clear Ownership**: Each database clearly belongs to one platform
- **Team Independence**: Different teams can own different databases

#### Operational

- **Independent Backups**: Backup/restore one without affecting other
- **Independent Monitoring**: Separate performance metrics
- **Easier to Split Later**: Already separated if you sell/spin off a platform

### Cons ❌

#### Complexity & Performance

- **Cross-Database Queries**: Need application-level joins (fetch from both DBs and join in code)
- **No Foreign Keys**: Can't enforce referential integrity across databases
- **No Transactions**: Can't have ACID transactions spanning both databases
- **Network Overhead**: Multiple database connections, more latency
- **Connection Pool Management**: Need to manage multiple connection pools

#### Development

- **Complex Setup**: Need multiple Supabase projects OR multiple databases in one project
- **Multiple Type Files**: Generate types for each database separately
- **Complex Joins**: Must fetch from both databases and join in application code
- **Duplication Risk**: Shared data (like `affiliates`) needs replication or special handling

#### Code Complexity

```typescript
// Separate DB approach - complex
const affiliate = await referioDb
  .from("affiliates")
  .select()
  .eq("id", id)
  .single();
const orders = await referioDb.from("orders").select().eq("affiliate_id", id);
const marketplaceOrders = await marketplaceDb
  .from("orders")
  .select()
  .eq("affiliate_id", id);
// Then join in code...

// Prefix approach - simple
const affiliate = await supabase
  .from("affiliates")
  .select()
  .eq("id", id)
  .single();
const referioOrders = await supabase
  .from("referio_orders")
  .select()
  .eq("affiliate_id", id);
const marketplaceOrders = await supabase
  .from("orders")
  .select()
  .eq("affiliate_id", id);
// Or use SQL joins if needed
```

#### Data Synchronization

- **Shared Data Problem**: If `affiliates` needs to be in both, requires replication
- **Consistency Challenges**: Keeping data consistent across databases
- **Sync Complexity**: Changes to shared data need to propagate

#### Operations

- **Multiple Backups**: Need to coordinate backups across databases
- **Multiple Migrations**: Run migrations separately (can't use transactions)
- **More Monitoring**: Track performance of multiple databases
- **Higher Costs**: Potentially more expensive (depending on provider)

---

## Real-World Scenarios

### Scenario 1: Affiliate Creates Order

**Prefix Approach:**

```sql
BEGIN;
  INSERT INTO referio_orders (...) VALUES (...);
  INSERT INTO commissions (order_id, affiliate_id, ...) VALUES (...);
  UPDATE affiliates SET total_orders = total_orders + 1;
COMMIT; -- All or nothing
```

**Separate DB:**

```typescript
// Need application-level transaction management
try {
  const order = await referioDb.insert("orders", orderData);
  const commission = await referioDb.insert("commissions", commissionData);
  await referioDb.update("affiliates", { total_orders: newCount });
  // If any fails, need manual rollback logic
} catch (error) {
  // Manual cleanup required
}
```

### Scenario 2: Get Affiliate Dashboard Data

**Prefix Approach:**

```sql
SELECT
  a.*,
  COUNT(ro.id) as referio_orders,
  COUNT(mo.id) as marketplace_orders,
  SUM(c.amount) as total_commissions
FROM affiliates a
LEFT JOIN referio_orders ro ON ro.affiliate_id = a.id
LEFT JOIN orders mo ON mo.affiliate_id = a.id
LEFT JOIN commissions c ON c.affiliate_id = a.id
WHERE a.id = ?
GROUP BY a.id;
```

**Separate DB:**

```typescript
const affiliate = await referioDb
  .from("affiliates")
  .select()
  .eq("id", id)
  .single();
const referioOrders = await referioDb
  .from("orders")
  .select("id")
  .eq("affiliate_id", id);
const marketplaceOrders = await marketplaceDb
  .from("orders")
  .select("id")
  .eq("affiliate_id", id);
const commissions = await referioDb
  .from("commissions")
  .select("amount")
  .eq("affiliate_id", id);

// Manually calculate totals in code
const totals = {
  referioOrders: referioOrders.length,
  marketplaceOrders: marketplaceOrders.length,
  commissions: commissions.reduce((sum, c) => sum + c.amount, 0),
};
```

### Scenario 3: Shared Affiliates Data

**Prefix Approach:**

- Single `affiliates` table, both platforms reference it

**Separate DB:**

- **Option A**: Replicate `affiliates` to both DBs (sync complexity)
- **Option B**: Keep `affiliates` in one DB, other platform makes API calls
- **Option C**: Shared database for affiliates only (defeats the purpose)

---

## Decision Matrix

| Factor                  | Prefix Approach         | Separate Database           |
| ----------------------- | ----------------------- | --------------------------- |
| **Development Speed**   | ⭐⭐⭐⭐⭐ Fast         | ⭐⭐ Slow                   |
| **Code Complexity**     | ⭐⭐⭐⭐⭐ Simple       | ⭐⭐ Complex                |
| **Performance**         | ⭐⭐⭐⭐ Good           | ⭐⭐⭐ Multiple connections |
| **Scalability**         | ⭐⭐⭐ Shared resources | ⭐⭐⭐⭐⭐ Independent      |
| **Security Isolation**  | ⭐⭐⭐ Good             | ⭐⭐⭐⭐⭐ Excellent        |
| **Operations**          | ⭐⭐⭐⭐⭐ Simple       | ⭐⭐⭐ Complex              |
| **Transaction Support** | ⭐⭐⭐⭐⭐ Full ACID    | ⭐⭐ Application-level      |
| **Data Integrity**      | ⭐⭐⭐⭐⭐ Foreign keys | ⭐⭐ Manual validation      |
| **Cost**                | ⭐⭐⭐⭐⭐ Lower        | ⭐⭐⭐ Higher               |
| **Team Independence**   | ⭐⭐⭐ Good             | ⭐⭐⭐⭐⭐ Excellent        |

---

## Recommendations by Use Case

### Use Prefix Approach If:

✅ **You have a single codebase**  
✅ **Platforms share core data** (like `affiliates`)  
✅ **Need transactions across features**  
✅ **Team size is small-medium**  
✅ **Cost optimization matters**  
✅ **Development speed is priority**  
✅ **Platforms are tightly integrated**

### Use Separate Database If:

✅ **Completely independent platforms** (different codebases, different teams)  
✅ **No shared data dependencies**  
✅ **Need maximum isolation/security**  
✅ **Different scaling requirements**  
✅ **Plan to sell/spin off a platform**  
✅ **Large teams with independent ownership**  
✅ **Different deployment cycles**

---

## My Recommendation for Your Project

### **Use Prefix Approach** 🎯

**Reasoning:**

1. **Single Codebase**: You're building one application with multiple features, not separate products
2. **Shared Core**: `affiliates` is central to both platforms - constant cross-references
3. **Performance Issues**: Separate DBs would make TypeScript/types even more complex
4. **Operational Simplicity**: Easier to manage, monitor, and maintain
5. **Development Speed**: Faster iteration, simpler code

**Implementation:**

```sql
public schema:
├── affiliates                    # Shared core
├── referio_orders               # Prefixed
├── referio_order_items          # Prefixed
├── commissions                  # Or referio_commissions (clear context)
├── affiliate_withdrawals        # Or referio_withdrawals
├── rf_*                         # Already prefixed
├── course_*                     # Already prefixed
└── [marketplace tables]         # Current names or mp_ prefix
```

**When to Consider Separate Database Later:**

- If you split into completely separate products/applications
- If you need to sell/spin off one platform
- If you have 20+ developers and need strict team boundaries
- If one platform needs extremely different scaling characteristics

---

## Hybrid Approach (Advanced)

If you need some isolation but not complete separation:

**Option: Same Supabase Project, Different Schemas (Current)**

- Pros: Some isolation, can query across schemas
- Cons: TypeScript complexity, `.schema()` calls everywhere

**Better Hybrid: Use Supabase Multi-Schema with Search Path**

- Configure `search_path` to include both schemas
- Use schema for logical separation, prefixes for clarity
- Best of both worlds (but adds complexity)

**Recommendation**: Start with prefixes, move to separate DB only if truly needed.
