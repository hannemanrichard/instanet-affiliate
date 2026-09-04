"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const StorefrontThankYouCard = () => {
  const t = useTranslations("storefront.thankYou");

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#ff5a5f]/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-[#ff5a5f]" />
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-semibold text-[#222]">
          {t("title")}
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          {t("description")}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          {t("body")}
        </p>
        <Button asChild className="h-12 w-full text-base font-medium">
          <Link href="/">{t("continue")}</Link>
        </Button>
      </div>
    </div>
  );
};

