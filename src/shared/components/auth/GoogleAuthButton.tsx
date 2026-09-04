"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { resolveAuthRedirectPath } from "@/shared/utils/authRedirect";

const GoogleGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const resolveClerkError = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown[] }).errors)
  ) {
    const first = (
      error as { errors: Array<{ longMessage?: string; message?: string }> }
    ).errors[0];
    return first?.longMessage || first?.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

type GoogleAuthButtonProps = {
  mode: "sign-in" | "sign-up";
  onError: (message: string) => void;
};

export const GoogleAuthButton = ({ mode, onError }: GoogleAuthButtonProps) => {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoaded = mode === "sign-in" ? isSignInLoaded : isSignUpLoaded;
  const redirectPath = resolveAuthRedirectPath(
    searchParams.get("redirect_url")
  );

  const handleGoogleAuth = async () => {
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    onError("");

    const redirectUrl =
      mode === "sign-in"
        ? `${window.location.origin}/sign-in/sso-callback`
        : `${window.location.origin}/sign-up/sso-callback`;
    const redirectUrlComplete = `${window.location.origin}${redirectPath}`;

    try {
      if (mode === "sign-in") {
        if (!signIn) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (!signUp) return;
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl,
        redirectUrlComplete,
      });
    } catch (err) {
      onError(
        resolveClerkError(
          err,
          mode === "sign-in" ? t("errors.signInFailed") : t("errors.signUpFailed")
        )
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-3 border-input bg-background font-semibold shadow-sm hover:bg-accent"
      onClick={handleGoogleAuth}
      disabled={!isLoaded || isSubmitting}
      aria-busy={isSubmitting}
      aria-label={t("google.aria")}
    >
      <GoogleGlyph />
      {isSubmitting ? t("google.submitting") : t("google.continue")}
    </Button>
  );
};
