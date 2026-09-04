"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader } from "@/shared/components/ui/loader";

/** Clerk Google OAuth return URL for sign-up flow. */
export default function SignUpSsoCallbackPage() {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-center">
      <Loader />
      <p className="text-sm text-muted-foreground">Finishing Google sign-up…</p>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
