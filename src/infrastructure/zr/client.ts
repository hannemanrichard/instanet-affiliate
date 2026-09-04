import "server-only";

import { assertZrConfig, getZrConfig, type ZrConfig } from "./config";

export type ZrRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  /** Override API version path segment (e.g. "1" or "1.0") */
  apiVersion?: string;
};

export class ZrHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ZrHttpError";
  }
}

export const zrFetch = async <T>(
  path: string,
  options: ZrRequestOptions = {},
  config: ZrConfig = getZrConfig()
): Promise<T> => {
  assertZrConfig(config);

  const version = options.apiVersion ?? config.apiVersion;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${config.baseUrl}/api/v${version}${normalizedPath}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tenant": config.tenantId,
      "X-Api-Key": config.apiKey,
    },
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const detail = extractZrErrorMessage(parsed, response.status);
    throw new ZrHttpError(detail, response.status, parsed);
  }

  return parsed as T;
};

const extractZrErrorMessage = (parsed: unknown, status: number): string => {
  if (typeof parsed === "object" && parsed) {
    const record = parsed as {
      detail?: unknown;
      title?: unknown;
      errors?: Array<{ description?: string; code?: string }>;
    };

    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const parts = record.errors
        .map((item) => item.description || item.code)
        .filter(Boolean);
      if (parts.length) return parts.join("; ");
    }

    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }

    if (typeof record.title === "string" && record.title.trim()) {
      return record.title;
    }
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return parsed;
  }

  return `ZR Express request failed (${status})`;
};
