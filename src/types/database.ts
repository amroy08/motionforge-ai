/**
 * Supabase Database Type Definitions
 *
 * GENERATED MANUALLY from the Phase 3 migration SQL.
 *
 * When a local Supabase instance is available, regenerate with:
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * Or from the linked remote project:
 *   npx supabase gen types typescript --linked > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          target_user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          reason: string | null;
          before_data: Json | null;
          after_data: Json | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          target_user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          reason?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          target_user_id?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          action?: string;
          reason?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey";
            columns: ["admin_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_audit_logs_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_models: {
        Row: {
          id: string;
          provider: string;
          provider_model_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          generation_type: Database["public"]["Enums"]["generation_type"];
          base_credit_cost: number;
          credit_cost_per_second: number;
          supported_durations: number[];
          supported_aspect_ratios: string[];
          supports_image_input: boolean;
          supports_text_input: boolean;
          supports_negative_prompt: boolean;
          is_active: boolean;
          is_featured: boolean;
          configuration: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          provider_model_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          generation_type: Database["public"]["Enums"]["generation_type"];
          base_credit_cost?: number;
          credit_cost_per_second?: number;
          supported_durations?: number[];
          supported_aspect_ratios?: string[];
          supports_image_input?: boolean;
          supports_text_input?: boolean;
          supports_negative_prompt?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          configuration?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          provider_model_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          generation_type?: Database["public"]["Enums"]["generation_type"];
          base_credit_cost?: number;
          credit_cost_per_second?: number;
          supported_durations?: number[];
          supported_aspect_ratios?: string[];
          supports_image_input?: boolean;
          supports_text_input?: boolean;
          supports_negative_prompt?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          configuration?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_packs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          credits: number;
          price_paise: number;
          currency: string;
          is_active: boolean;
          is_public: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          credits: number;
          price_paise: number;
          currency?: string;
          is_active?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          credits?: number;
          price_paise?: number;
          currency?: string;
          is_active?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          generation_id: string | null;
          subscription_id: string | null;
          payment_id: string | null;
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"];
          amount: number;
          balance_before: number;
          balance_after: number;
          description: string | null;
          idempotency_key: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          generation_id?: string | null;
          subscription_id?: string | null;
          payment_id?: string | null;
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"];
          amount: number;
          balance_before: number;
          balance_after: number;
          description?: string | null;
          idempotency_key?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          generation_id?: string | null;
          subscription_id?: string | null;
          payment_id?: string | null;
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"];
          amount?: number;
          balance_before?: number;
          balance_after?: number;
          description?: string | null;
          idempotency_key?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "credit_wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          lifetime_purchased: number;
          lifetime_granted: number;
          lifetime_used: number;
          lifetime_refunded: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          lifetime_purchased?: number;
          lifetime_granted?: number;
          lifetime_used?: number;
          lifetime_refunded?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          lifetime_purchased?: number;
          lifetime_granted?: number;
          lifetime_used?: number;
          lifetime_refunded?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          model_id: string;
          provider: string;
          provider_request_id: string | null;
          idempotency_key: string | null;
          generation_type: Database["public"]["Enums"]["generation_type"];
          prompt: string | null;
          negative_prompt: string | null;
          duration_seconds: number | null;
          aspect_ratio: string | null;
          status: Database["public"]["Enums"]["generation_status"];
          progress: number;
          credits_charged: number;
          request_payload: Json;
          provider_response: Json;
          error_code: string | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          failed_at: string | null;
          cancelled_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id: string;
          provider: string;
          provider_request_id?: string | null;
          idempotency_key?: string | null;
          generation_type: Database["public"]["Enums"]["generation_type"];
          prompt?: string | null;
          negative_prompt?: string | null;
          duration_seconds?: number | null;
          aspect_ratio?: string | null;
          status?: Database["public"]["Enums"]["generation_status"];
          progress?: number;
          credits_charged?: number;
          request_payload?: Json;
          provider_response?: Json;
          error_code?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          failed_at?: string | null;
          cancelled_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string;
          provider?: string;
          provider_request_id?: string | null;
          idempotency_key?: string | null;
          generation_type?: Database["public"]["Enums"]["generation_type"];
          prompt?: string | null;
          negative_prompt?: string | null;
          duration_seconds?: number | null;
          aspect_ratio?: string | null;
          status?: Database["public"]["Enums"]["generation_status"];
          progress?: number;
          credits_charged?: number;
          request_payload?: Json;
          provider_response?: Json;
          error_code?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          failed_at?: string | null;
          cancelled_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generations_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "ai_models";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string;
          generation_id: string | null;
          asset_type: Database["public"]["Enums"]["media_asset_type"];
          storage_bucket: string;
          storage_path: string;
          original_filename: string | null;
          mime_type: string | null;
          file_size_bytes: number | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          checksum: string | null;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generation_id?: string | null;
          asset_type: Database["public"]["Enums"]["media_asset_type"];
          storage_bucket: string;
          storage_path: string;
          original_filename?: string | null;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          checksum?: string | null;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generation_id?: string | null;
          asset_type?: Database["public"]["Enums"]["media_asset_type"];
          storage_bucket?: string;
          storage_path?: string;
          original_filename?: string | null;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          checksum?: string | null;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          credit_pack_id: string | null;
          provider: string;
          provider_payment_id: string | null;
          provider_order_id: string | null;
          provider_signature_reference: string | null;
          amount_paise: number;
          currency: string;
          status: Database["public"]["Enums"]["payment_status"];
          payment_type: Database["public"]["Enums"]["payment_type"];
          refunded_amount_paise: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          credit_pack_id?: string | null;
          provider: string;
          provider_payment_id?: string | null;
          provider_order_id?: string | null;
          provider_signature_reference?: string | null;
          amount_paise: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_type: Database["public"]["Enums"]["payment_type"];
          refunded_amount_paise?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          credit_pack_id?: string | null;
          provider?: string;
          provider_payment_id?: string | null;
          provider_order_id?: string | null;
          provider_signature_reference?: string | null;
          amount_paise?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_type?: Database["public"]["Enums"]["payment_type"];
          refunded_amount_paise?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_credit_pack_id_fkey";
            columns: ["credit_pack_id"];
            isOneToOne: false;
            referencedRelation: "credit_packs";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          monthly_price_paise: number | null;
          yearly_price_paise: number | null;
          currency: string;
          monthly_credits: number;
          max_concurrent_generations: number;
          is_active: boolean;
          is_public: boolean;
          razorpay_monthly_plan_id: string | null;
          razorpay_yearly_plan_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          monthly_price_paise?: number | null;
          yearly_price_paise?: number | null;
          currency?: string;
          monthly_credits?: number;
          max_concurrent_generations?: number;
          is_active?: boolean;
          is_public?: boolean;
          razorpay_monthly_plan_id?: string | null;
          razorpay_yearly_plan_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          monthly_price_paise?: number | null;
          yearly_price_paise?: number | null;
          currency?: string;
          monthly_credits?: number;
          max_concurrent_generations?: number;
          is_active?: boolean;
          is_public?: boolean;
          razorpay_monthly_plan_id?: string | null;
          razorpay_yearly_plan_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["app_role"];
          status: Database["public"]["Enums"]["profile_status"];
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["profile_status"];
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["profile_status"];
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          provider: string;
          provider_subscription_id: string | null;
          provider_customer_id: string | null;
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          status: Database["public"]["Enums"]["subscription_status"];
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          provider: string;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          status?: Database["public"]["Enums"]["subscription_status"];
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"];
          status?: Database["public"]["Enums"]["subscription_status"];
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          provider_event_id: string | null;
          event_type: string;
          payload: Json;
          headers: Json;
          signature_verified: boolean | null;
          processing_status: Database["public"]["Enums"]["webhook_processing_status"];
          attempt_count: number;
          error_message: string | null;
          received_at: string;
          processing_started_at: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          provider_event_id?: string | null;
          event_type: string;
          payload?: Json;
          headers?: Json;
          signature_verified?: boolean | null;
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"];
          attempt_count?: number;
          error_message?: string | null;
          received_at?: string;
          processing_started_at?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          provider_event_id?: string | null;
          event_type?: string;
          payload?: Json;
          headers?: Json;
          signature_verified?: boolean | null;
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"];
          attempt_count?: number;
          error_message?: string | null;
          received_at?: string;
          processing_started_at?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "user" | "admin";
      billing_cycle: "monthly" | "yearly";
      credit_transaction_type:
        | "subscription_credit"
        | "credit_purchase"
        | "generation_debit"
        | "generation_refund"
        | "admin_adjustment"
        | "promotional_credit"
        | "expired_credit";
      generation_status:
        | "draft"
        | "queued"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled";
      generation_type:
        | "text_to_image"
        | "image_to_image"
        | "text_to_video"
        | "image_to_video";
      media_asset_type:
        | "input_image"
        | "generated_image"
        | "generated_video"
        | "thumbnail"
        | "avatar";
      payment_status:
        | "created"
        | "pending"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "cancelled";
      payment_type: "subscription" | "credit_pack";
      profile_status: "active" | "suspended" | "deleted";
      subscription_status:
        | "pending"
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "cancelled"
        | "expired";
      webhook_processing_status:
        | "received"
        | "processing"
        | "processed"
        | "failed"
        | "ignored";
    };
    CompositeTypes: Record<string, never>;
  };
};
