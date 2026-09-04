import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/leads(.*)",
  "/orders(.*)",
  "/products(.*)",
  "/partners(.*)",
  "/balance(.*)",
  "/stats(.*)",
  "/settings(.*)",
  "/profile(.*)",
]);


export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// Helper functions for role-based access
export const requireAuth = () => {
  return clerkMiddleware((auth) => {
    auth.protect();
  });
};

export const requireAdmin = () => {
  return clerkMiddleware((auth) => {
    auth.protect();

    // Additional admin check can be done in the route handler
    // using auth().userId and auth().sessionClaims
  });
};
