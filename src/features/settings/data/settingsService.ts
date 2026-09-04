import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { SettingEntity, SettingsMap } from "../domain";
import type { SettingsRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type SettingRow = {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};
type SettingUpdate = Partial<SettingRow>;

export class SupabaseSettingsService implements SettingsRepository {
  private readonly tableName = "settings";

  async getAll(): Promise<SettingEntity[]> {
    return withPerformanceTracking("SettingsService", "getAll", async () => {
      const rows = await DatabaseWrapper.executeQuery<SettingRow[]>(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName as any)
            .select("*")
            .order("key", { ascending: true });

          if (error) throw error;
          return { data: (data as unknown as SettingRow[]) ?? [], error };
        },
        {
          operation: "getAll",
          table: this.tableName,
        }
      );

      return rows.map(this.mapRowToEntity);
    });
  }

  async getByKey(key: string): Promise<SettingEntity | null> {
    return withPerformanceTracking(
      "SettingsService",
      "getByKey",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName as any)
              .select("*")
              .eq("key", key)
              .maybeSingle();

            if (error) throw error;
            return { data: (data as unknown as SettingRow | null) ?? null, error };
          },
          {
            operation: "getByKey",
            table: this.tableName,
            metadata: { key },
          }
        );

        if (!row) return null;

        return this.mapRowToEntity(row);
      }
    );
  }

  async getByCategory(category: string): Promise<SettingEntity[]> {
    return withPerformanceTracking(
      "SettingsService",
      "getByCategory",
      async () => {
        const rows = await DatabaseWrapper.executeQuery<SettingRow[]>(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName as any)
              .select("*")
              .eq("category", category)
              .order("key", { ascending: true });

            if (error) throw error;
            return { data: (data as unknown as SettingRow[]) ?? [], error };
          },
          {
            operation: "getByCategory",
            table: this.tableName,
            metadata: { category },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async update(key: string, value: string | null): Promise<SettingEntity> {
    return withPerformanceTracking("SettingsService", "update", async () => {
      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const updateData: SettingUpdate = {
            value,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from(this.tableName as any)
            .update(updateData)
            .eq("key", key)
            .select()
            .single();

          if (error) throw error;
          return { data: (data as unknown as SettingRow) ?? null, error };
        },
        {
          operation: "update",
          table: this.tableName,
          metadata: { key },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async getSettingsMap(): Promise<SettingsMap> {
    return withPerformanceTracking(
      "SettingsService",
      "getSettingsMap",
      async () => {
        const settings = await this.getAll();
        const map: SettingsMap = {};

        for (const setting of settings) {
          if (setting.is_active) {
            switch (setting.key) {
              case "facebook_pixel_id":
                map.facebook_pixel_id = setting.value;
                break;
              case "tiktok_pixel_id":
                map.tiktok_pixel_id = setting.value;
                break;
              case "google_analytics_id":
                map.google_analytics_id = setting.value;
                break;
              case "microsoft_clarity_id":
                map.microsoft_clarity_id = setting.value;
                break;
              case "meta_conversion_api_access_token":
                map.meta_conversion_api_access_token = setting.value;
                break;
            }
          }
        }

        return map;
      }
    );
  }

  private mapRowToEntity(row: SettingRow): SettingEntity {
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      category: row.category ?? "",
      is_active: row.is_active ?? false,
      created_at: row.created_at ?? "",
      updated_at: row.updated_at ?? "",
    };
  }
}

