export const AUTH_FALLBACK_PATH = "/dashboard";

const stripTrailingSlash = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

/** Sign-in / sign-up entry pages. SSO callbacks stay reachable during OAuth. */
export const isAuthEntryPath = (pathname: string): boolean => {
  const normalized = stripTrailingSlash(pathname);
  if (normalized.startsWith("/sign-in/sso-callback")) return false;
  if (normalized.startsWith("/sign-up/sso-callback")) return false;
  return (
    normalized === "/sign-in" ||
    normalized.startsWith("/sign-in/") ||
    normalized === "/sign-up" ||
    normalized.startsWith("/sign-up/")
  );
};

const pathFromAbsoluteUrl = (value: string, origin?: string): string | null => {
  try {
    const parsed = new URL(value);
    const allowedOrigin =
      origin ??
      (typeof window !== "undefined" ? window.location.origin : undefined);
    if (!allowedOrigin || parsed.origin !== allowedOrigin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

/** Resolve a safe in-app redirect path from auth query params. */
export const resolveAuthRedirectPath = (
  redirectUrl: string | null | undefined,
  fallback = AUTH_FALLBACK_PATH,
  origin?: string
): string => {
  if (!redirectUrl) return fallback;

  const trimmed = redirectUrl.trim();
  if (!trimmed) return fallback;

  let candidate: string | null = null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    candidate = trimmed;
  } else {
    candidate = pathFromAbsoluteUrl(trimmed, origin);
  }

  if (!candidate) return fallback;

  const pathname = stripTrailingSlash(candidate.split("?")[0].split("#")[0]);
  if (isAuthEntryPath(pathname)) return fallback;

  return candidate;
};
