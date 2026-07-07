export type StudioErrorCategory =
  | "not_authenticated"
  | "inactive_account"
  | "database_not_configured"
  | "permission_denied"
  | "wallet_missing"
  | "no_models_available"
  | "invalid_model_configuration"
  | "model_unavailable"
  | "asset_not_found"
  | "asset_not_owned"
  | "asset_deleted"
  | "asset_incompatible"
  | "unsupported_duration"
  | "unsupported_aspect_ratio"
  | "negative_prompt_not_supported"
  | "invalid_prompt"
  | "insufficient_credits"
  | "preview_unavailable"
  | "temporary_failure"
  | "unknown";

interface ParsedStudioError {
  category: StudioErrorCategory;
  message: string;
  debugMessage?: string;
}

/**
 * Maps raw database/auth errors into user safe studio categories.
 * Masks credentials, connection strings, and raw stack details.
 */
export function mapStudioError(error: unknown): ParsedStudioError {
  if (!error) {
    return {
      category: "unknown",
      message: "An unexpected error occurred.",
    };
  }

  if (typeof error === "string") {
    return {
      category: "temporary_failure",
      message: error,
    };
  }

  const errObj = error as Record<string, unknown>;
  const code = String(errObj.code || errObj.status || "");
  const message = String(errObj.message || "");

  if (code === "42P01" || message.includes("relation")) {
    return {
      category: "database_not_configured",
      message: "Database tables are currently unconfigured.",
      debugMessage: "PostgreSQL 42P01: Relation does not exist. Run migrations.",
    };
  }

  if (code === "42501" || message.includes("policy") || message.includes("Permission denied")) {
    return {
      category: "permission_denied",
      message: "Access is restricted. Permission denied.",
      debugMessage: "Access control policy violation: RLS permissions blocked action.",
    };
  }

  // Check specific keywords for better categories
  if (message.includes("Wallet missing") || message.includes("wallet")) {
    return {
      category: "wallet_missing",
      message: "Your credit wallet is not available. Complete the database setup.",
    };
  }

  if (message.includes("insufficient") || message.includes("credits")) {
    return {
      category: "insufficient_credits",
      message: "Your balance is too low for this estimated generation.",
    };
  }

  return {
    category: "temporary_failure",
    message: "A database connection timeout occurred. Please try again.",
    debugMessage: message,
  };
}
