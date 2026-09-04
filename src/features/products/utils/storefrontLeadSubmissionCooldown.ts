/**
 * Client-side cooldown after a successful storefront lead submission,
 * per product page slug, to reduce duplicate / spam submissions.
 */

export const STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS = 20 * 60 * 1000;

const STORAGE_PREFIX = "bellami_storefront_lead_submitted";

const getStorageKey = (slug: string) =>
  `${STORAGE_PREFIX}:${encodeURIComponent(slug)}`;

const safeGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota or private mode — ignore; server should still enforce if needed later
  }
};

export const readLeadSubmissionTimestamp = (slug: string): number | null => {
  const raw = safeGetItem(getStorageKey(slug));
  if (raw == null || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getLeadSubmissionCooldownRemainingMs = (
  slug: string
): number => {
  const ts = readLeadSubmissionTimestamp(slug);
  if (ts == null) return 0;
  const elapsed = Date.now() - ts;
  const remaining = STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS - elapsed;
  return Math.max(0, remaining);
};

export const isLeadSubmissionBlocked = (slug: string): boolean =>
  getLeadSubmissionCooldownRemainingMs(slug) > 0;

export const recordLeadSubmission = (slug: string): void => {
  safeSetItem(getStorageKey(slug), String(Date.now()));
};
