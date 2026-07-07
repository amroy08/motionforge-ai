/**
 * Supabase Admin Client — SERVER-ONLY
 *
 * ⚠️  WARNING: This client uses the service-role key and BYPASSES
 * Row Level Security. Use it only for administrative operations that
 * cannot be performed through the normal authenticated client.
 *
 * NEVER import this module from:
 *   - Client Components
 *   - Browser-accessible code
 *   - The proxy layer
 *   - Public API endpoints
 *
 * Examples of valid usage (in later phases):
 *   - Creating user profiles via database trigger fallback
 *   - Admin credit adjustments
 *   - Webhook processing
 *   - Background jobs
 */

import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Create a Supabase admin client that bypasses RLS.
 * Each call creates a fresh instance — no session caching.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local. " +
        "This key bypasses Row Level Security — keep it secret.",
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
