/**
 * Supabase Server Client
 *
 * Creates a Supabase client for use in:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers
 *
 * Uses cookie-based auth via Next.js `cookies()`.
 * Uses the public anon key — never the service-role key.
 *
 * IMPORTANT: Create a new client per request — never cache across requests.
 *
 * In Server Components, cookies are read-only so `setAll` logs a warning
 * if the SDK tries to write cookies. Session refresh is handled by the
 * proxy (src/proxy.ts) before the Server Component renders.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Create a Supabase client for server-side use.
 * Must be called per-request (never cached globally).
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components, cookies cannot be set.
          // This is expected — the proxy handles session refresh
          // before the component renders.
        }
      },
    },
  });
}
