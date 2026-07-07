/**
 * Session Verification API — Development helper
 *
 * Returns the current authentication status without exposing
 * tokens, cookies, or sensitive metadata.
 *
 * Useful for verifying the Supabase configuration is working
 * before auth UI exists (Phase 5).
 */

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // Return only non-sensitive identity fields.
    // Never return access tokens, refresh tokens, or raw metadata.
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email ?? null,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    // Return a controlled error — never expose raw Supabase errors
    return NextResponse.json(
      { authenticated: false, user: null, error: "session_check_failed" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
