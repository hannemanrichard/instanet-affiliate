import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  AUTH_FALLBACK_PATH,
  isAuthEntryPath,
  resolveAuthRedirectPath,
} from "@/shared/utils/authRedirect";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/partner(.*)",
  "/api/orders(.*)",
  "/api/earnings(.*)",
  "/api/claims(.*)",
  "/api/marketplace-posts(.*)",
  "/api/dashboard(.*)",
  "/api/inventory(.*)",
  "/api/settings(.*)",
  "/api/leads(.*)",
  "/api/products(.*)",
  "/api/product-pages(.*)",
]);

const isPublicLeadRoute = createRouteMatcher(["/api/leads/public"]);

const buildLocalSignInRedirect = (req: Request) => {
  const url = new URL(req.url);
  const signInUrl = new URL("/sign-in", url.origin);
  const returnPath = `${url.pathname}${url.search}`;
  if (returnPath && returnPath !== "/sign-in") {
    signInUrl.searchParams.set("redirect_url", returnPath);
  }
  return NextResponse.redirect(signInUrl);
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname, searchParams } = req.nextUrl;
  const isAuthEntry = isAuthEntryPath(pathname);
  const isPublicLead = isPublicLeadRoute(req);

  if ((isProtectedRoute(req) && !isPublicLead) || isAuthEntry) {
    const { userId } = await auth();

    if (isAuthEntry && userId) {
      const nextPath = resolveAuthRedirectPath(
        searchParams.get("redirect_url"),
        AUTH_FALLBACK_PATH,
        req.nextUrl.origin
      );
      return NextResponse.redirect(new URL(nextPath, req.url));
    }

    if (isProtectedRoute(req) && !isPublicLead && !userId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Always use the app's custom /sign-in (never Clerk Account Portal).
      return buildLocalSignInRedirect(req);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sign-out(.*)",
    "/api/set-role(.*)",
    "/api/clerk(.*)",
    "/api/partner(.*)",
    "/api/orders(.*)",
    "/api/earnings(.*)",
    "/api/claims(.*)",
    "/api/marketplace-posts(.*)",
    "/api/extension(.*)",
    "/api/dashboard(.*)",
    "/api/inventory(.*)",
    "/api/settings(.*)",
    "/api/leads(.*)",
    "/api/products(.*)",
    "/api/product-pages(.*)",
    // Include uploadthing so auth() works for client uploads.
    // Do NOT add it to isProtectedRoute — UT server callbacks have no session.
    "/api/uploadthing(.*)",
  ],
};
