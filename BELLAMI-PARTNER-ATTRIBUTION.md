# Partner Attribution for Bellami Lead Capture

**Audience:** Bellami storefront / lead-capture project  
**Shared database:** same Supabase project as `bellami-affiliate`  
**Goal:** when an affiliate shares a product page, leads created from that traffic are credited to that partner via `leads.partner_id`.

This feature is **implemented in the Bellami project**, not in the affiliate dashboard. Both apps read/write the same tables.

---

## Context

| App | Role |
|-----|------|
| **bellami-affiliate** | Partners browse product pages and copy share links |
| **Bellami (this guide)** | Public storefront + lead form; must attach `partner_id` when inserting into `leads` |

### Shared tables (already exist)

**`partners`**

| Column | Use |
|--------|-----|
| `id` | Canonical affiliate id — **this is what goes on the lead** |
| `email` | Identity (also used by affiliate app ↔ Clerk) |
| `username` | Optional human-readable slug (optional ref format) |

**`leads`**

| Column | Use |
|--------|-----|
| `partner_id` | `bigint` nullable → `partners.id` — **must be set on create when `ref` is present** |
| other fields | customer / product / status (unchanged) |

No new table is required.

---

## Contract between projects

### 1. Share URL format (affiliate → visitor)

Affiliate dashboard should copy links like:

```text
https://{BELLAMI_STOREFRONT_HOST}/products/{slug}?ref={partner_id}
```

Example:

```text
https://store.bellami.fashion/products/serum-glow?ref=42
```

**Rules**

- Query param name: **`ref`** (fixed — do not invent alternatives without updating both apps)
- Value: **`partners.id`** (numeric). Prefer id over username (stable, unique, indexed by FK)
- Optional later: support `?ref=username` by resolving `partners.username`, but ship numeric id first

### 2. Bellami responsibility on page load

When a visitor opens a product (or any landing) URL with `ref`:

1. Parse `ref` from the query string
2. Validate it (see below)
3. Persist it for the session (cookie or sessionStorage) so navigation / multi-step forms still attribute
4. On lead create, set `leads.partner_id` to the resolved partner id

### 3. Bellami responsibility on lead insert

```text
INSERT INTO leads (..., partner_id, ...)
VALUES (..., :resolved_partner_id, ...)
```

- If no valid `ref` / cookie → `partner_id = null` (organic traffic)
- Never accept a raw `partner_id` from the form body without resolving/validating from `ref`
- Do not overwrite an existing attributed cookie with an empty/missing ref on later visits (first-touch or last-touch — pick one and document; **recommend first-touch** for affiliates)

---

## Recommended implementation (Bellami)

### Step A — Resolve `ref` → `partner_id`

```ts
// Pseudocode — adapt to Bellami stack

const parsePartnerRef = (ref: string | null): number | null => {
  if (!ref) return null;
  const id = Number(ref.trim());
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
};

const resolvePartnerId = async (ref: string | null): Promise<number | null> => {
  const id = parsePartnerRef(ref);
  if (id == null) return null;

  // Shared DB — partners table
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  return data?.id ?? null;
};
```

Reject unknown ids (deleted / fake ref) → treat as organic (`null`).

### Step B — Persist attribution (cookie)

Suggested cookie:

| Name | Value | Options |
|------|--------|---------|
| `bellami_partner_ref` | partner id string | `path=/`, `max-age=30 days`, `SameSite=Lax`, `Secure` in production |

**First-touch logic (recommended)**

```ts
const ATTR_COOKIE = "bellami_partner_ref";

const capturePartnerRef = async (urlRef: string | null) => {
  const existing = readCookie(ATTR_COOKIE);
  if (existing) return Number(existing); // keep first affiliate

  const partnerId = await resolvePartnerId(urlRef);
  if (partnerId != null) {
    writeCookie(ATTR_COOKIE, String(partnerId), { maxAgeDays: 30 });
  }
  return partnerId;
};
```

Call this on product page mount (and optionally storefront layout).

### Step C — Attach on lead create

Wherever Bellami currently inserts a lead:

```ts
const partnerId =
  (await resolvePartnerId(searchParams.get("ref"))) ??
  Number(readCookie("bellami_partner_ref") || NaN) ||
  null;

await supabase.from("leads").insert({
  // ...existing fields
  partner_id: partnerId,
  channel: partnerId ? "affiliate_link" : channel, // optional but useful
});
```

If you use an API route / server action for lead create, resolve the cookie **on the server** from the request headers — do not trust a client-posted `partner_id` alone.

### Step D — QA checklist

- [ ] Open `/products/{slug}?ref=42` with a real `partners.id` → submit lead → row has `partner_id = 42`
- [ ] Open same page with `?ref=999999` (missing partner) → lead has `partner_id = null`
- [ ] Open with `?ref=42`, navigate to another page without `ref`, then submit → still `42` (cookie)
- [ ] Open with `?ref=42`, later `?ref=7` → still `42` if first-touch (or `7` if you chose last-touch)
- [ ] Organic visit (no ref, no cookie) → `partner_id = null`
- [ ] Affiliate dashboard “Copy link” produces `...?ref={id}` pointing at **Bellami** host (not the affiliate app host)

---

## Affiliate dashboard follow-up (bellami-affiliate)

Small change on the affiliate side (separate PR if needed):

1. Resolve current partner id (already available via `/api/partner/me`)
2. Build share URL with env base + `?ref={partnerId}`:

```ts
const storefrontBase =
  process.env.NEXT_PUBLIC_BELLAMI_STOREFRONT_URL ?? window.location.origin;

const shareUrl = `${storefrontBase}/products/${slug}?ref=${partnerId}`;
```

3. Add `NEXT_PUBLIC_BELLAMI_STOREFRONT_URL` to both envs so local/prod point at Bellami, not the affiliate origin.

Until Bellami implements capture, `ref` will be ignored — safe to ship affiliate link format first or together.

---

## Out of scope (do not mix)

| Topic | Notes |
|-------|--------|
| Creating **orders** + **commissions** from storefront leads | When agents confirm a lead and create an `orders` row, also insert a `commissions` snapshot (`is_earned = false`) if `partner_id` is set — same rules as the affiliate dashboard |
| Flipping `is_earned` | Shared DB trigger `trigger_mark_commission_earned_on_delivery` sets `is_earned = true` when `orders.status` becomes `delivered` — Bellami does not need app code for that |
| Changing `products.retail_commission` | Catalog only; does not rewrite past commissions |

---

## Security notes

1. Validate `ref` against `partners.id` — never insert an unchecked number
2. Prefer server-side lead insert with cookie read from request
3. RLS (later): partners should only read their own leads; Bellami service role / anon policies must still allow public lead **insert** with `partner_id`
4. Do not expose partner PII in the URL — id only

---

## Acceptance criteria

Feature is done when:

1. Affiliate share links include `?ref={partners.id}` to the Bellami storefront  
2. Bellami persists `ref` (cookie) and sets `leads.partner_id` on create  
3. Invalid/missing `ref` does not break lead create  
4. Both projects use the same Supabase DB; no duplicate partner tables  

---

## Reference — current affiliate share (before update)

Today `bellami-affiliate` copies:

```text
{affiliateAppOrigin}/products/{slug}
```

without `ref`. After follow-up it must become:

```text
{BELLAMI_STOREFRONT_URL}/products/{slug}?ref={partnerId}
```
