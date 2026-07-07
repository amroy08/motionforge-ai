import { z } from "zod";

/**
 * Public environment variables — available on client and server.
 * These are embedded into the JS bundle at build time, so they
 * must be prefixed with NEXT_PUBLIC_.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL is required. Set it in .env.local",
  }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, {
    message:
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required. Set it in .env.local",
  }),
});

/**
 * Server-only environment variables — never exposed to the browser.
 * Validation only runs when these values are actually accessed on the server.
 *
 * FAL_KEY and RAZORPAY keys are optional until their respective phases
 * are implemented. SUPABASE_SERVICE_ROLE_KEY is required for the admin
 * client but validated lazily (only when createAdminClient is called).
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: "SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local",
  }),
  FAL_KEY: z.string().optional(),
  FAL_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

// ── Cached instances ───────────────────────────────────
let cachedPublicEnv: PublicEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

/**
 * Get validated public environment variables.
 * Safe to call from both client and server.
 */
export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid public environment variables:\n${message}\n\nSee .env.example for required values.`,
    );
  }

  cachedPublicEnv = parsed.data;
  return cachedPublicEnv;
}

/**
 * Get validated server-only environment variables.
 * Throws if called from client-side code.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerEnv() must only be called on the server. " +
        "Never import server environment variables in client components.",
    );
  }

  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    FAL_KEY: process.env.FAL_KEY,
    FAL_WEBHOOK_SECRET: process.env.FAL_WEBHOOK_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid server environment variables:\n${message}\n\nSee .env.example for required values.`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}
