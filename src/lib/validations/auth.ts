import { z } from "zod";

/**
 * Validate that a redirect path is a safe internal relative path.
 * Rejects external domains, protocol-relative paths, and mailto/javascript schemes.
 */
export function validateInternalPath(path: string | null | undefined): boolean {
  if (!path) return false;
  // Must start with / and not start with // (protocol-relative)
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  // Reject protocol schemes
  if (/^[a-z]+:/i.test(path)) return false;
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith("//") || /^[a-z]+:/i.test(decoded)) return false;
  } catch {
    return false;
  }
  return true;
}

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
  next: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateInternalPath(val),
      "Redirect path must be a safe internal relative URL"
    ),
});

/**
 * Registration Form Validation Schema
 */
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be less than 80 characters")
      .refine((val) => val.trim().length > 0, "Full name cannot be whitespace only"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirm_password: z.string().min(1, "Password confirmation is required"),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Resend Email Confirmation Schema
 */
export const resendConfirmationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
});
