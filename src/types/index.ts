/**
 * Shared TypeScript type definitions for the MotionForge AI platform.
 * Phase-specific types will be added as the project grows.
 */

/** User roles used throughout the application */
export type UserRole = "user" | "admin";

/** User account statuses */
export type UserStatus = "active" | "suspended" | "deleted";

/** Generation workflow statuses */
export type GenerationStatus =
  | "draft"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/** Payment statuses */
export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

/** Subscription statuses */
export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

/** Subscription billing cycles */
export type BillingCycle = "monthly" | "yearly";

/** Credit transaction types */
export type CreditTransactionType =
  | "subscription_credit"
  | "credit_purchase"
  | "generation_debit"
  | "generation_refund"
  | "admin_adjustment"
  | "promotional_credit"
  | "expired_credit";

/** Webhook processing statuses */
export type WebhookProcessingStatus =
  | "received"
  | "processing"
  | "processed"
  | "failed";

/** Media asset types */
export type MediaAssetType = "image" | "video";
