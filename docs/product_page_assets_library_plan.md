# Per–product-page assets library

## Goal

Give each product page its own **media library** table. Usage slots stay unchanged.

Existing page slots stay as they are:

- `product_pages.hero_media`
- `product_pages.video_url`
- `product_page_images` (gallery)
- `product_page_testimonials`

## Table: `product_page_assets`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | bigserial PK | |
| `product_page_id` | bigint FK → `product_pages` ON DELETE CASCADE | library scope |
| `url` | text NOT NULL | CDN URL |
| `media_type` | text NOT NULL CHECK (`image` \| `video`) | |
| `file_name` | text NULL | display name |

Migrations:

- stores: `database/migrations/044_create_product_page_assets.sql`
- affiliate: `database/migrations/045_create_product_page_assets.sql`

## Scope (current)

**Done now**

- Schema + types in both apps
- Stores data layer / API foundation (for later dashboard upload UI)
- Affiliate **read-only**: product page load includes `assets`; zip download includes library URLs (plus existing hero/gallery/testimonials/thumbnail)

**Not now**

- No upload UI in bellami-stores dashboard (later)
- Affiliate never uploads assets

## Explicit non-goals

- Do not replace hero/gallery/testimonials/video with this table
- No role assignment columns on the library table
- No store-wide / product-wide shared library
