# Prompt: Bellami Stores dashboard — affiliate-friendly pages, assets library UI, inventory autocomplete

> Implementation target: **instanet-stores**. Mirror of `instanet-stores/docs/dashboard_affiliate_friendly_assets_inventory_prompt.md`.

Use this document as the implementation brief for **instanet-stores** (Instanet dashboard). Do not invent scope beyond what is listed.

---

## Context

- App: `instanet-stores` (admin / store dashboard)
- Related app: `instanet-affiliate` (partners; already reads library assets for zip download; does **not** upload)
- Existing library plan: `docs/product_page_assets_library_plan.md`
- Existing migration (stores): `database/migrations/044_create_product_page_assets.sql` (affiliate: `045_create_product_page_assets.sql`)
- Existing API (stores, admin): `/api/product-pages/[id]/assets` (GET / POST / DELETE) + application/data layer already wired

---

## Goals (implement all three)

### 1. Mark product pages as affiliate-friendly

Admins must be able to flag a product page so affiliates know it is intended for affiliate use.

**Requirements**

- Add a boolean on `product_pages`, e.g. `is_affiliate_friendly` (default `false`).
- New SQL migration in **instanet-stores** (and mirror in **instanet-affiliate** if that app reads product pages from the same DB).
- Update types / domain entity / update payloads / Product Page editor UI.
- UI: clear toggle or switch in `ProductPageEditor` (same pattern as `is_freeshipping`), labeled for “Affiliate friendly” (i18n en/ar/fr).
- Persist on save with the rest of the page fields.
- List/filter optional but nice: show a badge or filter on product pages list if that UI already exists and is easy to extend.

**Acceptance**

- Admin can turn the flag on/off and reload sees the saved value.
- Column exists in DB with a safe default for existing rows.

---

### 2. Upload / create product page assets (library UI)

Complete the **dashboard UI** for the per–product-page media library. Backend CRUD already exists; build the editor experience.

**Library model (do not change)**

| Column | Notes |
| --- | --- |
| `id` | PK |
| `product_page_id` | FK → `product_pages` |
| `url` | CDN URL |
| `media_type` | `image` \| `video` |
| `file_name` | optional |

**Explicit non-goals**

- Do **not** replace `hero_media`, `video_url`, `product_page_images`, or `product_page_testimonials`.
- No role / slot columns on `product_page_assets`.
- Affiliate app never uploads; stores dashboard only.

**Requirements**

- New section in `ProductPageEditor` (e.g. “Assets library”) for the current product page.
- List existing assets (thumbnail/preview where possible, file name, media type).
- Upload image and/or video using the same storage/upload patterns already used for hero/gallery on product pages.
- After upload, create library rows via existing `productApplicationService` / `/api/product-pages/[id]/assets` (single or batch POST).
- Delete asset (API already supports delete) with confirmation.
- Empty state when no assets.
- Loading / error / success feedback consistent with the editor.
- i18n for all new copy (en/ar/fr).
- Unit tests for any new pure helpers; component tests where the feature already tests editor pieces.

**Acceptance**

- Admin can upload, see, and delete library assets for a page without touching hero/gallery/testimonials slots.
- Rows appear in `product_page_assets` and remain available to affiliate zip download.

---

### 3. Inventory product select → autocomplete

In **dashboard inventory**, replace the product `<Select>` with a searchable autocomplete.

**Current**

- File: `src/features/inventory/presentation/InventoryManagementView.tsx`
- Uses shadcn `Select` + `SelectItem` over `sortedProducts` with placeholder `selectProduct`.

**Requirements**

- Replace with searchable autocomplete (prefer existing `Combobox` at `src/shared/components/ui/combobox.tsx`, or improve it if needed).
- Options: product id as value, product name as label (same data as today: admin products vs store products).
- Keyboard accessible; works on mobile (Combobox already has drawer path).
- Keep label, refresh button (admin), accordion behavior, and empty “select to view” state.
- i18n: reuse `selectProduct` / empty strings; add search empty copy if missing.

**Acceptance**

- User can type to filter products and select one; selected product still drives `InventoryProductAccordion`.

---

## Implementation order

1. Migration + types for `is_affiliate_friendly`
2. Product page editor: affiliate-friendly toggle + save wiring
3. Product page editor: assets library section (list / upload / delete) on top of existing API
4. Inventory: swap Select → Combobox/autocomplete
5. i18n + tests

---

## Out of scope

- Affiliate-side upload UI
- Redesigning hero/gallery/testimonials
- Changing commission logic based on `is_affiliate_friendly` (flag + UI only unless already required elsewhere)
- Affiliate inventory autocomplete (unless you are already in that file for a shared pattern; primary ask is **stores** dashboard)

---

## Pointers (instanet-stores)

| Area | Path |
| --- | --- |
| Product page editor | `src/features/products/presentation/ProductPageEditor.tsx` |
| Assets API | `src/app/api/product-pages/[id]/assets/route.ts` |
| Assets service | `src/features/products/data/productPageAssetService.ts` |
| Application methods | `productApplicationService.getProductPageAssets` / `createProductPageAsset(s)` / `deleteProductPageAsset` |
| Inventory view | `src/features/inventory/presentation/InventoryManagementView.tsx` |
| Combobox | `src/shared/components/ui/combobox.tsx` |
| Assets schema plan | `docs/product_page_assets_library_plan.md` |

---

## Definition of done

- [ ] `is_affiliate_friendly` migrated, typed, editable in Product Page editor, saved correctly
- [ ] Assets library UI can create (upload), list, and delete `product_page_assets` for a page
- [ ] Inventory product picker is autocomplete/searchable, not a plain Select
- [ ] i18n updated; no regressions to hero/gallery/testimonials flows
- [ ] Migrations applied / documented for shared DB if affiliate also needs the new column
