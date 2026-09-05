# Codebase Review

**Project:** instanet-affiliate  
**Date:** 2026-09-05 (updated)  
**Method:** Static analysis of `src/features`, `src/app/api`, middleware, and migrations. No runtime pentest or load test.

---

## Summary

| Dimension | Score |
|-----------|------:|
| Clean Architecture | **7.0 / 10** |
| DDD | **5.5 / 10** |
| Security | **7.8 / 10** |
| Performance | **6.5 / 10** |
| Quality | **7.5 / 10** |
| **Overall** | **7.0 / 10** |

**Maturity:** Growing / Intermediate (L3) — feature-sliced modular monolith with ports and adapters; domain model is still mostly anemic.

**Bottom line:** Partner tenancy and privileged order-status paths are solid. Zod, UploadThing auth, leads pagination, SQL summary RPCs, server-authoritative order pricing, anonymous-safe public lead submission, and endpoint rate limiting closed several High/Med gaps. Remaining High risk is primarily service-role-without-RLS; Meta Conversion is still unauthenticated but now rate-limited. Performance leftover: dashboard/earnings still fetch-all + JS aggregation; missing `orders(partner_id, created_at)` index.

### Recent fixes reflected in this review

| Fix | Status |
|-----|--------|
| Partners cannot PATCH/POST `status` / `dc_recent_status` (and other privileged fields) | Verified — `partnerOrderFields.ts` + API routes |
| `examples/delivery-api.js` removed (hardcoded secrets) | Verified — file gone from working tree |
| `useUpdateOrderStatus` removed from client | Verified |
| Leads IDOR — list/read/update/delete/hops scoped by `partner_id` | Verified — `requireLeadAccess` + repository filters |
| Zod validation on API request bodies/queries | Verified — `parseRequest` + feature `validations.ts` |
| UploadThing auth via file-router middleware | Verified — Clerk session; product* admin-only |
| Leads list pagination (no full-table fetch on GET) | Verified — `getPaginated` + list columns + `046` index |
| Order/lead summaries via SQL aggregates | Verified — `get_order_summary` / `get_lead_summary` (`047`) |
| Order create pricing is server-authoritative | Verified — create path ignores client `product_price` / delivery fees; derives from product + ZR wilaya |
| Public storefront lead submit is anonymous-safe | Verified — `/api/leads/public` bypasses Clerk auth and strips client `status` |
| `supabaseAdmin` removed from browser-safe module | Verified — service-role access now goes through `server.ts` |
| Abuseable endpoints have server-side rate limiting | Verified — `meta-conversion`, `leads/public`, and UploadThing auth paths are throttled |

> If `delivery-api.js` was ever pushed with live ZR/Supabase keys, **rotate those credentials** — git history may still contain them.

---

## Scores by dimension

### Clean Architecture — 7 / 10

**Strengths**

- Consistent `domain` / `data` / `application` / `presentation` across core features (orders, products, earnings, dashboard, inventory, settings, leads).
- Domain stays free of Supabase / Next / React imports.
- Repository ports in domain; Supabase adapters in data with `mapRowToEntity` mappers.
- Presentation depends inward via application hooks → HTTP APIs (not repositories).
- Thin API adapters for most routes (orders, dashboard, earnings).
- Partner write policy lives in domain (`partnerOrderFields.ts`) and is enforced at the HTTP boundary.
- Delivery gateway port with ZR adapter in data.

**Weaknesses**

- Composition root sits inside application services (`new Supabase*` at module scope) — e.g. `orderApplicationService.ts`.
- Some API routes bypass into data (or presentation): `api/leads/public`, `api/product-pages/by-slug/.../assets`.
- Uneven feature maturity: `landing` (presentation-only), `marketplace-extension` (flat), `delivery` (no application layer).
- No hard module-boundary enforcement (e.g. dependency-cruiser / ESLint import rules).

---

### DDD — 5.5 / 10

**Strengths**

- Bounded feature contexts with repository ports and domain errors.
- Real domain helpers in dashboard (`rateLevel`, `dateRange`) and orders (`canDeleteOrder`, partner field policy).
- Application services act as use-case orchestrators (create order + commission + parcel; earnings summary + withdraw guards).
- Zod schemas in feature `domain/validations.ts` — good CA placement for input contracts.

**Weaknesses**

- Anemic, DB-shaped “entities” (snake_case persistence DTOs) — e.g. `orders/domain/entities.ts`.
- Thin value objects (filters / string unions) with little invariant protection.
- Business rules mostly in application services, not rich aggregates.
- Sanitization is at the HTTP edge; application `createOrder` / `updateOrder` still accept privileged fields if called without the API sanitizer.
- Partner order pricing is now derived on the server at create time, but PATCH still allows fee edits after create so pricing is not fully immutable end-to-end.
- Public lead route is safer now, but the authenticated lead-create path still allows partners to send workflow fields like `status` and `agent_id`.

---

### Security — 7.8 / 10

Up from **4.5** after partner order lockdown, secrets cleanup, leads IDOR, Zod on APIs, UploadThing auth, and server-side endpoint throttling.

#### Fixed (was Critical / High)

1. Partners forging withdrawable earnings via `status` / `dc_recent_status` PATCH.
2. Hardcoded Supabase + ZR secrets in `examples/delivery-api.js`.
3. Leads IDOR — partners can no longer list/read/update/delete other partners’ leads (or related hops/items).
4. UploadThing — file routes require Clerk auth; product uploads require admin. `/api/uploadthing` stays out of Clerk matcher so UT callbacks still work.
5. API inputs validated with Zod (`parseJsonBody` / `parseSearchParams` / `parsePositiveIntParam`).

#### Still open — Critical

None active on the previously fixed IDOR / status-forgery paths under current middleware + route guards.

#### Still open — High

| Finding | Where |
|---------|--------|
| Service-role Supabase is the sole auth boundary; no RLS on core tables (`orders` / `leads` / `commissions` / `partners`) | `infrastructure/supabase/server.ts`, migrations |
| Unauthenticated Meta Conversion proxy still accepts public traffic; rate limiting reduces abuse but auth/signing would be stronger | `api/meta-conversion/route.ts` |

#### Still open — Medium

| Finding | Where |
|---------|--------|
| Rate limiting is process-local in memory; good for single-instance defense, weaker across multiple instances / serverless cold starts | `shared/server/rateLimit.ts` |
| PostgREST `.or()` search interpolates raw terms | `orderService.search`, `leadService.search` |
| Authenticated partners can set lead `status` / `agent_id` on create; PATCH only strips `partner_id` | `leads/domain/validations.ts`, `api/leads/*` |
| Partners can read admin catalog / inventory GETs (`requireDashboardActor`, not admin) | `api/products/admin`, inventory GET |
| Intended-public reads (`settings/map`, product catalog/by-slug) sit behind Clerk matcher | `middleware.ts` vs route comments |
| Sanitization only at HTTP edge; `updateOrderStatus` still exists on application service (no API) | `orderApplicationService.ts` |
| Partners can still PATCH `shipping_price` / `delivery_fees` after create; create is fixed, update path is not | `partnerOrderFields.ts`, `api/orders/[id]` |

#### Middleware coverage

| Route group | Matcher | Protected | Notes |
|-------------|---------|-----------|-------|
| partner, orders, earnings, dashboard, inventory, settings, leads, products, product-pages | Yes | Yes | Session at edge except `/api/leads/public` |
| set-role, clerk | Yes | No | Handler self-auth |
| meta-conversion | No | No | Fully open |
| uploadthing | No | N/A | Auth in `core.ts` (intentional) |
| leads/public | Yes | No | Anonymous storefront submit; route allowlist forces `status: "initial"` |

#### What is done well

- `requireCurrentPartner` — session partner from Clerk email; client `partner_id` ignored.
- `requireOrderAccess` / `requireLeadAccess` — cross-partner resources appear as not found.
- Earnings / withdraw — session partner only; amount checked against available balance.
- Admin vs partner guards on settings mutations and inventory writes.
- Partner order create/update allowlist + explicit `ORDER_STATUS_FORBIDDEN` + forced `status: "initial"` on create.
- Zod validation on API bodies/queries via `parseRequest` (`VALIDATION_ERROR` → 400 + issues).
- UploadThing file-router middleware requires Clerk auth (admin for product media).
- Settings public map filters out `meta_conversion_api_access_token`.
- `set-role` does not allow self-escalation to admin.
- Markdown escape-before-render XSS hygiene.
- Safe auth redirects (same-origin / relative).

---

### Performance — 6.5 / 10

Up from **5.5** after leads pagination and SQL summary RPCs.

**Strengths**

- Orders list: pagination + limit cap (1–100) + nested `order_item`.
- Leads list: pagination + explicit list columns + `idx_leads_partner_created_at` (`046`).
- Order/lead summaries: SQL RPCs (`get_order_summary`, `get_lead_summary` in `047`) — no full-table fetch.
- Commission list enrichment is **batched** (`.in("order_id", …)`), not N+1.
- React Query stale times are sensible (feature hooks 30s–10m).
- Dashboard stats query uses a narrow column list.
- Commissions indexes: `idx_commissions_partner_id`, `idx_commissions_partner_created_at`.

**Weaknesses**

| Sev | Finding | Where |
|-----|---------|--------|
| Med | Dashboard: all orders in range → JS day buckets | `dashboardStatsService.ts`, `aggregateOrdersIntoDailySnapshots.ts` |
| Med | Earnings: all partner commissions + JS filter | `earningsService.ts`, `earningsApplicationService.ts` |
| Med | Widespread `select("*")` on detail/list paths | orders / inventory / products / partners / hops |
| Med | No clear `orders(partner_id, created_at)` index in migrations (leads has composite) | `database/migrations/*` |
| Low | PostgREST `.or()` search interpolates raw terms | `orderService.search`, `leadService.search` |

---

### Quality — 7.5 / 10

**Strengths**

- `strict: true` TypeScript; feature-sliced structure.
- Typed domain errors + shared `jsonError` (maps `FORBIDDEN` → 403, `VALIDATION_ERROR` → 400).
- Application-layer unit tests for core flows (~50 test files); `partnerOrderFields` + `parseRequest` + summary mapping tests.
- Newer UI (e.g. create-order) is a11y-aware and i18n-backed.
- Partner field allowlists typed with `satisfies keyof …`.
- Create-order Zod schema is wired in `api/orders/route.ts`.
- Inventory stock mutations use DB RPCs; commission snapshotting at create is intentional.

**Weaknesses**

- Order create is **non-atomic**: order → items → commission → ZR parcel (orphans on mid-flight failure). `DatabaseWrapper.executeTransaction` has no real rollback and appears unused.
- FR/AR i18n lag behind EN (~73 missing keys historically).
- Leftover dummy dashboard data (tests only); dummy parcel tracking still used in UI (`OrderTrackingDialog`).
- Dead helpers: `PARTNER_FORBIDDEN_ORDER_KEYS`, `partnerOrderUpdateHasWritableFields` unused.
- No API-route or E2E tests for inject attempts.
- Infra utils still `any`-heavy (`databaseWrapper`, pixel SDKs).
- Public lead access is now handled by middleware exception logic; document that behavior clearly to avoid future regressions.

---

## Recommended fix order

| # | Action | Impact |
|---|--------|--------|
| 1 | Add stronger Meta Conversion trust boundary (signed secret, server-to-server allowlist, or auth as appropriate) | Abuse / storefront integrity |
| 2 | Remove partner PATCH control of `shipping_price` / `delivery_fees`, or recompute fees server-side on editable destination changes | COD integrity |
| 3 | Wrap order create (and delete) in a DB transaction / compensating cleanup for ZR | Data integrity |
| 4 | SQL aggregates for dashboard/earnings; index `orders(partner_id, created_at)` | Performance |
| 5 | Centralize DI composition root; deepen a few aggregates/VOs; remove dead helpers; add API inject tests | Architecture / quality |
| 6 | Defense-in-depth: RLS on core tables | Security depth |

---

## Feature layer map

| Feature | domain | data | application | presentation | Notes |
|---------|:------:|:----:|:-----------:|:------------:|-------|
| orders | ✓ | ✓ | ✓ | ✓ | Most complete; partner policy; paginated; SQL summary |
| products | ✓ | ✓ | ✓ | ✓ | Mature; some presentation helpers used from API |
| earnings | ✓ | ✓ | ✓ | ✓ | Live DB; JS aggregation |
| dashboard | ✓ | ✓ | ✓ | ✓ | Live stats; JS day buckets |
| inventory | ✓ | ✓ | ✓ | ✓ | RPCs for stock mutations |
| partners | ✓ | ✓ | ✓ | — | Hooks / payment settings only |
| settings | ✓ | ✓ | ✓ | ✓ | Thin domain |
| leads | ✓ | ✓ | ✓ | — | Partner-scoped; paginated; SQL summary |
| delivery | ✓ | ✓ | — | — | Gateway context |
| landing | — | — | — | ✓ | UI-only |
| marketplace-extension | — | — | — | flat | Outside CA model |

---

## Appendix — key paths

```
src/features/orders/domain/partnerOrderFields.ts
src/features/orders/domain/validations.ts
src/app/api/orders/route.ts
src/app/api/orders/[id]/route.ts
src/features/orders/application/services/orderApplicationService.ts
src/features/orders/data/orderService.ts
src/features/leads/domain/validations.ts
src/features/leads/data/leadService.ts
src/app/api/leads/route.ts
src/app/api/leads/[id]/route.ts
src/app/api/leads/public/route.ts
src/app/api/uploadthing/core.ts
src/app/api/meta-conversion/route.ts
src/shared/server/parseRequest.ts
src/shared/server/rateLimit.ts
src/shared/server/requireCurrentPartner.ts
src/shared/server/requireOrderAccess.ts
src/shared/server/requireLeadAccess.ts
src/shared/server/jsonError.ts
src/middleware.ts
src/infrastructure/supabase/server.ts
src/infrastructure/supabase/client.ts
src/features/earnings/data/earningsService.ts
src/features/dashboard/data/dashboardStatsService.ts
src/app/api/dashboard/route.ts
database/migrations/046_add_leads_partner_created_at_index.sql
database/migrations/047_add_order_and_lead_summary_rpcs.sql
```
