"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendConfirmationSchema,
} from "@/lib/validations/auth";
import { mapAuthError } from "@/lib/auth/errors";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import type { AuthActionState } from "@/lib/auth/action-state";
import { routes, defaultLoginRedirect } from "@/config/navigation";

/**
 * Handle user registration (Sign Up)
 */
export async function registerAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawFields = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    terms_accepted: formData.get("terms_accepted") === "on",
  };

  // 1. Validate with Zod
  const result = registerSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: result.error.flatten().fieldErrors as AuthActionState["fieldErrors"],
    };
  }

  const { full_name, email, password } = result.data;
  const supabase = await createClient();

  // 2. Call Supabase Sign Up
  // Only metadata full_name is allowed. No roles, credits, or statuses.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${routes.authCallback}`,
      data: {
        full_name,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: mapAuthError(error),
    };
  }

  // 3. Handle email confirmation configurations
  // If session is returned, email confirmation is disabled in development.
  const session = data?.session;
  const user = data?.user;
  if (session && user) {
    // Session exists, let's verify if the profile trigger succeeded
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // Profile not found because migrations are not deployed
      await supabase.auth.signOut();
      return {
        status: "error",
        message: "Database schema migration is pending. Registration failed.",
      };
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut();
      return {
        status: "error",
        message: "Your account is inactive. Please contact support.",
      };
    }

    revalidatePath("/", "layout");
    redirect(defaultLoginRedirect);
  }

  // If email confirmation is enabled, redirect to verify-email
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

/**
 * Handle user Login (Sign In)
 */
export async function loginAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawFields = {
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || defaultLoginRedirect,
  };

  const result = loginSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      status: "error",
      message: "Please enter a valid email and password.",
      fieldErrors: result.error.flatten().fieldErrors as AuthActionState["fieldErrors"],
    };
  }

  const { email, password, next } = result.data;
  const supabase = await createClient();

  // Call Supabase SignIn
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: mapAuthError(error),
    };
  }

  // Verify the active profile status inside the database (cannot trust user_metadata)
  if (data?.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        status: "error",
        message: "Database configuration profile is missing. Please contact support.",
      };
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut();
      return {
        status: "error",
        message: "Your account has been suspended or deleted. Please contact support.",
      };
    }
  }

  const safeRedirect = getSafeRedirectPath(next, defaultLoginRedirect);
  revalidatePath("/", "layout");
  redirect(safeRedirect);
}

/**
 * Handle Forgot Password (request reset link)
 */
export async function forgotPasswordAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");

  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      fieldErrors: result.error.flatten().fieldErrors as AuthActionState["fieldErrors"],
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${routes.authCallback}?next=${routes.resetPassword}`,
  });

  if (error) {
    return {
      status: "error",
      message: mapAuthError(error),
    };
  }

  // Always return success to prevent account enumeration
  return {
    status: "success",
    message: "If an account exists for that email, a password reset link has been sent.",
  };
}

/**
 * Handle Reset Password (update password)
 */
export async function resetPasswordAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawFields = {
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = resetPasswordSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      status: "error",
      message: "Please correct the password requirements.",
      fieldErrors: result.error.flatten().fieldErrors as AuthActionState["fieldErrors"],
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: mapAuthError(error),
    };
  }

  // Logout/clear session immediately after password reset for security
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`${routes.login}?message=password_updated`);
}

/**
 * Handle Resend Confirmation Email
 */
export async function resendConfirmationAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");

  const result = resendConfirmationSchema.safeParse({ email });
  if (!result.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      fieldErrors: result.error.flatten().fieldErrors as AuthActionState["fieldErrors"],
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: result.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${routes.authCallback}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: mapAuthError(error),
    };
  }

  // Generic success to prevent account enumeration
  return {
    status: "success",
    message: "If your account is not verified, a new confirmation link has been sent.",
  };
}

/**
 * Handle User Logout
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(routes.login);
}
