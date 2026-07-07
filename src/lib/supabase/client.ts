/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in browser (Client) components.
 * Uses the public anon key — never the service-role key.
 *
 * @supabase/ssr handles cookie-based auth automatically in the browser.
 */

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Get a Supabase client for browser components.
 * Returns a singleton to avoid creating multiple GoTrue instances.
 */
export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return client;
}
