import {
  getLeadSubmissionCooldownRemainingMs,
  isLeadSubmissionBlocked,
  readLeadSubmissionTimestamp,
  recordLeadSubmission,
  STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS,
} from "./storefrontLeadSubmissionCooldown";

describe("storefrontLeadSubmissionCooldown", () => {
  const slug = "test-product-slug";

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns no block when nothing stored", () => {
    expect(readLeadSubmissionTimestamp(slug)).toBeNull();
    expect(isLeadSubmissionBlocked(slug)).toBe(false);
    expect(getLeadSubmissionCooldownRemainingMs(slug)).toBe(0);
  });

  it("blocks within cooldown window after recordLeadSubmission", () => {
    recordLeadSubmission(slug);
    expect(isLeadSubmissionBlocked(slug)).toBe(true);
    expect(getLeadSubmissionCooldownRemainingMs(slug)).toBe(
      STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS
    );

    jest.advanceTimersByTime(10 * 60 * 1000);
    expect(isLeadSubmissionBlocked(slug)).toBe(true);
    expect(getLeadSubmissionCooldownRemainingMs(slug)).toBe(
      STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS - 10 * 60 * 1000
    );
  });

  it("unblocks after cooldown elapsed", () => {
    recordLeadSubmission(slug);
    jest.advanceTimersByTime(STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS + 1);
    expect(isLeadSubmissionBlocked(slug)).toBe(false);
    expect(getLeadSubmissionCooldownRemainingMs(slug)).toBe(0);
  });

  it("uses distinct storage per slug", () => {
    recordLeadSubmission("slug-a");
    expect(isLeadSubmissionBlocked("slug-a")).toBe(true);
    expect(isLeadSubmissionBlocked("slug-b")).toBe(false);
  });
});
