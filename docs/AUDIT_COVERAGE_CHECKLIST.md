# Audit Coverage Checklist

## Goal

Track which mutation paths write to `audit_logs` and whether `changed_by`
is attributed from the authenticated user's `partners.id`.

## Current Status

- `audit_logs` writes remain enabled on the backend.
- `source` is still written in code, but hidden in the admin audit dashboard.
- Partner and admin dashboard mutations now use `partners.id` for `changed_by`
  in the main flows we patched.

## Covered Mutation Paths

### Orders

- `POST /api/orders`
  - Creates `orders` audit rows
  - `changed_by` uses the partner ID
- `PATCH /api/orders/[id]`
  - Updates are audited
  - Partner updates pass `changed_by`
- `DELETE /api/orders/[id]`
  - Deletes are audited
  - Partner deletes pass `changed_by`
- `PUT /api/orders/[id]/items`
  - Item replacement is audited
  - Partner updates pass `changed_by`

### Leads

- `POST /api/leads`
  - Lead creation is audited
  - Partner-created leads now inherit `changed_by`
- `PATCH /api/leads/[id]`
  - Lead updates are audited
  - Partner updates now inherit `changed_by`
- `DELETE /api/leads/[id]`
  - Lead deletes are audited
  - Partner deletes now inherit `changed_by`
- `PUT /api/leads/[id]/items`
  - Lead item replacement is audited
  - Partner updates now inherit `changed_by`
- `POST /api/leads/hops`
  - Hop creation is audited
  - Partner actions now inherit `changed_by`
- `PATCH /api/leads/hops/[leadId]/[agentId]`
  - Hop updates are audited
  - Partner actions now inherit `changed_by`
- `DELETE /api/leads/hops/[leadId]/[agentId]`
  - Hop deletes are audited
  - Partner actions now inherit `changed_by`
- `DELETE /api/leads/[id]/hops`
  - Bulk hop delete is audited
  - Partner actions now inherit `changed_by`

### Earnings And Withdrawals

- `POST /api/earnings/withdraw`
  - Withdraw request creation is audited
  - `changed_by` uses the partner ID
- `PATCH /api/earnings/withdraw/[id]`
  - Admin approval or denial is audited
  - `changed_by` uses the admin's partner ID

### Partner Account

- `PATCH /api/partner/me/payment`
  - Payment settings update is audited
  - `changed_by` uses the partner ID
- `POST /api/clerk/update-user`
  - Clerk profile update now writes an explicit audit row
- `GET /api/set-role`
  - Clerk role/onboarding sync now writes an explicit audit row

### Settings

- `PATCH /api/settings`
  - Settings updates are audited
  - `changed_by` uses the admin's partner ID

### Inventory

- `PATCH /api/inventory/[id]`
  - Quantity changes are audited
  - `changed_by` uses the admin's partner ID
- `POST /api/inventory/products/[productId]/bulk-adjust`
  - Bulk product adjustments are audited
  - `changed_by` uses the admin's partner ID
- `POST /api/inventory/refresh-phase-details`
  - Refresh RPC is now treated as a mutation and audited
  - `changed_by` uses the admin's partner ID

### Products And Product Pages

- `PATCH /api/products/[id]`
  - Product updates are audited
  - `changed_by` uses the admin's partner ID
- `POST /api/products/[id]/inventory/bulk`
  - Product inventory bulk updates are audited
  - `changed_by` uses the admin's partner ID
- `POST /api/product-pages`
  - Product page creation is audited
  - `changed_by` uses the admin's partner ID
- `PATCH /api/product-pages/[id]`
  - Product page updates are audited
  - `changed_by` uses the admin's partner ID
- `DELETE /api/product-pages/[id]`
  - Product page deletes are audited
  - `changed_by` uses the admin's partner ID
- `PUT /api/product-pages/[id]/with-relations`
  - Product page relation updates are audited
  - `changed_by` uses the admin's partner ID

## Shared Implementation Notes

- `src/shared/utils/databaseWrapper.ts`
  is the central audit entry point for wrapped mutations.
- `src/shared/server/auditActorContext.ts`
  provides a request-scoped fallback actor for `changed_by`.
- `src/shared/server/requireAuditActorPartnerId.ts`
  resolves the authenticated user's `partners.id` for admin-side mutations.

## Remaining Checks

- Do a final manual smoke test in the UI for:
  - partner order creation
  - partner lead creation and update
  - admin withdrawal approval
  - admin inventory adjustment
  - admin product page update
- If any endpoint still creates rows with `changed_by = null`, that route
  likely needs to be wrapped with `withAuditActor(...)`.
