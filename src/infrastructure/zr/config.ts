import "server-only";

/**
 * ZR Express API credentials (new platform: api.zrexpress.app).
 * Docs: https://docs.zrexpress.app/docs/authentication
 */
export type ZrConfig = {
  baseUrl: string;
  tenantId: string;
  apiKey: string;
  apiVersion: string;
};

export const getZrConfig = (): ZrConfig => {
  const baseUrl = (
    process.env.ZR_API_URL ?? "https://api.zrexpress.app"
  ).replace(/\/$/, "");
  const tenantId = process.env.ZR_TENANT_ID?.trim() ?? "";
  const apiKey = process.env.ZR_API_KEY?.trim() ?? "";
  const apiVersion = process.env.ZR_API_VERSION?.trim() || "1";

  return { baseUrl, tenantId, apiKey, apiVersion };
};

export const assertZrConfig = (config: ZrConfig): void => {
  if (!config.tenantId || !config.apiKey) {
    throw new Error(
      "ZR Express is not configured. Set ZR_TENANT_ID and ZR_API_KEY in .env, then restart the server."
    );
  }
};
