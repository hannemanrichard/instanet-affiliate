import "server-only";
import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
  identifier?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const RATE_LIMIT_STORE_SYMBOL = Symbol.for("instanet-affiliate.rate-limit-store");

const getRateLimitStore = (): Map<string, RateLimitEntry> => {
  const globalScope = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_SYMBOL]?: Map<string, RateLimitEntry>;
  };

  if (!globalScope[RATE_LIMIT_STORE_SYMBOL]) {
    globalScope[RATE_LIMIT_STORE_SYMBOL] = new Map<string, RateLimitEntry>();
  }

  return globalScope[RATE_LIMIT_STORE_SYMBOL];
};

export const resetRateLimitStore = (): void => {
  getRateLimitStore().clear();
};

const buildStoreKey = (bucket: string, identifier: string) =>
  `${bucket}:${identifier}`;

export const getRequestIdentifier = (req: NextRequest): string => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const connectingIp = req.headers.get("cf-connecting-ip");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    connectingIp?.trim();

  return ip || "unknown";
};

export const consumeRateLimit = ({
  bucket,
  limit,
  windowMs,
  identifier,
}: RateLimitOptions): RateLimitResult => {
  const resolvedIdentifier = identifier?.trim() || "unknown";
  const now = Date.now();
  const store = getRateLimitStore();
  const key = buildStoreKey(bucket, resolvedIdentifier);
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      ),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    ),
  };
};

export const applyRateLimit = (
  req: NextRequest,
  options: Omit<RateLimitOptions, "identifier">
): RateLimitResult =>
  consumeRateLimit({
    ...options,
    identifier: getRequestIdentifier(req),
  });

export const createRateLimitResponse = (
  message = "Too many requests",
  retryAfterSeconds = 60
) =>
  NextResponse.json(
    { error: message, code: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
