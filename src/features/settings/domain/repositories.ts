import type { SettingEntity, SettingsMap } from "./entities";

export interface SettingsRepository {
  getAll(): Promise<SettingEntity[]>;
  getByKey(key: string): Promise<SettingEntity | null>;
  getByCategory(category: string): Promise<SettingEntity[]>;
  update(key: string, value: string | null): Promise<SettingEntity>;
  getSettingsMap(): Promise<SettingsMap>;
}

