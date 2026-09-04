## Bellami Ecommerce COD Store Database Plan

### 1. Authoritative Schema Reference

- Source: `src/infrastructure/supabase/types.ts`
- Relevant tables: `products`, `items`, `inventory`, `product_images`, `leads`, `lead_item`
- Supporting views/functions (for future use): `items_inventory`, `items_inventorys`, Supabase RPCs like `decrement_inventory`

### 2. Requirements Recap

- List products on the home page with accurate stock and imagery
- Provide keyword search across catalog data
- Support add-to-cart and direct “Order Now” (COD) flows
- On submission create a `leads` row and one or more `lead_item` rows tied to product variants

### 3. Current Table Summaries

- `products`: Catalog metadata (name, description, category, pricing tiers, commissions, thumbnail, weight)
- `items`: Variant records referencing `products` (color, size, variant thumbnail, cost of goods)
- `inventory`: One-to-one with `items`, stores available quantity (nullable, no reserved tracking)
- `product_images`: Additional gallery URLs per product (no ordering/featured flag yet)
- `leads`: COD order header with customer/contact details and denormalized product/color/size fields
- `lead_item`: Junction linking `leads` to specific variants (`item_id`, `qty`)

### 4. Relationship Overview

- `products` ↔ `items` (1:N) handles color/size variants
- `items` ↔ `inventory` (1:1) provides stock counts
- `leads` ↔ `lead_item` (1:N) captures items per COD order
- `product_images` → `products` adds media assets

### 5. Identified Gaps

- Redundant columns on `leads` (`product`, `color`, `size`) duplicate variant truth; plan migration/trigger or view to centralize data
- Variant pricing missing: confirm whether to use `products.retail_price` or add per-`items` price column
- Inventory lacks reserved quantity; race conditions possible during COD submission
- Admin workflow needs bulk editing for variant inventory per product
- Inventory visibility currently limited to raw `inventory.quantity`; lacks phase tracking (in delivery, delivered, ordered)
- Search requires composite/FTS indexing across product name/category/variant attributes
- No visibility/status flags for catalog soft deletes or scheduling
- Gallery ordering not defined (only URL stored)
- Missing merchandising abstraction for `product_pages` tied to `products`/`items`
- Cart/session schema absent; required to support add-to-cart before COD conversion
- Admin tooling must control products, inventory, and `product_pages`; permissions not yet defined

### 6. Planned Database Enhancements (No Execution Yet)

1. **Views**
   - `products_catalog_view`: aggregate product basics, min/max price, total stock (`SUM(inventory.quantity)`), primary image (from `product_images` or fallback `products.thumbnail`)
   - `product_variants_view`: expose `items` joined with `inventory` for variant lists
   - `product_pages_view`: combine `product_pages`, featured variants/images, SEO metadata for storefront queries
2. **New Tables / Structures**
   - `product_pages`: marketing layer referencing `products` (fields to plan: `id`, `product_id`, `slug`, `headline`, `subheadline`, `hero_media`, `is_active`, timestamps)
   - `product_page_items`: optional ordering/spotlight for variants per page (bridge between `product_pages` and `items`)
   - `product_page_images`: normalized gallery with `position`, `image_url`, `alt_text`, `is_primary` (alternatively store as JSONB in `product_pages`; decision pending UX preference)
   - Cart ecosystem:
     - `carts` (fields: `id`, `customer_id|null`, `session_token`, `created_at`, `updated_at`, `status`, `expires_at`)
     - `cart_items` (`cart_id`, `item_id`, `product_page_id|null`, `qty`, `price_snapshot`)
     - `cart_events` or `cart_audits` (optional analytics, track adjustments)
   - Inventory management enhancements:
     - Consider `inventory_adjustments` log table capturing bulk modifications (fields: `id`, `product_id`, `adjusted_by`, `delta_snapshot`, `note`, timestamps)
     - Materialized view or aggregation table `product_inventory_phases` summarizing counts per product across phases (`in_stock`, `ordered`, `in_delivery`, `delivered`)
3. **Stored Procedures / RPCs**
   - `sync_cart_to_lead(cart_id, customer_payload)` to convert cart content into `leads` + `lead_item` while logging intended quantities
   - Inventory/order lifecycle continues to rely on existing CRM RPCs—no new database procedures required here
4. **Data Integrity**
   - Add constraints or triggers preventing negative inventory and syncing `leads` denormalized fields until migration complete
   - Introduce `is_active` / `visible_from` / `visible_to` on `products`, `items`, and `product_pages`
   - Enforce unique `product_pages.slug` and `product_page_images.position` per page (if normalized)
5. **Search Optimization**
   - Create GIN or trigram index covering `products.name`, `products.category`, and aggregated variant attributes exposed via view
   - Additional indexes on `product_pages` (e.g., `headline`, `seo_metadata`) to power storefront search/suggestions
6. **Media Management**
   - Extend `product_images` with `position`/`is_primary` columns or enforce ordering via view
   - If `product_page_images` uses JSONB, define schema validation and size limits; if normalized, plan cascading deletes

### 7. Frontend/Data-Layer Plan (Pseudocode Illustration)

```ts
const fetchProductCatalog = async ({ search, limit }) => {
  const base = supabase
    .from("products_catalog_view")
    .select(
      "id, name, description, min_price, max_price, total_stock, primary_image"
    )
    .ilike("name", `%${search ?? ""}%`)
    .order("created_at", { ascending: false })
    .limit(limit ?? 24);

  const { data, error } = await base;
  if (error) throw error;
  return data ?? [];
};

const fetchProductPage = async (slug) => {
  const { data, error } = await supabase
    .from("product_pages_view")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
};

const createLeadWithItems = async ({ customer, items }) => {
  validateLeadInputs(customer, items);

  const leadResult = await supabase
    .from("leads")
    .insert(mapLead(customer))
    .select()
    .single();

  if (leadResult.error) throw leadResult.error;

  for (const selection of items) {
    await supabase.from("lead_item").insert({
      lead_id: leadResult.data.id,
      item_id: selection.itemId,
      qty: selection.qty,
    });
  }

  return leadResult.data;
};

const addCartItem = async ({ cartId, itemId, qty }) => {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("id", cartId)
    .maybeSingle();
  if (cartError) throw cartError;

  const targetCartId = cart?.id ?? (await createAnonymousCart()).id;

  const { error: upsertError } = await supabase.from("cart_items").upsert(
    {
      cart_id: targetCartId,
      item_id: itemId,
      qty,
    },
    { onConflict: "cart_id,item_id" }
  );
  if (upsertError) throw upsertError;

  return targetCartId;
};

const fetchInventoryForProduct = async (productId) => {
  const { data, error } = await supabase
    .from("product_inventory_phases")
    .select("*")
    .eq("product_id", productId)
    .single();
  if (error) throw error;
  return data;
};

const bulkUpdateInventory = async ({ productId, adjustments }) => {
  // adjustments: Array<{ itemId, newQuantity }>
  const { error } = await supabase.rpc("bulk_update_product_inventory", {
    product_id_in: productId,
    adjustments_in: adjustments,
  });
  if (error) throw error;
};
```

### 8. Testing Strategy

- Unit tests for Supabase service functions using established mocking patterns (return `result.data` directly, mock RPCs)
- Component tests for catalog/search, product page, cart, and checkout flows ensuring Tailwind classes, accessibility, early returns
- Validation tests covering COD form edge cases (missing fields, zero quantity, out-of-stock) and cart quantity adjustments

### 9. Error Prevention & Handling

- Validate customer details and quantities before mutations; guard against `null` stock values
- Provide user-friendly error messages for inventory conflicts and Supabase failures
- Log failures via existing `audit_logs` infrastructure if available
- Fallback behaviors: default image when `product_images` empty, hide price data gracefully when unavailable
- Cart resilience: auto-create guest carts, expire inactive carts, merge guest cart into user account on login
- Product page publishing workflow: draft/published flags to avoid exposing incomplete content
- Lead lifecycle: only decrement inventory after a lead is confirmed into an `order`; COD means inventory remains available until courier pickup
- Inventory adjustments: audit every bulk change, support undo via inverse entries
- Phase tracking: ensure `product_inventory_phases` refreshes when order status changes (trigger or scheduled job)

### 10. Limitations & Considerations

- Schema changes must preserve compatibility with existing analytics/reporting relying on denormalized `leads` fields
- Inventory procedures depend on permissions to create RPCs/trigger functions in Supabase
- Search improvements may require enabling Postgres extensions (coordinate with DB ops)
- Precise pricing model needs confirmation before adding new columns or calculations
- Decide between JSONB vs normalized tables for `product_page_images`; relational design offers ordering constraints, JSONB simplifies bulk edits
- Multiple `product_pages` per product means the admin dashboard must visualize relationships and prevent conflicting statuses
- Dashboard requires role-based access to manage catalog vs fulfillment; plan Supabase policies accordingly
- COD funnel reminders:
  - Lead submission ≠ sale; a verification step must convert lead → order
  - Order marked delivered before counting as revenue and deducting final inventory
- Bulk inventory adjustments require transactional safety to avoid partial updates; consider locking or queueing
- Phase tracking accuracy depends on CRM updating `orders.status` promptly; define SLAs for sync cadence
