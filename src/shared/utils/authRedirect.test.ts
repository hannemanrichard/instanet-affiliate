import {
  AUTH_FALLBACK_PATH,
  isAuthEntryPath,
  resolveAuthRedirectPath,
} from "./authRedirect";

describe("isAuthEntryPath", () => {
  it("matches sign-in and sign-up entry routes", () => {
    expect(isAuthEntryPath("/sign-in")).toBe(true);
    expect(isAuthEntryPath("/sign-in/")).toBe(true);
    expect(isAuthEntryPath("/sign-up")).toBe(true);
    expect(isAuthEntryPath("/sign-up/factor-one")).toBe(true);
  });

  it("does not match SSO callbacks or other routes", () => {
    expect(isAuthEntryPath("/sign-in/sso-callback")).toBe(false);
    expect(isAuthEntryPath("/sign-up/sso-callback")).toBe(false);
    expect(isAuthEntryPath("/dashboard")).toBe(false);
    expect(isAuthEntryPath("/sign-out")).toBe(false);
  });
});

describe("resolveAuthRedirectPath", () => {
  it("falls back when empty or unsafe", () => {
    expect(resolveAuthRedirectPath(null)).toBe(AUTH_FALLBACK_PATH);
    expect(resolveAuthRedirectPath("https://evil.example/phish")).toBe(
      AUTH_FALLBACK_PATH
    );
  });

  it("allows in-app relative paths", () => {
    expect(resolveAuthRedirectPath("/dashboard/orders")).toBe(
      "/dashboard/orders"
    );
  });

  it("does not bounce signed-in users back to sign-in", () => {
    expect(resolveAuthRedirectPath("/sign-in")).toBe(AUTH_FALLBACK_PATH);
    expect(resolveAuthRedirectPath("/sign-up?foo=1")).toBe(AUTH_FALLBACK_PATH);
  });

  it("allows same-origin absolute URLs when origin is provided", () => {
    expect(
      resolveAuthRedirectPath(
        "https://app.example/dashboard/inventory",
        AUTH_FALLBACK_PATH,
        "https://app.example"
      )
    ).toBe("/dashboard/inventory");
  });
});
