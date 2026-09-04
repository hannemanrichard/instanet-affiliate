"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/shared/lib/clerkAppearance";

interface ConditionalClerkProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with Clerk. Previously conditional (storefront-only routes
 * skipped Clerk); the landing page now uses auth-aware CTAs on `/`.
 */
export const ConditionalClerkProvider = ({
  children,
}: ConditionalClerkProviderProps) => {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
};
