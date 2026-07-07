/**
 * Server-side Authentication & Authorization Helpers — SERVER-ONLY
 *
 * Reusable functions for checking auth and profile status in:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers
 *
 * IMPORTANT: These helpers use auth.getUser() for authoritative identity
 * verification. Do NOT use auth.getSession() for authorization decisions.
 *
 * All operations query the user's active database profile for roles and status.
 * Unauthenticated, suspended, or deleted profiles are rejected.
 */

import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/navigation";

/**
 * Minimal authenticated user shape.
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Minimal profile authorization shape.
 */
export interface AuthProfile {
  id: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "deleted";
}

/**
 * Get the currently authenticated user, or null if not logged in.
 *
 * Safe to call from Server Components, Server Actions, and Route Handlers.
 * Returns only non-sensitive identity fields.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user. Redirects to login if not authenticated.
 *
 * Use this in Server Components and Server Actions that must have a user.
 * The `next` parameter encodes the current path so the user returns after login.
 *
 * @param currentPath - Optional path to redirect back to after login
 * @returns The authenticated user (never null — redirects instead)
 */
export async function requireUser(currentPath?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = currentPath
      ? `${routes.login}?next=${encodeURIComponent(currentPath)}`
      : routes.login;

    redirect(loginUrl);
  }

  return user;
}

/**
 * Get the current user's profile information from the database, or null if missing/not logged in.
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    // Cast properties safely using the defined literals
    return {
      id: profile.id,
      role: (profile.role === "admin" ? "admin" : "user") as "user" | "admin",
      status: (profile.status || "active") as "active" | "suspended" | "deleted",
    };
  } catch {
    return null;
  }
}

/**
 * Require the current user to be active. Redirects to login/forbidden if inactive.
 */
export async function requireActiveUser(currentPath?: string): Promise<AuthProfile> {
  await requireUser(currentPath);
  const profile = await getCurrentProfile();

  if (!profile || profile.status !== "active") {
    // Redirect to login or specialized suspension landing page in the future
    redirect(`${routes.login}?error=account_inactive`);
  }

  return profile;
}

/**
 * Check if the currently logged-in user is an active admin.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return !!profile && profile.role === "admin" && profile.status === "active";
}

/**
 * Require an active admin role. Redirects if unauthorized.
 */
export async function requireAdmin(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    // Redirect authenticated non-admins to dashboard with forbidden error
    redirect(`${routes.dashboard}?error=forbidden`);
  }

  return profile;
}
