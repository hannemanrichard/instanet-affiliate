# Bellami Affiliate Dashboard Plan

## Locked decisions

- **Create order:** insert into `orders` + `order_item` with the affiliate’s `partner_id`. Orders come from (1) manual create in the affiliate dashboard, or (2) storefront leads confirmed by agents (Bellami → shared DB).
- **Commission snapshot:** on order create, insert a `commissions` row locking `unit_commission` + `amount` from the product rate at that moment. `is_earned` starts **false**.
- **Commission earned:** when order `status` becomes `delivered`, set `commissions.is_earned = true` (DB trigger + app sync).
- **Earnings buckets:**
  - **Ready** — order `dc_recent_status = 'encaisse'` (amount from `commissions`)
  - **Not ready** — `commissions.is_earned = true` AND `dc_recent_status ≠ 'encaisse'`
  - **Withdrawn** — rows in `withdraws` (`is_paid = false` pending, `is_paid = true` paid)
- **Architecture:** domain → data → application → presentation. Thin App Router pages under `src/app/dashboard/`.

## Data model

| Table | Role |
|-------|------|
| `partners` | Affiliate identity (Clerk email → partner row) |
| `products` | Current `retail_commission` (catalog rate) |
| `product_pages` | 1 product → many landing pages |
| `orders` / `order_item` | Affiliate-created sales |
| `commissions` | Locked commission per order (`unit_commission`, `amount`, `quantity`, `is_earned`) |
| `withdraws` | Cash-out requests |

At order create: `amount = unit_commission × quantity` where `unit_commission` is copied from `products.retail_commission`.

Migration: [`database/migrations/041_create_partner_commissions_table.sql`](database/migrations/041_create_partner_commissions_table.sql)  
`is_earned`: [`database/migrations/042_add_is_earned_to_commissions.sql`](database/migrations/042_add_is_earned_to_commissions.sql)

## Modules

| Feature | Path | Purpose |
|---------|------|---------|
| Partners | `src/features/partners` | `useCurrentPartner()` Clerk → partners |
| Products | `src/features/products` | Affiliate browse via `AffiliateProductPagesView` |
| Orders | `src/features/orders` | Partner-scoped list/create + pagination + commission snapshot |
| Earnings | `src/features/earnings` | Reads `commissions` + order status; withdraw |

## Routes

- `/dashboard/products` — browse active product pages + share links
- `/dashboard/orders` — paginated orders, status filters, create order
- `/dashboard/earnings` — commission buckets + withdraw request
- `/dashboard/inventory`, `/dashboard/product-pages` — admin only (`RoleGuard`)
