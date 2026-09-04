---
version: alpha
name: Modern Minimal
description: A saturated blue shadcn/ui theme — crisp blue primary on pure white, contemporary app chrome clarity, and clean modern product energy by tweakcn.
colors:
  background: "#ffffff"
  foreground: "#333333"
  card: "#ffffff"
  primary: "#5138F5"
  primary-foreground: "#ffffff"
  secondary: "#f3f4f6"
  secondary-foreground: "#4b5563"
  muted: "#f9fafb"
  muted-foreground: "#6b7280"
  accent: "#E8E9FF"
  accent-foreground: "#1e3a8a"
  destructive: "#ef4444"
  border: "#e5e7eb"
  input: "#e5e7eb"
  ring: "#5138F5"
  sidebar: "#f9fafb"
  sidebar-foreground: "#333333"
  sidebar-primary: "#5138F5"
  sidebar-accent: "#E8E9FF"
  chart-1: "#5138F5"
  chart-2: "#2563eb"
  chart-3: "#1d4ed8"
  chart-4: "#1e40af"
  chart-5: "#1e3a8a"
  dark-background: "#171717"
  dark-foreground: "#e5e5e5"
  dark-card: "#262626"
  dark-primary: "#5138F5"
  dark-secondary: "#262626"
  dark-muted: "#1f1f1f"
  dark-muted-foreground: "#a3a3a3"
  dark-accent: "#E8E9FF"
  dark-border: "#404040"
  dark-sidebar: "#171717"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  serif:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 0px
  sm: 2px
  md: 4px
  lg: 6px
  xl: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  section: 64px
  gutter: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 24px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
---

# Modern Minimal

A premade shadcn/ui theme by [tweakcn](https://tweakcn.com). Install tokens with `npx shadcn@latest add @shadcnblocks/theme/modern-minimal`, then keep this DESIGN.md in the project root (or `.agents/`) so coding agents stay on-brand.

## Overview

Modern Minimal is the prototypical contemporary SaaS palette: a confident, saturated blue primary (`#5138F5`) on a pure white canvas, with soft cool-gray structural chrome. It looks like the dozen best-in-class web apps you use daily — Notion, Linear, Stripe, Vercel — distilled into one clean token set. The blue is neither navy-dark nor sky-light: it sits at the exact midpoint that reads as both trustworthy and modern.

The system is **clear, contemporary, and universally appropriate**. It suits any SaaS product, admin panel, web app, or marketing site that wants to look polished and current without committing to a strong brand opinion. The blue primary and gray-scale neutrals are the most broadly acceptable combination in product design.

Emotional targets: modern, trustworthy, clear — never retro, never edgy, never warm.

## Colors

The palette is **blue-on-white** — a single saturated primary against a precise cool-gray neutral system.

- **Primary (`#5138F5`):** Saturated medium blue — primary buttons, links, focus rings, and brand moments. Identical in both light and dark modes for brand consistency.
- **Secondary (`#f3f4f6`):** Cool light gray — secondary buttons, quiet fills, card alternates.
- **Accent (`#E8E9FF`):** Soft lavender wash — selected states, active pills, hover backgrounds.
- **Foreground (`#333333`):** Dark charcoal — body text. Slightly softer than pure black for comfortable reading.
- **Background (`#ffffff`):** Pure white canvas — no tint, no texture.
- **Card (`#ffffff`):** White surfaces — same as background; borders and shadows do containment.
- **Muted (`#f9fafb`):** Barely-off-white for subtle wells, skeleton fills, and secondary backgrounds.
- **Border (`#e5e7eb`):** Cool gray — clean, visible separators.
- **Ring (`#5138F5`):** Blue focus ring — matches primary for cohesive interaction feedback.
- **Destructive (`#ef4444`):** Standard red — clearly distinct from the blue brand color.
- **Accent-foreground (`#1e3a8a`):** Deep navy — text/icons on the lavender accent background.

Dark mode drops to near-black (`#171717`) with gray cards (`#262626`). The blue primary persists unchanged — brand consistency across modes. Chart colors deepen slightly.

## Typography

**Inter** is the sole UI face — display, body, and labels. **Source Serif 4** is the optional serif for editorial moments. **JetBrains Mono** covers code.

- **Display / headlines:** Inter Bold, tight tracking. Standard contemporary SaaS heading treatment.
- **Body:** Inter Regular at 16px with 1.6 line-height. The most readable web sans at any size.
- **Labels / UI chrome:** Inter Medium at 14px. Sentence case throughout.
- **Serif:** Source Serif 4 for optional long-form or editorial callouts — never in app chrome.
- **Mono:** JetBrains Mono for code blocks, API references, and technical fragments.

Avoid decorative, branded, or personality-forward type choices. Modern Minimal's power is typographic invisibility — Inter does everything.

## Layout

Use a **contemporary app rhythm**: 8px base, clear hierarchy, and balanced whitespace.

- Prefer a max-width content column (~1200px) with `2rem` horizontal gutters.
- Cards and panels use border separation on white canvas — clean and systematic.
- Marketing pages: centered headline, blue CTA, minimal supporting copy.
- App shells: near-white sidebar, white content pane. Blue appears on active nav items and primary CTAs only.
- Density: medium. Modern but not cramped — the standard SaaS balance.

## Elevation & Depth

Depth is **minimal and clean** — subtle shadows for overlays, flat surfaces for most content.

- Cards default to border-only containment; add shadow for interactive states or floating overlays.
- Shadow language is standard: short offsets, low opacity, no colored tints.
- Prefer tonal layering: muted → white card → blue action.
- Avoid dramatic shadows, colored glows, or multi-layer elevation.
- Dark mode: lighter card backgrounds provide elevation; shadows are barely visible.

## Shapes

Corner radius is **tight** — base `--radius` is `0.375rem` (6px).

- Buttons, inputs, and controls: ~6px (`rounded-lg`).
- Cards and large panels: ~10px (`rounded-xl`).
- The tight radius communicates modern precision without being sharp or cold.
- Do not inflate to large bubbly radii — keep the contemporary edge.

## Components

Built for the shadcn/ui token contract. Prefer semantic tokens (`bg-primary`, `text-muted-foreground`) over raw hex in component code.

- **Primary button:** Blue fill, white label. The standard modern CTA — one per view.
- **Secondary button:** Light gray fill, gray-dark text. Quiet companion.
- **Outline / ghost:** Charcoal text on transparent; cool gray border.
- **Cards:** White surface, gray border, tight radius. Clean and functional.
- **Inputs:** White fields, gray borders, blue focus ring. Familiar and accessible.
- **Sidebar:** Near-white shell, dark text. Active item uses blue accent or pale sky wash.
- **Charts:** Monochromatic blue scale — from medium blue through royal to deep navy. Professional and unified.
- **Badges:** Pale blue accent fills for active, gray for neutral, red for destructive.
- **Links:** Blue (`#5138F5`) inline — the traditional trustworthy link color.

## Do's and Don'ts

**Do**

- Do use the saturated blue as the single interactive accent — links, buttons, active states, focus rings.
- Do keep structural surfaces purely achromatic (white, near-white, gray, charcoal).
- Do use Inter at every scale — typographic consistency is the "minimal" promise.
- Do maintain the tight 6px radius for a contemporary app feel.
- Do keep the blue identical across light and dark modes — brand recognition.

**Don't**

- Don't introduce warm accents (amber, coral, terracotta) — they fight the cool blue story.
- Don't warm the background to cream or parchment — Modern Minimal is cool-white.
- Don't add secondary saturated colors (purple for secondary, green for success) into the structural chrome.
- Don't inflate radii to soft bubbly shapes — that ages the design.
- Don't use decorative illustrations or personality-forward styling in the chrome layer.
- Don't desaturate the primary to steel-blue or navy — the medium blue saturation level is the identity.
