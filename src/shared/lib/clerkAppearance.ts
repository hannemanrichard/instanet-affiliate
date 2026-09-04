import type { Appearance } from "@clerk/types";
import { brand } from "@/design-system/tokens";

/**
 * Clerk UI themed to Instanet design tokens (shadcn / DESIGN.md).
 * Applied via ClerkProvider so SignIn, SignUp, and other Clerk surfaces match.
 */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
  },
  variables: {
    colorPrimary: brand.primaryHex,
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#333333",
    colorText: "#333333",
    colorTextSecondary: "#6b7280",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorNeutral: "#6b7280",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[24rem]",
    card: [
      "w-full rounded-xl border border-border bg-card text-card-foreground",
      "shadow-none ring-0",
    ].join(" "),
    cardBox: "shadow-none",
    headerTitle: "text-xl font-semibold tracking-tight text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButton: [
      "h-10 rounded-lg border border-input bg-background text-foreground shadow-sm",
      "hover:bg-accent hover:text-accent-foreground",
    ].join(" "),
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-border",
    dividerText: "text-xs text-muted-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput: [
      "h-10 rounded-lg border border-input bg-background text-foreground shadow-sm",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    ].join(" "),
    formButtonPrimary: [
      "h-10 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow",
      "hover:bg-primary/90",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    ].join(" "),
    footerActionLink: "font-medium text-primary hover:text-primary/90",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldAction: "text-sm font-medium text-primary hover:text-primary/90",
    otpCodeFieldInput: [
      "rounded-lg border border-input bg-background text-foreground shadow-sm",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    ].join(" "),
    alertText: "text-sm text-muted-foreground",
    formFieldErrorText: "text-xs text-destructive",
    footer: "bg-transparent",
    footerAction: "text-sm text-muted-foreground",
  },
};
