# Plan: Meta Marketplace bridge extension (affiliates)

## Goal

Help affiliates publish Bellami product pages to [Facebook Marketplace](https://www.facebook.com/marketplace) faster.

Flow:

1. Affiliate opens a product on the Bellami affiliate platform.
2. Clicks **Publish to Marketplace**.
3. The **Chrome extension** opens with a prefilled form (product data from Bellami).
4. Affiliate reviews / edits (wilaya, contact method, price, photos, etc.).
5. Clicks **Add to Marketplace** → extension drives Marketplace create-listing and aims for **one-click publish**.

---

## Locked decisions

| Topic | Decision |
| --- | --- |
| Channel | [Facebook Marketplace](https://www.facebook.com/marketplace) local listings (affiliate’s personal FB account) |
| Publish depth | **One-click publish from the extension** if technically reliable; soft-fallback to “review on Facebook” only if full submit fails |
| Buyer contact | Affiliate **selects** method; **phone is the default** (people often DM on Marketplace anyway) |
| Listing extras | Description appends selected contact; **Bellami product link is optional** (checkbox in extension form, on by default) |
| Market | **Algeria (DZ)**; affiliate chooses **wilaya** |
| Browser | **Chrome only for production**; **Brave works for development** (Chromium + load unpacked) |
| Price | **Editable** in the extension form; **default from product** |
| Photos | **`product_page_assets` library only** (not hero / gallery / testimonials) |
| Category | Always **Men's clothing & shoes** |
| Condition | Always **New** |
| Distribution (prod) | **Public Chrome Web Store** |
| Distribution (dev) | Load / download the extension **from Bellami** (not Chrome Web Store) — e.g. unpacked package or internal download for local/staging |
| `is_affiliate_friendly` gate on button | **Not required** — products list is already filtered to affiliate-friendly pages only |


All product decisions for MVP are locked.

## Execution status

| Phase | Status |
| --- | --- |
| Phase 0 — DZ Marketplace DOM spike (fill + one-click) | **Pending** (content script stub in place) |
| Phase 1 — Extension scaffold + side panel + products button + web bridge | **In progress / scaffolded** |
| Phase 2 — Reliability, prefs, analytics | Not started |
| Phase 3 — Optional later | Not started |

### Done so far

- New repo folder: `bellami-marketplace-extension/` (Chrome MV3, load unpacked for dev)
- Side panel form: title, editable price, wilaya, contact (phone default), description, library photo picker
- Content bridge on Bellami origins + Marketplace create stub
- Affiliate products **Publish to Marketplace** action
- `GET /api/product-pages/by-slug/[slug]/library` (library images JSON)
- Dev install dialog when extension missing

### How to run locally

1. `chrome://extensions` → Load unpacked → `bellami-marketplace-extension`
2. Run affiliate app on port **3000** or **3001** (update `manifest.json` matches if another port)
3. Reload the affiliate tab, then use the Marketplace button on Products

---

## Why this matters

We believe **Facebook Marketplace is the main sales channel** for affiliates. The extension bridges:

| Bellami affiliate platform | ↔ | [facebook.com/marketplace](https://www.facebook.com/marketplace) |
| --- | --- | --- |
| Product pages, assets, pricing, stock | | Local DZ listings buyers see |

---

## Technical approach

**There is no public Meta API for creating a normal Marketplace “item for sale” listing.**

| Approach | Reality | Our choice |
| --- | --- | --- |
| **A. Assistive Chrome extension (UI bridge)** | Content script fills Marketplace create-listing UI from Bellami data, then submits | **Selected path** |
| **B. Meta Commerce Partner APIs** | Approved partners only | Out of scope unless Bellami becomes a partner later |
| **C. Headless mass automation** | High ban / ToS risk | Not used |

### One-click publish strategy

Target UX: one CTA in the extension → listing **published**.

Implementation ladder (Phase 0 spike decides how far we go on day one):

1. **Primary:** fill all required Marketplace fields + photos → click Marketplace Publish/Post via content script.
2. **Fallback:** if submit control can’t be found or fails validation, leave the draft filled and tell the affiliate to tap Publish once on Facebook.
3. Never run unattended in the background without the affiliate initiating the action.

Account-safety note: one-click still runs **in the affiliate’s logged-in Chrome session** on facebook.com (not a server-side bot).

---

## Product experience (Bellami app)

### Entry point

- Affiliate **Products** table / product actions (alongside download assets / check stock).
- Button: **Publish to Marketplace**.
- No extra `is_affiliate_friendly` check on the button: the products list is **already filtered** to pages marked affiliate-friendly, so every row shown is eligible.
- Extension missing → install CTA:
  - **Production:** public Chrome Web Store listing + short enable guide.
  - **Development / staging:** get the extension **from Bellami** (download unpacked build or “Load unpacked” instructions) — not Chrome Web Store — so local affiliate origins can talk to the extension via `externally_connectable`.
- Extension installed → message extension → open **side panel** with product payload.
- If library has **no assets**, warn in UI (cannot publish photos) or allow text-only only if Marketplace allows — prefer block with “add assets in dashboard first” if empty.

### Payload: platform → extension

- `product_page_id` / `slug`
- `headline` / title
- `price` + `currency` (DZD) — default only; affiliate may edit in the panel
- `description` (short Marketplace-oriented copy)
- `image_urls[]` — **from `product_page_assets` library only**
- `order_link` — Bellami product/order URL to append in listing description
- `default_contact_method`: `"phone"`
- `phone` (from affiliate profile if available)
- optional: `whatsapp`
- `condition`: default `new`
- `country`: `"DZ"`
- `wilaya` omitted until affiliate picks in the form (or last-used default from extension storage)

---

## Extension experience (Chrome)

### Surfaces

| Surface | Role |
| --- | --- |
| **Side panel** | Form + **Add to Marketplace** |
| **Service worker** | Receive Bellami messages, open panel, orchestrate tabs |
| **Content script** on `facebook.com` / Marketplace create flow | Prefill, attach photos, **submit publish** |
| **Options** | Default wilaya, phone, contact method, description template |

### Form fields (MVP)

- Title  
- **Price (DZD)** — editable; prefilled from product  
- Description (template; always includes **Bellami order link** + selected contact)  
- Photos from **library only** (select / reorder / remove)  
- Category (as required by Marketplace DZ UI)  
- **Wilaya** (required; searchable list of Algerian wilayas)  
- Condition  
- **Contact method** (select; default **phone**; also WhatsApp / both as needed)  
- Contact value(s) for the chosen method  

### CTA: **Add to Marketplace**

1. Validate form (wilaya + contact required).
2. Ensure Facebook session (logged in); else prompt.
3. Open / focus Marketplace create-listing.
4. Content script fills fields + uploads images.
5. **Attempt one-click Publish.**
6. Report success, or fallback “almost done — confirm Publish on Facebook”.

### Feedback

- Published successfully  
- Partial: draft ready, confirm on Facebook  
- Errors: not installed, not logged in, wilaya/contact missing, image failure, Marketplace UI changed  

---

## Algeria / wilaya

- Country fixed to **DZ** for v1.
- Maintain a static list of **58 wilayas** (code + name; FR/AR labels via i18n).
- Persist last-selected wilaya in `chrome.storage` per affiliate browser profile.
- Map wilaya → whatever location field Marketplace’s DZ create flow expects (city/region picker) during Phase 0 spike.

---

## Architecture

```
┌─────────────────────────────┐
│  bellami-affiliate (web)    │
│  Products → Marketplace btn │
└──────────────┬──────────────┘
               │ externally_connectable (Chrome)
               ▼
┌─────────────────────────────┐
│  Chrome extension (MV3)     │
│  SW + Side panel form       │
│  wilaya + contact (phone)   │
└──────────────┬──────────────┘
               │ content script
               ▼
┌─────────────────────────────┐
│  facebook.com/marketplace   │
│  create listing → Publish   │
└─────────────────────────────┘
```

### Repo layout (proposal)

```
bellami-marketplace-extension/
  manifest.json                 # MV3, Chrome
  src/
    background/
    sidepanel/
    content/marketplace/
    shared/
      types.ts
      wilayas-dz.ts
  README.md
```

### Security

- `externally_connectable` limited to Bellami affiliate origins.
- No FB passwords stored; use existing browser session.
- One-click only after explicit affiliate click on **Add to Marketplace**.
- Do not send Marketplace cookies to Bellami servers.

---

## Attribution & ops

- Description always includes:
  1. **Selected contact** (phone default; WhatsApp optional)
  2. **Bellami order link** (append always)
- Buyers often DM on Marketplace anyway; phone/WhatsApp + order link cover both Messenger and off-platform close.
- Optional later: “publish attempted / published” analytics event in Bellami.

---

## Phased delivery

### Phase 0 — Discovery (DZ Marketplace)

- Manual create-listing walkthrough on [facebook.com/marketplace](https://www.facebook.com/marketplace) for **DZ**.
- Spike content script: title, price, description, photos, **wilaya/location**, contact.
- Spike **one-click Publish** reliability; document fallback conditions.

### Phase 1 — MVP

- Chrome MV3 extension + side panel.
- **Prod:** public Chrome Web Store listing + Bellami install CTA.
- **Dev:** Bellami-hosted extension download / load-unpacked flow (for development mode).
- Products button (list already limited to affiliate-friendly pages).
- Prefill product price (editable); library-only photos; wilaya; contact (phone default); description = contact + order link.
- Add to Marketplace → fill + **attempt publish**.
- i18n en/ar/fr for panel (wilaya names).
- `externally_connectable` includes local + staging Bellami origins for dev.
### Phase 2 — Reliability & UX

- Last-used wilaya / phone defaults.
- Stronger DOM-change detection + clearer fallback.
- Empty library UX (block or clear warning).
- Publish attempt analytics in Bellami.

### Phase 3 — Optional later

- Meta partner APIs if Bellami is approved.
- Edge only if demanded (not in v1).
- Bulk publish (careful — account risk).

---

## Out of scope (v1)

- Non-Chrome browsers  
- Countries other than DZ  
- Unattended publish without affiliate click  
- Scraping Marketplace search  
- Managing existing listings at scale  
- Using hero / gallery / testimonials as Marketplace photos (library only)  
- Gating the Marketplace button again on `is_affiliate_friendly` (list filter is enough)  

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Marketplace UI changes break one-click | Versioned content scripts; automatic fallback to “confirm on FB” |
| Account restrictions | User-initiated only; rate-limit guidance; no headless farms |
| Wilaya ↔ Marketplace location mismatch | Phase 0 mapping spike for DZ UI |
| ToS / “auto-publish” claims | Accurate UX copy; counsel if marketing aggressively |

---

## Success metrics

- Extension install rate among active DZ affiliates  
- One-click success rate vs fallback rate  
- Time from product → published listing  
- Marketplace-attributed inquiries (phone/WhatsApp), when measurable  

---

## Suggested next step

Run **Phase 0 spike** on DZ Marketplace create + publish DOM. Exit criteria:

1. Can fill title, price, description, photos, wilaya.  
2. Can or cannot reliably click Publish → decide if one-click ships in Phase 1 or Phase 1 ships fill + one-tap fallback.
