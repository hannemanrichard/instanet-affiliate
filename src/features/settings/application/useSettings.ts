"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { SettingEntity, SettingKey, SettingsMap } from "../domain";

const SETTINGS_QUERY_KEY = ["settings"];

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => apiFetch<SettingEntity[]>("/api/settings"),
  });
};

export const useAnalyticsSettings = () => {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, "analytics"],
    queryFn: () => apiFetch<SettingEntity[]>("/api/settings/analytics"),
  });
};

export const useSettingsMap = () => {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, "map"],
    queryFn: () => apiFetch<SettingsMap>("/api/settings/map"),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: SettingKey; value: string | null }) =>
      apiFetch<SettingEntity>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};
