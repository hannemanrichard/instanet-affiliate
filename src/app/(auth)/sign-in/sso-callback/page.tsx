"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader } from "@/shared/components/ui/loader";

/**
 * Clerk Google OAuth return URL.
 * Must stay under /sign-in so ClerkProvider is always available.
 */
export default function SignInSsoCallbackPage() {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-center">
      <Loader />
      <p className="text-sm text-muted-foreground">Finishing Google sign-in…</p>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
