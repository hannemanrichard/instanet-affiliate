"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAnalyticsSettings, useUpdateSetting } from "../application";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import type { SettingKey } from "../domain";

const SETTING_KEYS: SettingKey[] = [
  "facebook_pixel_id",
  "tiktok_pixel_id",
  "google_analytics_id",
  "microsoft_clarity_id",
  "meta_conversion_api_access_token",
];

/** Admin-only analytics / pixel settings. */
export const AnalyticsSettingsSection = () => {
  const t = useTranslations("affiliateDashboard.settings");
  const { data: settings, isLoading } = useAnalyticsSettings();
  const updateMutation = useUpdateSetting();
  const { toast } = useToast();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: SettingKey) => {
    const value =
      localValues[key] ?? settings?.find((s) => s.key === key)?.value ?? null;
    const label = t(`fields.${key}.label`);

    try {
      await updateMutation.mutateAsync({
        key,
        value: value || null,
      });

      toast({
        title: t("toast.updatedTitle"),
        description: t("toast.updatedDescription", { label }),
      });

      setLocalValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {
      toast({
        title: t("toast.errorTitle"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {t("analytics.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("analytics.subtitle")}
        </p>
      </div>

      <div className="grid gap-4">
        {settings?.map((setting) => {
          const key = setting.key as SettingKey;
          if (!SETTING_KEYS.includes(key)) return null;

          const currentValue = localValues[key] ?? setting.value ?? "";
          const isDirty =
            localValues[key] !== undefined &&
            localValues[key] !== (setting.value ?? "");
          const label = t(`fields.${key}.label`);
          const placeholder = t(`fields.${key}.placeholder`);

          return (
            <Card key={setting.key}>
              <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
                {setting.description ? (
                  <CardDescription>{setting.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={setting.key}>{label}</Label>
                    <Input
                      id={setting.key}
                      type={
                        setting.key === "meta_conversion_api_access_token"
                          ? "password"
                          : "text"
                      }
                      value={currentValue}
                      onChange={(e) =>
                        handleChange(setting.key, e.target.value)
                      }
                      placeholder={placeholder}
                      disabled={updateMutation.isPending}
                      aria-label={label}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSave(key)}
                    disabled={!isDirty || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? t("saving") : t("save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
