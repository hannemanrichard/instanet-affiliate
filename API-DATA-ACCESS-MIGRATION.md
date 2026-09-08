# Affiliate API Data-Access Migration

Migrate `instanet-affiliate` to the same server-only Supabase pattern used in `instanet-stores`.

## Goal

Browser code must never call Supabase with the anon key. Auth boundary = Clerk. Data path:

```
hooks (apiFetch)
  → Clerk-protected /api/*
    → application services
      → data services
        → supabaseServer (service role)
```

Keep the existing clean architecture folders (`domain` / `data` / `application` / `presentation`). Do not flatten or rewrite features — only change **where** data is reached from.

No RLS on the shared DB for now. CORS alone is not enough; every dashboard/data API must require a Clerk session.

---

## Target architecture (copy from stores)

| Piece | Path / rule |
|-------|-------------|
| Browser Supabase | `src/infrastructure/supabase/client.ts` — retire from features over time |
| Server Supabase | `src/infrastructure/supabase/server.ts` — `import "server-only"` + `SUPABASE_SERVICE_ROLE_KEY` |
| HTTP helper | `src/shared/utils/apiFetch.ts` (already exists) |
| Guards | `requireCurrentPartner` (+ add `requireAdminActor` / `requireDashboardActor` if missing) |
| Errors | Extend `jsonError` for each domain error (`InventoryError`, `ProductError`, …) |
| Middleware | Protect every new `/api/<feature>(.*)` in `isProtectedRoute` + `matcher` |

Reference implementation: `instanet-stores` inventory slice (`/api/inventory/*`, `useInventory` via `apiFetch`, `supabaseServer`).

---

## Current state (affiliate)

### Already partly migrated (hybrid)

| Area | Status |
|------|--------|
| `/api/partner/me` | Exists; keep, switch data to `supabaseServer` |
| `/api/orders`, `/api/orders/summary` | Exists; finish hybrid (hooks still call `orderApplicationService` for some ops) |
| `/api/earnings`, `/api/earnings/withdraw` | Exists; ensure data layer is server-only |
| `useOrders` / `useEarnings` / `useCurrentPartner` | Mostly `apiFetch` |
| `requireCurrentPartner`, `jsonError`, `apiFetch` | Exist |

### Still browser → Supabase (must migrate)

| Feature | Hooks today | Data client |
|---------|-------------|-------------|
| **Inventory** | `apiFetch` → `/api/inventory/*` | `supabaseServer` |
| **Products** | `apiFetch` → `/api/products/*`, `/api/product-pages/*` | `supabaseServer` |
| **Leads** | `apiFetch` → `/api/leads/*` | `supabaseServer` |
| **Settings** | `apiFetch` → `/api/settings/*` | `supabaseServer` |
| **Partners** (mutations beyond `/me`) | check usage | anon `client` |
| **set-role** | Route handler | `createRouteHandlerClient` (anon cookies) |

Public storefront / Meta / UploadThing stay out of this plan unless they touch privileged tables.

---

## Principles

1. **One feature at a time** — ship vertical slices (API + hook switch + middleware + tests).
2. **Application services stay** — only call them from Route Handlers, never from Client Components/hooks after migration.
3. **Decouple cross-feature imports** — if product create needs inventory rows, prefer `ensureInventory` on the product item repo (or a products API) so client product code never imports server-only inventory data.
4. **Admin vs partner** — partner-scoped reads filter by `requireCurrentPartner()`; admin mutations use an admin guard.
5. **Tests** — hooks mock `apiFetch`; data/application tests mock `@/infrastructure/supabase/server` (jsdom has `window`, so `server-only` / server client will blow up without mocks).
6. **Do not** invent new folder layouts or move domain entities.

---

## Phase 0 — Foundation (do first)

**Checklist**

- [x] Add dependency: `server-only`
- [x] Create `src/infrastructure/supabase/server.ts` (mirror stores: service role, `import "server-only"`)
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` in `.env` / hosting secrets (never `NEXT_PUBLIC_`) — **verify in your env**
- [x] Add `requireAdminActor` / `requireDashboardActor` next to `requireCurrentPartner`
- [x] Fix `/api/set-role` to use `supabaseServer` (via `partnerApplicationService`) instead of `createRouteHandlerClient`
- [x] Partners data layer → `supabaseServer`; barrel no longer exports `data` / application service to clients
- [x] Document the pattern in this file (done) + short note in README if desired

**Done when:** Route Handlers can import `supabaseServer`; set-role upserts partners via service role; foundation merges without changing UI behavior.

---

## Phase 1 — Inventory (first full slice — same as stores)

Mirror `instanet-stores` routes and hook shapes.

### APIs

| Method | Route | Guard | Body / query |
|--------|-------|-------|--------------|
| GET | `/api/inventory/products/[productId]` | partner or admin | — |
| GET | `/api/inventory/products/[productId]/phases` | partner or admin | — |
| GET | `/api/inventory/products/[productId]/phase-details` | partner or admin | `phases`, optional `productName` |
| POST | `/api/inventory/products/[productId]/bulk-adjust` | admin | `{ adjustments }` |
| GET | `/api/inventory/items/[itemId]` | partner or admin | — |
| PATCH | `/api/inventory/[id]` | admin | `{ quantity }` |
| GET | `/api/inventory/sold-units` | partner or admin | `fromDate`, `toDate` |
| POST | `/api/inventory/refresh-phase-details` | admin | — |

### Implementation steps

1. [x] Point `inventory/data/inventoryService.ts` at `supabaseServer`.
2. [x] Add routes under `src/app/api/inventory/...` calling `inventoryApplicationService`.
3. [x] Protect `/api/inventory(.*)` in middleware.
4. [x] Add `InventoryError` to `jsonError`.
5. [x] Rewrite `useInventory.ts` to `apiFetch` only (copy stores pattern).
6. [x] Update `useInventory` tests to mock `apiFetch`.
7. [x] Decouple products if needed (`ensureInventory` on item repo) so product client flows don’t import inventory data.

**Done when:** Inventory dashboard works with Network tab showing `/api/inventory/*` only; no `inventoryApplicationService` import from hooks.

**Copy-from:** `instanet-stores/src/app/api/inventory/**` and `instanet-stores/src/features/inventory/application/useInventory.ts`.

---

## Phase 2 — Products (admin CMS + catalog)

### Suggested APIs (group by useProducts usage)

| Concern | Suggested routes | Guard |
|---------|------------------|-------|
| Catalog / search | `GET /api/products`, `GET /api/products/catalog?q=` | public or auth as today |
| Admin list | `GET /api/products/admin` | admin |
| Product detail | `GET /api/products/[id]` | auth |
| Items / inventory snapshot | `GET /api/products/[id]/items`, `GET /api/products/[id]/inventory` | auth |
| Mutations | `PATCH /api/products/[id]`, bulk inventory, create/update/delete pages | admin |
| Pages | `GET /api/product-pages`, `GET /api/product-pages/[slug]`, CRUD under `/api/product-pages` | mix public read / admin write |

### Implementation steps

1. [x] Switch all `products/data/*` services to `supabaseServer` **only after** those services are no longer imported from the browser (APIs first, or migrate hooks + APIs together).
2. [x] Prefer: add APIs → switch `useProducts` to `apiFetch` → then flip data imports to server.
3. [x] Storefront public reads: either keep a narrow public API without service-role over-exposure, or a dedicated read-only route that filters active pages only.
4. [x] Update product tests like inventory.

**Done when:** `useProducts` has zero imports of `productApplicationService`; product editor and storefront still work. ✅

**Risk:** Large surface. Split into 2a catalog/pages (read) and 2b admin mutations if needed.

---

## Phase 3 — Finish orders hybrid

### Current gap

`useOrders` already uses `apiFetch` for list/summary/create but may still call `orderApplicationService` for detail / items / updates.

### Steps

1. [x] Audit every `orderApplicationService` call in hooks/presentation.
2. [x] Add missing routes (`GET/PATCH/DELETE /api/orders/[id]`, `GET/PUT /api/orders/[id]/items`) with `requireOrderAccess` (partner scope).
3. [x] Switch remaining hooks to `apiFetch`.
4. [x] Point `orders/data/*` at `supabaseServer`.
5. [x] Ensure partner scope: non-admins only see/update their `partner_id` (server-side, never trust body `partner_id`).

**Done when:** No browser import of order data/application services; partner cannot access another partner’s orders via API.

---

## Phase 4 — Earnings (complete server path)

1. [x] Confirm `/api/earnings*` covers all `useEarnings` calls.
2. [x] Point `earnings/data/*` (`earningsService`, `commissionService`, `withdrawService`) at `supabaseServer`.
3. [x] Partner-only withdrawals; admin views if any stay admin-guarded.
4. [x] Middleware already protects earnings — keep it.
5. [x] Client barrels no longer export earnings `data` / application service.

**Done when:** Earnings feature has no anon client usage.

---

## Phase 5 — Leads + settings

### Leads

| Routes (suggested) | Guard |
|--------------------|-------|
| `GET/POST /api/leads` | auth; partner scope if applicable |
| `GET/PATCH/DELETE /api/leads/[id]` | auth |
| `GET/PUT /api/leads/[id]/items` | auth |
| `GET /api/leads/summary` | auth |
| hops endpoints as needed | auth |
| `POST /api/leads/public` | public (storefront; allowlisted fields + optional validated `ref`) |

1. [x] Switch `useLeads` / `useLeadHops` → `apiFetch`; data → `supabaseServer`.
2. [x] Public storefront lead create via `POST /api/leads/public` (+ hop when agent assigned); `ProductPageView` uses `useCreatePublicLead`.

### Settings

| Routes | Guard |
|--------|-------|
| `GET /api/settings`, `GET /api/settings/analytics` | admin |
| `GET /api/settings/map` | public (pixel IDs only; no conversion API token) |
| `PATCH /api/settings` | admin |

1. [x] Switch `useSettings` → `apiFetch`; `settingsService` → `supabaseServer`.
2. [x] Middleware protects `/api/settings(.*)` and `/api/leads(.*)` with public exceptions for map + public lead.

**Done when:** Leads dashboard + settings screens hit APIs only. ✅

---

## Phase 6 — Partners + hard bans

1. [x] Partner profile via `/api/partner/me` + `supabaseServer` (Phase 0).
2. [x] Grep: no `@/infrastructure/supabase/client` under `src/features` (remaining anon usage only in shared utils / meta-conversion — out of feature migration scope).
3. [x] ESLint `no-restricted-imports` on hooks + presentation: ban supabase client/server and `features/*/data`.
4. [x] Product payload types moved to `productPayloads.ts` so hooks never touch the application service module.

**Done when:** Lint fails on new browser Supabase usage; set-role and all dashboard features are server-backed. ✅

---

## Per-feature recipe (repeatable)

```
1. List hook methods → design REST routes 1:1
2. Add Route Handlers: guard → applicationService → jsonError
3. Middleware protect /api/<feature>
4. Switch data service import to supabaseServer
   (only when nothing in the browser imports that data module)
5. Rewrite useX to apiFetch; update hook tests
6. Manual smoke: partner role + admin role
7. Commit vertical slice
```

---

## Auth matrix (affiliate)

| Actor | How resolved | Typical access |
|-------|--------------|----------------|
| Partner | Clerk + `partners` row via email (`requireCurrentPartner`) | Own orders, earnings, leads (as designed) |
| Admin | Clerk `publicMetadata.role === "admin"` | Inventory adjust, products CMS, settings, all partners’ ops |
| Public | No session | Product pages / lead submit only via intentional public APIs |

Never pass `partner_id` from the client for authorization; set it on the server from the session.

---

## Env checklist

| Variable | Where used |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser client only (legacy / public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabaseServer` only — secret |

---

## Suggested order & estimate

| Phase | Priority | Notes |
|-------|----------|-------|
| 0 Foundation | P0 | Unblocks everything |
| 1 Inventory | P0 | Proven in stores; high-value, bounded |
| 3 Orders finish | P0 | Security (partner scope) |
| 4 Earnings | P1 | Already has APIs |
| 2 Products | P1 | Largest surface — split if needed |
| 5 Leads + settings | P1 | |
| 6 Lint bans | P2 | Lock the pattern in |

---

## Out of scope

- Enabling Supabase RLS on the shared production DB (separate project)
- Rewriting domain models or UI
- Migrating UploadThing / Meta conversion unless they need service-role DB access
- Copy-pasting stores domain (stores vs partners) — only copy the **data-access pattern**

---

## Definition of done (whole migration)

- [x] All dashboard hooks use `apiFetch`
- [x] All feature `data/*` services use `supabaseServer`
- [x] `/api/set-role` uses `supabaseServer` (via partner application service)
- [x] Middleware covers every privileged API (public exceptions: settings/map, leads/public, product catalog/pages reads)
- [x] No `createRouteHandlerClient` for app data (set-role fixed)
- [x] ESLint (or documented grep gate) prevents regressions
- [x] Partner cannot read/write another partner’s orders via API (`requireOrderAccess`)

## Reference files in stores

| Concern | Stores path |
|---------|-------------|
| Server client | `src/infrastructure/supabase/server.ts` |
| Inventory APIs | `src/app/api/inventory/**` |
| Inventory hooks | `src/features/inventory/application/useInventory.ts` |
| Middleware | `src/middleware.ts` |
| jsonError | `src/shared/server/jsonError.ts` |
| set-role | `src/app/api/set-role/route.ts` |
| Pattern notes | `BELLAMI-STORES-PLAN.md` → Auth & API → Data access pattern |
