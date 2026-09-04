import { SupabaseSettingsService } from "../../data";
import type { SettingEntity, SettingsMap } from "../../domain";

class SettingsApplicationService {
  private readonly settingsService = new SupabaseSettingsService();

  async getAllSettings(): Promise<SettingEntity[]> {
    return this.settingsService.getAll();
  }

  async getSettingByKey(key: string): Promise<SettingEntity | null> {
    return this.settingsService.getByKey(key);
  }

  async getAnalyticsSettings(): Promise<SettingEntity[]> {
    return this.settingsService.getByCategory("analytics");
  }

  async updateSetting(
    key: string,
    value: string | null
  ): Promise<SettingEntity> {
    if (!value || value.trim() === "") {
      return this.settingsService.update(key, null);
    }
    return this.settingsService.update(key, value.trim());
  }

  async getSettingsMap(): Promise<SettingsMap> {
    return this.settingsService.getSettingsMap();
  }
}

export const settingsApplicationService = new SettingsApplicationService();

