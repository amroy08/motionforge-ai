/**
 * Supabase Auth Callback Route
 *
 * Handles:
 *   - Email verification (magic link / confirmation)
 *   - OAuth provider redirects
 *   - Password reset token exchange
 *
 * The `code` query parameter is exchanged for a session.
 * A safe `next` parameter controls the post-auth redirect.
 */

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { defaultLoginRedirect } from "@/config/navigation";

/**
 * Validate that a redirect target is a safe internal relative path.
 * Prevents open-redirect vulnerabilities.
 */
function getSafeRedirectPath(value: string | null): string {
  if (!value) return defaultLoginRedirect;

  // Must start with / and not be protocol-relative
  if (!value.startsWith("/") || value.startsWith("//")) {
    return defaultLoginRedirect;
  }

  // Reject protocol schemes
  if (/^[a-z]+:/i.test(value)) return defaultLoginRedirect;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /^[a-z]+:/i.test(decoded)) {
      return defaultLoginRedirect;
    }
  } catch {
    return defaultLoginRedirect;
  }

  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Auth code exchange failed — redirect to login with a generic error indicator.
  // Do not reveal internal Supabase error details in the URL.
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(loginUrl);
}
