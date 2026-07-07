export type MediaErrorCategory =
  | "not_authenticated"
  | "inactive_account"
  | "invalid_file_type"
  | "file_too_large"
  | "image_too_small"
  | "image_too_large"
  | "too_many_pixels"
  | "animated_image_not_supported"
  | "corrupt_image"
  | "upload_authorization_failed"
  | "upload_failed"
  | "upload_expired"
  | "storage_not_configured"
  | "database_not_configured"
  | "registration_failed"
  | "preview_failed"
  | "delete_failed"
  | "permission_denied"
  | "temporary_failure"
  | "unknown";

interface ParsedMediaError {
  category: MediaErrorCategory;
  message: string;
  debugMessage?: string;
}

/**
 * Maps raw storage/database exceptions to user friendly messages.
 * Masks sensitive storage paths, credentials, and stack traces.
 */
export function mapMediaError(error: unknown): ParsedMediaError {
  if (!error) {
    return {
      category: "unknown",
      message: "An unexpected error occurred. Please try again.",
    };
  }

  // Handle direct string errors
  if (typeof error === "string") {
    return {
      category: "temporary_failure",
      message: error,
    };
  }

  const errObj = error as Record<string, unknown>;
  const code = String(errObj.code || errObj.status || "");
  const message = String(errObj.message || "");

  // Match known database/storage error codes
  if (code === "42P01") {
    return {
      category: "database_not_configured",
      message: "Database tables are currently unconfigured.",
      debugMessage: "PostgreSQL 42P01: Relation does not exist. Run Supabase db reset.",
    };
  }
  if (code === "42501" || message.includes("policy") || message.includes("Permission denied")) {
    return {
      category: "permission_denied",
      message: "Access is restricted. Permission denied.",
      debugMessage: "Access control policy violation: RLS permissions blocked action.",
    };
  }

  // Storage specific error mappings
  if (message.includes("Bucket not found") || code === "404" && message.includes("bucket")) {
    return {
      category: "storage_not_configured",
      message: "Storage services are not fully configured.",
      debugMessage: "Supabase storage error: user-media bucket does not exist.",
    };
  }

  if (message.includes("size") || message.includes("Entity Too Large")) {
    return {
      category: "file_too_large",
      message: "The uploaded file exceeds the maximum allowed limit of 6 MB.",
    };
  }

  return {
    category: "temporary_failure",
    message: "A connection timeout occurred. Please try again.",
    debugMessage: message,
  };
}
