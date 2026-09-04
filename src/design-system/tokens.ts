/**
 * Modern Minimal — typed / JS-facing config (DESIGN.md).
 * Visual colors live in tokens.css.
 */

export const layout = {
  /** Matches --sidebar-width in tokens.css */
  sidebarWidth: "16rem",
  /** Matches --sidebar-width-icon in tokens.css */
  sidebarWidthIcon: "3.25rem",
  sidebarWidthMobile: "18rem",
  /** Matches --header-height in tokens.css */
  headerHeight: "3.5rem",
} as const;

export const radii = {
  /** Matches --radius (6px); Tailwind rounded-lg/md/sm derive from this */
  control: "0.375rem",
} as const;

export const fonts = {
  sansVar: "--font-montserrat",
  displayVar: "--font-montserrat",
  serifVar: "--font-source-serif",
  monoVar: "--font-jetbrains-mono",
  arabicVar: "--font-cairo",
} as const;

/**
 * Hex for Clerk / APIs. Matches --primary / --brand in tokens.css.
 */
export const brand = {
  primaryHex: "#5138F5",
  accentHex: "#E8E9FF",
} as const;

export const zIndex = {
  sidebar: 10,
  header: 40,
  overlay: 50,
} as const;

export const designTokens = {
  layout,
  radii,
  fonts,
  brand,
  zIndex,
} as const;

export type DesignTokens = typeof designTokens;
