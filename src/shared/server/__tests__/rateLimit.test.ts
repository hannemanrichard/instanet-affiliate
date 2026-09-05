/** @jest-environment node */
import {
  consumeRateLimit,
  resetRateLimitStore,
} from "@/shared/server/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    resetRateLimitStore();
  });

  afterEach(() => {
    resetRateLimitStore();
    jest.useRealTimers();
  });

  it("allows requests within the configured window", () => {
    const first = consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 2,
      windowMs: 60_000,
    });
    const second = consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 2,
      windowMs: 60_000,
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests after the limit is exceeded", () => {
    consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 1,
      windowMs: 60_000,
    });

    const blocked = consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 1,
      windowMs: 60_000,
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the configured window elapses", () => {
    consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 1,
      windowMs: 60_000,
    });

    jest.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));

    const nextWindow = consumeRateLimit({
      bucket: "test-bucket",
      identifier: "127.0.0.1",
      limit: 1,
      windowMs: 60_000,
    });

    expect(nextWindow.allowed).toBe(true);
    expect(nextWindow.remaining).toBe(0);
  });
});
