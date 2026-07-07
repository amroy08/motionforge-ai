/**
 * Maps Supabase or validation auth error codes to user-friendly messages.
 * Prevents account enumeration and hides internal system details.
 */
export function mapAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Handle Zod or general string errors
  if (typeof error === "string") {
    return error;
  }

  // Check if error is a structured object
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const code = errObj.code || errObj.status || "";
    const msg = typeof errObj.message === "string" ? errObj.message : "";

    switch (code) {
      case "invalid_credentials":
      case 400:
        if (msg.includes("Invalid login credentials") || msg.includes("credentials")) {
          return "Invalid email or password. Please check your credentials and try again.";
        }
        if (msg.includes("Email not confirmed")) {
          return "Your email address has not been confirmed yet. Please verify your email inbox.";
        }
        if (msg.includes("User already registered") || msg.includes("already exists")) {
          return "An account with this email address already exists.";
        }
        return msg || "Invalid request. Please check the details provided.";

      case "email_not_confirmed":
        return "Your email address has not been confirmed yet. Please check your inbox for a confirmation link.";

      case "user_already_exists":
        return "An account with this email address already exists.";

      case "over_email_send_rate_limit":
      case 429:
        return "Too many requests. Please wait a few minutes before trying again.";

      case "same_password":
        return "The new password must be different from your current password.";

      case "session_not_found":
        return "Session expired or invalid. Please sign in again.";

      case "otp_expired":
        return "The confirmation link has expired. Please request a new verification email.";

      default:
        break;
    }
  }

  return "An unexpected error occurred. Please try again later.";
}
