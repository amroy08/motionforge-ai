export const routes = {
  // Marketing
  home: "/",
  pricing: "/#pricing",

  // Auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",

  // Dashboard
  dashboard: "/dashboard",
  create: "/dashboard/create",
  generations: "/dashboard/generations",
  generationDetail: (id: string) => `/dashboard/generations/${id}` as const,
  assets: "/dashboard/assets",
  billing: "/dashboard/billing",
  settings: "/dashboard/settings",

  // Admin
  admin: "/admin",
  adminUsers: "/admin/users",
  adminGenerations: "/admin/generations",
  adminModels: "/admin/models",
  adminPlans: "/admin/plans",
  adminSubscriptions: "/admin/subscriptions",
  adminPayments: "/admin/payments",
  adminWebhooks: "/admin/webhooks",

  // API
  apiGenerations: "/api/generations",
  apiGenerationDetail: (id: string) => `/api/generations/${id}` as const,
  apiWebhooksFal: "/api/webhooks/fal",
  apiWebhooksRazorpay: "/api/webhooks/razorpay",
  apiBillingCreateSubscription: "/api/billing/create-subscription",
  apiBillingCancelSubscription: "/api/billing/cancel-subscription",
  apiBillingCreateCreditOrder: "/api/billing/create-credit-order",
  apiBillingVerifyPayment: "/api/billing/verify-payment",
} as const;

// ── Route classification for the proxy ──────────────────

/**
 * Routes that require authentication.
 * Unauthenticated users are redirected to login.
 */
export const protectedPrefixes = [
  "/dashboard",
  "/admin",
] as const;

/**
 * Routes only accessible to unauthenticated users.
 * Authenticated users are redirected to the dashboard.
 */
export const guestOnlyPrefixes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/**
 * Routes that should never be intercepted by the proxy.
 */
export const publicPaths = [
  "/",
  "/auth/callback",
] as const;

/**
 * Default redirect after successful authentication.
 */
export const defaultLoginRedirect = "/dashboard" as const;
