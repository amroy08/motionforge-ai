import { validateInternalPath } from "../validations/auth";

/**
 * Validates a candidate redirect URL and returns a safe internal path.
 * If the candidate is invalid or external, returns the fallback path.
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string
): string {
  if (!candidate) return fallback;

  if (validateInternalPath(candidate)) {
    return candidate;
  }

  return fallback;
}
