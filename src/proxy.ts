/**
 * Next.js 16 Proxy — Session refresh and route protection
 *
 * Replaces the deprecated middleware.ts convention.
 * Runs before matched requests to:
 *   1. Refresh the Supabase auth session
 *   2. Redirect unauthenticated users away from protected routes
 *   3. Enforce active admin roles on `/admin` routes
 *   4. Block inactive (suspended/deleted) users from operational routes
 *   5. Redirect active authenticated users away from guest-only routes
 *
 * NOTE: Proxy routing improves UX, but server layouts, route handlers,
 * and database RLS must still independently enforce authorization.
 */

import { type NextRequest } from "next/server";

import {
  refreshSession,
  createRedirectWithCookies,
} from "@/lib/supabase/proxy";
import {
  protectedPrefixes,
  guestOnlyPrefixes,
  defaultLoginRedirect,
} from "@/config/navigation";

/**
 * Check whether the given path starts with any of the provided prefixes.
 */
function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Validate that a redirect target is a safe internal relative path.
 * Rejects absolute URLs, protocol-relative URLs, and other open-redirect vectors.
 */
function getSafeRedirectPath(value: string | null): string | null {
  if (!value) return null;

  // Must start with / and not start with // (protocol-relative)
  if (!value.startsWith("/") || value.startsWith("//")) return null;

  // Reject URLs with protocol schemes
  if (/^[a-z]+:/i.test(value)) return null;

  // Reject encoded characters that could bypass checks
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /^[a-z]+:/i.test(decoded)) return null;
  } catch {
    return null;
  }

  return value;
}

export async function proxy(request: NextRequest) {
  const { response, user, profile } = await refreshSession(request);
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!user;
  const isProtected = matchesPrefix(pathname, protectedPrefixes);
  const isGuestOnly = matchesPrefix(pathname, guestOnlyPrefixes);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // ── Unauthenticated user on a protected route → redirect to login ──
  if (!isAuthenticated && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return createRedirectWithCookies(loginUrl, response);
  }

  // ── Authenticated user checks ──
  if (isAuthenticated) {
    // 1. Block suspended or deleted accounts from accessing protected routes
    const isActive = profile?.status === "active";
    if (!isActive && isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "account_inactive");
      return createRedirectWithCookies(loginUrl, response);
    }

    // 2. Enforce admin role on /admin routes
    if (isAdminRoute) {
      const isAdmin = profile?.role === "admin" && isActive;
      if (!isAdmin) {
        const forbiddenUrl = request.nextUrl.clone();
        forbiddenUrl.pathname = defaultLoginRedirect; // Redirect to /dashboard
        forbiddenUrl.searchParams.set("error", "forbidden");
        return createRedirectWithCookies(forbiddenUrl, response);
      }
    }

    // 3. Redirect active users away from guest-only auth pages
    if (isGuestOnly && isActive) {
      const next = getSafeRedirectPath(
        request.nextUrl.searchParams.get("next"),
      );
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next ?? defaultLoginRedirect;
      redirectUrl.searchParams.delete("next");
      return createRedirectWithCookies(redirectUrl, response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - _next/static  (static files)
     *   - _next/image   (image optimization)
     *   - favicon.ico   (favicon)
     *   - Common static assets (images, fonts, etc.)
     *   - robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
