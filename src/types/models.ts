/**
 * Application-Level Type Aliases
 *
 * Convenient type helpers derived from the generated Database type.
 * These provide clean imports for use throughout the application:
 *
 *   import type { Profile, Generation } from "@/types/models";
 */

import type { Database } from "./database";

// ── Table Row Types ─────────────────────────────────────────────────────────

/** Helper to extract a Row type from a public table name */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Helper to extract an Insert type from a public table name */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Helper to extract an Update type from a public table name */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Helper to extract an Enum type */
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// ── Commonly Used Row Aliases ───────────────────────────────────────────────

export type Profile = Tables<"profiles">;
export type Plan = Tables<"plans">;
export type CreditPack = Tables<"credit_packs">;
export type Subscription = Tables<"subscriptions">;
export type CreditWallet = Tables<"credit_wallets">;
export type CreditTransaction = Tables<"credit_transactions">;
export type AiModel = Tables<"ai_models">;
export type Generation = Tables<"generations">;
export type MediaAsset = Tables<"media_assets">;
export type Payment = Tables<"payments">;
export type WebhookEvent = Tables<"webhook_events">;
export type AdminAuditLog = Tables<"admin_audit_logs">;

// ── Enum Aliases ────────────────────────────────────────────────────────────

export type AppRole = Enums<"app_role">;
export type ProfileStatus = Enums<"profile_status">;
export type BillingCycle = Enums<"billing_cycle">;
export type SubscriptionStatus = Enums<"subscription_status">;
export type GenerationType = Enums<"generation_type">;
export type GenerationStatus = Enums<"generation_status">;
export type CreditTransactionType = Enums<"credit_transaction_type">;
export type MediaAssetType = Enums<"media_asset_type">;
export type PaymentStatus = Enums<"payment_status">;
export type PaymentType = Enums<"payment_type">;
export type WebhookProcessingStatus = Enums<"webhook_processing_status">;
