# UI Transformations Playbook — Bellami Affiliate → Bellami Stores

Use this document to replicate the **bellami-affiliate** UI system in **bellami-stores**.  
Source of truth for visual tokens: root [`DESIGN.md`](../DESIGN.md) (Modern Minimal / tweakcn).  
Runtime tokens: [`src/design-system/tokens.css`](../src/design-system/tokens.css) + [`src/design-system/tokens.ts`](../src/design-system/tokens.ts).

---

## Goals

Bring stores to the same:

1. **Shadcn / Modern Minimal theme** (colors, radius, cards, buttons)
2. **Typography** (Inter + Cairo for Arabic + Source Serif + JetBrains Mono)
3. **Hugeicons** for app chrome (sidebar, mobile tabs, utility icons)
4. **Mobile dashboard shell** (sticky top title bar + bottom tab bar)
5. **Desktop sidebar** with stroke → solid active icon pattern

---

## 1. Design theme (shadcn / Modern Minimal)

### What we did

- Adopted **Modern Minimal** (tweakcn): saturated indigo primary on pure white, cool-gray chrome.
- Kept theme as **CSS variables** in `tokens.css`, wired through Tailwind semantic colors.
- Prefer **semantic utilities** in components (`bg-primary`, `text-muted-foreground`, `border-border`) — never hard-code hex in feature UI.

### Key colors (light)

| Token | Hex | Role |
| --- | --- | --- |
| `--primary` / brand | `#5138F5` | CTAs, links, active nav, focus ring |
| `--accent` | `#E8E9FF` | Soft lavender wash — selected / hover / active tab bg |
| `--accent-foreground` | `#1e3a8a` | Text/icons on accent |
| `--background` / `--card` | `#ffffff` | Canvas + cards |
| `--foreground` | `#333333` | Body text |
| `--muted` | `#f9fafb` | Wells / skeletons |
| `--muted-foreground` | `#6b7280` | Secondary labels |
| `--border` / `--input` | `#e5e7eb` | Separators, inputs |
| `--destructive` | `#ef4444` | Errors / danger |
| `--success` | green HSL | Good rate / positive trend |
| `--warning` | amber HSL | Mid rate / caution |

Primary stays **identical in dark mode** for brand consistency.

### Radius

- Base `--radius: 0.375rem` (**6px**)
- Controls (button, input, select): `rounded-lg`
- Cards / large panels: `rounded-xl` (~10px)
- Cards: **border only**, `shadow-none` by default

### Files to port / mirror

```
DESIGN.md                          # agent + human brand contract
src/design-system/tokens.css       # :root + .dark CSS vars
src/design-system/tokens.ts        # layout / brand hex / radii for JS
src/app/globals.css                # @import tokens; font CSS vars; RTL helpers
tailwind.config.ts                 # semantic colors + radius + fontFamily extend
```

### Tailwind mapping (required)

Ensure stores `tailwind.config.ts` maps at least:

- `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `card`, `popover`
- `brand`, `success`, `warning`
- `sidebar-*` tokens
- `borderRadius.lg/md/sm/xl` derived from `--radius`
- `fontFamily.sans/display/serif/mono/arabic`

### Component defaults we aligned

| Component | Convention |
| --- | --- |
| `Button` | `rounded-lg`; sizes `default` / `sm` / `lg` / `icon` |
| `Input` / `Select` / `Textarea` | `rounded-lg`, `focus-visible:ring-1 focus-visible:ring-ring` |
| `Card` | `rounded-xl border … shadow-none` |
| Focus | Ring matches primary; avoid double borders + rings on selection tiles |

### Checklist — theme

- [ ] Copy / sync `DESIGN.md` (or keep one shared design package)
- [ ] Port `tokens.css` + `tokens.ts`
- [ ] Import tokens at top of `globals.css`
- [ ] Align Tailwind theme extend with affiliate
- [ ] Re-skin shadcn primitives (button, card, input, select, sidebar…) to use tokens + `rounded-lg` / `rounded-xl`
- [ ] Grep for leftover old brand hex / purple / cream themes and replace with semantic classes

---

## 2. Typography & fonts

### What we did

Loaded via `next/font/google` in root `layout.tsx`:

| Font | CSS variable | Use |
| --- | --- | --- |
| **Inter** | `--font-inter` | Default UI (sans + display) |
| **Source Serif 4** | `--font-source-serif` | Editorial / serif moments only |
| **JetBrains Mono** | `--font-jetbrains-mono` | Code / mono |
| **Cairo** | `--font-cairo` | **All** UI faces when `lang="ar"` |

`globals.css` maps:

```css
:root {
  --font-ui: var(--font-inter);
  --font-ui-display: var(--font-inter);
  --font-ui-serif: var(--font-source-serif);
}

html[lang="ar"] {
  --font-ui: var(--font-cairo);
  --font-ui-display: var(--font-cairo);
  --font-ui-serif: var(--font-cairo);
}
```

### Checklist — fonts

- [ ] Add the four `next/font` families + CSS variables on `<html>`
- [ ] Mirror Arabic override rules
- [ ] Prefer `font-sans` / semantic tokens; avoid Inter hard-coded only in English

---

## 3. Hugeicons (replace Lucide in app chrome)

### Packages

```json
"@hugeicons/react": "^1.1.9",
"@hugeicons-pro/core-stroke-rounded": "^4.2.3",
"@hugeicons-pro/core-solid-rounded": "^4.2.3"
```

Requires Hugeicons Pro access for the `core-*-rounded` packs.

### Pattern

Two wrappers + one registry:

| File | Role |
| --- | --- |
| `src/shared/components/layout/AppIcon.tsx` | Single stroke utility icon (`currentColor`, default `strokeWidth={1.5}`) |
| `src/shared/components/layout/NavHugeIcon.tsx` | Nav pair: **stroke idle → solid active** (`strokeWidth` 1.5 → 0) |
| `src/shared/components/layout/navIcons.ts` | Central map of `navIcons` (pairs) + `uiIcons` (stroke only) |

**Active nav rule:** stroke-rounded when idle, solid-rounded when active; color via `text-primary` / `currentColor`.

Example usage:

```tsx
<NavHugeIcon icons={navIcons.home} active={isActive} size={24} />
<AppIcon icon={uiIcons.copy} size={16} />
```

### Icon registry (current affiliate map)

**Nav pairs (`navIcons`):** home, products, orders, earnings, settings, productPages, inventory, sparkles  

**UI stroke (`uiIcons`):** chevrons, globe, check, account, billing, notifications, logout, menu, panelLeft, close, columns, view, copy, imageEmpty, newOrder, …

### Migration rule

1. **App chrome first:** sidebar, mobile tabs, header, user menu, language switcher, back button.
2. Register every icon in `navIcons.ts` — do not import Hugeicons ad-hoc in every screen.
3. Lucide may remain temporarily in feature widgets (e.g. `StatsCard` still takes `LucideIcon`) and storefront marketing chrome — migrate when touching those files.
4. Prefer `aria-label` on icon-only buttons; keep icons `aria-hidden`.

### Checklist — icons

- [ ] Install `@hugeicons/react` + stroke/solid rounded Pro packs
- [ ] Port `AppIcon`, `NavHugeIcon`, `navIcons.ts`
- [ ] Replace sidebar + mobile tab icons
- [ ] Replace header / user nav / language switcher icons
- [ ] Audit `lucide-react` imports in layout chrome and clear them

---

## 4. Mobile navigation shell

### Layout composition (`dashboard/layout.tsx`)

```
SidebarProvider
  AffiliateSidebar          ← md+ (desktop)
  SidebarInset
    DashboardHeader         ← desktop header (hidden on small if applicable)
    MobileDashboardTopNav   ← md:hidden sticky top
    <main className="… pb-24 …">  ← bottom padding for tab bar
      {children}
    </main>
    MobileTabBar            ← md:hidden fixed bottom
```

### Bottom tab bar (`MobileTabBar`)

- Fixed `inset-x-0 bottom-0`, `z-40`, `border-t`, `bg-white`
- Safe area: `pb-[env(safe-area-inset-bottom)]`
- Only `md:hidden`
- Grid of 5 equal tabs (adjust column count to stores IA)
- Each tab: icon (`NavHugeIcon` size 24) + label `text-[10px]`
- **Active state:**
  - `bg-accent/60`
  - `text-primary` + **bold** label
  - solid Hugeicon
- **Hover / focus (including active):** same `bg-accent/60` so focused active tabs keep the wash
- Active route: exact match for home; `pathname.startsWith(href)` for nested routes (exclude home prefix collision)

### Top mobile bar (`MobileDashboardTopNav`)

- Sticky `h-14`, `border-b`, `bg-white`, `md:hidden`
- Page title from pathname → i18n key
- Back button: ghost `size="icon"`, chevron via `AppIcon`, `rtl:rotate-180`
- Hide back on dashboard home

### Main content

- Reserve space for tabs: `pb-24` on mobile main
- Desktop: normal padding without tab clearance (`md:pb-6`)

### Checklist — mobile nav

- [ ] Add `MobileTabBar` + `MobileDashboardTopNav` (stores routes / labels)
- [ ] Wire into dashboard (or stores) layout
- [ ] Match active/hover/focus accent wash + primary text
- [ ] i18n keys under `navigation.*`
- [ ] Test home exact-match vs nested routes
- [ ] Test RTL back chevron rotation

---

## 5. Desktop sidebar

### What we did

- shadcn `Sidebar` primitives + near-white `--sidebar-*` tokens
- Same `navIcons` pairs via `NavHugeIcon`
- Active menu item: accent wash / primary treatment from sidebar styles
- Collapsible admin sections with trigger icons
- Language switcher + user nav in chrome

### Checklist — sidebar

- [ ] Port sidebar token set
- [ ] Use `NavHugeIcon` for every item
- [ ] Keep one shared nav config (keys → href → iconKey) for sidebar **and** mobile tabs where routes overlap

---

## 6. Product / UI micro-patterns worth matching

These are smaller but keep apps feeling like one product:

| Pattern | Affiliate behavior |
| --- | --- |
| Product cards | Portrait media `aspect-[4/5]`; primary CTA labeled; secondary actions as **icon buttons** (`size="icon"`) with aria-labels |
| Selection grids | Single bold border on selected tile (`border-[3px]` / `border-primary`); **no** selection ring |
| Stats | `StatsCard` + rate cards using `success` / `warning` / `destructive` for status dots |
| Charts | shadcn `ChartContainer` + Recharts; `--chart-1…5` blue scale |
| Currency display | Latin numerals (`numberingSystem: "latn"`) even in AR locale for amounts |
| Density | Medium SaaS: `gap-2` / `gap-3` / `p-4` cards; avoid heavy multi-shadow chrome |

---

## 7. Suggested port order for bellami-stores

1. **Tokens + Tailwind + globals + DESIGN.md**
2. **Fonts** (Inter / Cairo / Serif / Mono)
3. **Shadcn primitive re-skin** (button, card, input, select, sidebar)
4. **Hugeicons wrappers + `navIcons` registry**
5. **Desktop sidebar icons**
6. **Mobile top nav + bottom tabs + layout padding**
7. **Sweep layout chrome Lucide → Hugeicons**
8. **Feature polish** (cards, icon buttons, selection borders) as screens are touched

---

## 8. File index (copy from affiliate)

```
DESIGN.md
src/design-system/tokens.css
src/design-system/tokens.ts
src/design-system/index.ts
src/app/globals.css
src/app/layout.tsx                    # fonts
src/app/dashboard/layout.tsx          # shell composition
tailwind.config.ts
src/shared/components/layout/AppIcon.tsx
src/shared/components/layout/NavHugeIcon.tsx
src/shared/components/layout/navIcons.ts
src/shared/components/layout/MobileTabBar.tsx
src/shared/components/layout/MobileDashboardTopNav.tsx
src/shared/components/layout/AffiliateSidebar.tsx   # adapt naming/routes
src/shared/components/ui/button.tsx
src/shared/components/ui/card.tsx
src/shared/components/ui/input.tsx
src/shared/components/ui/select.tsx
src/shared/components/ui/sidebar.tsx
src/shared/components/ui/StatsCard.tsx
```

---

## 9. Do / Don’t (parity)

**Do**

- Use one primary (`#5138F5`) for interactive accent
- Use accent lavender (`#E8E9FF`) for selected / active washes
- Keep cards flat (border, no default shadow)
- Keep control radius tight (6px)
- Use Hugeicons stroke→solid for nav active state
- Keep mobile tab active background on focus as well as idle active

**Don’t**

- Reintroduce warm cream / terracotta / purple-gradient themes
- Mix random icon packs in chrome (one registry)
- Rely on rings + borders for selection (pick one bold border)
- Forget `pb-*` clearance above the fixed mobile tab bar
- Hard-code hex in feature components when a semantic token exists

---

## 10. Verification

After porting stores:

- [ ] Light mode primary / accent / borders match affiliate side-by-side
- [ ] Arabic (`lang=ar`) uses Cairo everywhere in UI
- [ ] Sidebar active icon is solid; idle is stroke
- [ ] Mobile tabs: 5 items, accent bg + primary text when active; focus keeps bg
- [ ] Mobile top title + back work; home hides back
- [ ] Desktop header vs mobile chrome don’t double-render awkwardly (`md:hidden` / `hidden md:flex`)
- [ ] Icon-only actions have accessible names

---

*Generated from the bellami-affiliate UI system for porting to bellami-stores. Keep this doc updated when chrome patterns change.*
