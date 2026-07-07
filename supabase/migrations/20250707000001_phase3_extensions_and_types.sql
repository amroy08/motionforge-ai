-- ============================================================================
-- Phase 3 Migration 1: Extensions, Schemas, and Domain Types
-- ============================================================================
-- Creates PostgreSQL extensions, the private schema for internal functions,
-- and all application enum types.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
-- pgcrypto is used for gen_random_uuid() in primary key defaults.
create extension if not exists pgcrypto with schema extensions;

-- ── Private Schema ──────────────────────────────────────────────────────────
-- Internal database functions live here, away from the public Data API.
create schema if not exists private;

-- Revoke default public access to the private schema.
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

-- ── Enum Types ──────────────────────────────────────────────────────────────

-- User roles
create type public.app_role as enum ('user', 'admin');

-- Profile account status
create type public.profile_status as enum ('active', 'suspended', 'deleted');

-- Subscription billing cycle
create type public.billing_cycle as enum ('monthly', 'yearly');

-- Subscription status
create type public.subscription_status as enum (
  'pending',
  'trialing',
  'active',
  'past_due',
  'paused',
  'cancelled',
  'expired'
);

-- AI generation types
create type public.generation_type as enum (
  'text_to_image',
  'image_to_image',
  'text_to_video',
  'image_to_video'
);

-- Generation workflow status
create type public.generation_status as enum (
  'draft',
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Credit transaction types
create type public.credit_transaction_type as enum (
  'subscription_credit',
  'credit_purchase',
  'generation_debit',
  'generation_refund',
  'admin_adjustment',
  'promotional_credit',
  'expired_credit'
);

-- Media asset types
create type public.media_asset_type as enum (
  'input_image',
  'generated_image',
  'generated_video',
  'thumbnail',
  'avatar'
);

-- Payment status
create type public.payment_status as enum (
  'created',
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled'
);

-- Payment type
create type public.payment_type as enum (
  'subscription',
  'credit_pack'
);

-- Webhook processing status
create type public.webhook_processing_status as enum (
  'received',
  'processing',
  'processed',
  'failed',
  'ignored'
);
