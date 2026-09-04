"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AuthLogo } from "./AuthLogo";
import { GoogleAuthButton } from "./GoogleAuthButton";

export const SignInForm = () => {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirectUrl = searchParams.get("redirect_url");
  const signUpHref = redirectUrl
    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-up";

  const handleError = (message: string) => {
    setError(message || null);
  };

  return (
    <div className="w-full space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <AuthLogo />
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("signIn.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("signIn.subtitle")}</p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <GoogleAuthButton mode="sign-in" onError={handleError} />

      <p className="text-center text-sm text-muted-foreground">
        {t("signIn.noAccount")}{" "}
        <Link
          href={signUpHref}
          className="font-semibold text-primary hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("signIn.signUpLink")}
        </Link>
      </p>
    </div>
  );
};
