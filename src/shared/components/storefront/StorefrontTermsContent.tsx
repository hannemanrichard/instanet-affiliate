"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

const SECTION_KEYS = [
  "acceptance",
  "responsibilities",
  "availability",
  "payment",
  "changes",
] as const;

export const StorefrontTermsContent = () => {
  const t = useTranslations("storefront.terms");

  const sections = useMemo(
    () =>
      SECTION_KEYS.map((key) => ({
        key,
        title: t(`sections.${key}.title`),
        content: t(`sections.${key}.content`),
      })),
    [t]
  );

  return (
    <div className="container mx-auto space-y-8 px-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.key} className="space-y-3">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.content}
              </p>
              {index < sections.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

