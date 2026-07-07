/**
 * Supabase Proxy Session Refresh Helper
 *
 * Used by src/proxy.ts to refresh authentication sessions
 * and write updated cookies to both the request and response.
 *
 * Uses the public anon key only — never the service-role key.
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

/**
 * Result of refreshing the Supabase session in the proxy.
 */
export interface ProxySessionResult {
  /** The Next.js response with updated auth cookies */
  response: NextResponse;
  /** The authenticated user, or null if not logged in */
  user: { id: string; email?: string } | null;
  /** The user's database profile, or null if missing/not logged in */
  profile: {
    role: "user" | "admin";
    status: "active" | "suspended" | "deleted";
  } | null;
}

/**
 * Refresh the Supabase auth session and write updated cookies.
 *
 * This function:
 * 1. Reads all incoming cookies from the request
 * 2. Creates a Supabase server client that can write to the response
 * 3. Calls auth.getUser() — an authoritative server-side check
 * 4. Queries the profiles table to retrieve the role and status for authorization
 * 5. Returns the response with updated cookies, the user, and the profile
 *
 * IMPORTANT: auth.getUser() contacts the Supabase Auth server to verify
 * the token. Do NOT use auth.getSession() alone for access decisions —
 * its data comes from cookies and is NOT verified.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<ProxySessionResult> {
  // Start with a forwarding response
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If Supabase is not configured, let requests pass through.
  // This allows the landing page to work without env vars during local dev.
  if (!supabaseUrl || !supabaseAnonKey) {
    return { response, user: null, profile: null };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Update cookies on the request so downstream Server Components see them
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        // Create a fresh response that includes the forwarded request
        response = NextResponse.next({
          request,
        });

        // Write cookies to the outgoing response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        // Set cache-control headers from Supabase to prevent CDN caching
        // of responses that contain auth cookies
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });

  // CRITICAL: Use getUser() instead of getSession().
  // getUser() contacts the Auth server and validates the JWT.
  // getSession() only reads from cookies without verification.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ProxySessionResult["profile"] = null;

  if (user) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        profile = {
          role: (data.role === "admin" ? "admin" : "user") as "user" | "admin",
          status: (data.status || "active") as "active" | "suspended" | "deleted",
        };
      }
    } catch {
      // Fail closed: if profile cannot be queried, keep it null.
    }
  }

  return {
    response,
    user: user
      ? { id: user.id, email: user.email ?? undefined }
      : null,
    profile,
  };
}

/**
 * Create a redirect response that preserves the refreshed auth cookies
 * from the original proxy response.
 */
export function createRedirectWithCookies(
  url: URL,
  originalResponse: NextResponse,
): NextResponse {
  const redirect = NextResponse.redirect(url);

  // Copy all cookies from the original response to the redirect.
  // This ensures refreshed auth tokens are not lost during redirects.
  originalResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value);
  });

  return redirect;
}
