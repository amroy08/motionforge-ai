-- ============================================================================
-- Phase 3 Migration 2: Core Application Tables
-- ============================================================================
-- Creates all application tables with constraints, foreign keys, and indexes.
-- Tables are ordered to satisfy foreign key dependencies.
-- ============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 1. profiles                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- One profile per auth.users row. Created automatically by trigger.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        public.app_role       not null default 'user',
  status      public.profile_status not null default 'active',
  deleted_at  timestamptz,
  created_at  timestamptz           not null default now(),
  updated_at  timestamptz           not null default now(),

  -- Constraints
  constraint profiles_full_name_length_check
    check (full_name is null or (char_length(trim(full_name)) between 1 and 200)),
  constraint profiles_avatar_url_length_check
    check (avatar_url is null or char_length(avatar_url) <= 2048)
);

comment on table public.profiles is 'User profile linked 1:1 to auth.users. Created by trigger on signup.';

create index idx_profiles_role_status on public.profiles (role, status);
create index idx_profiles_status_created on public.profiles (status, created_at desc);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 2. plans                                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.plans (
  id                          uuid primary key default gen_random_uuid(),
  name                        text             not null,
  slug                        text             not null,
  description                 text,
  monthly_price_paise         bigint,
  yearly_price_paise          bigint,
  currency                    text             not null default 'INR',
  monthly_credits             bigint           not null default 0,
  max_concurrent_generations  smallint         not null default 1,
  is_active                   boolean          not null default false,
  is_public                   boolean          not null default false,
  razorpay_monthly_plan_id    text,
  razorpay_yearly_plan_id     text,
  sort_order                  smallint         not null default 0,
  created_at                  timestamptz      not null default now(),
  updated_at                  timestamptz      not null default now(),

  -- Constraints
  constraint plans_slug_unique unique (slug),
  constraint plans_slug_format_check
    check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  constraint plans_name_length_check
    check (char_length(trim(name)) between 1 and 100),
  constraint plans_monthly_price_nonnegative_check
    check (monthly_price_paise is null or monthly_price_paise >= 0),
  constraint plans_yearly_price_nonnegative_check
    check (yearly_price_paise is null or yearly_price_paise >= 0),
  constraint plans_currency_format_check
    check (currency ~ '^[A-Z]{3}$'),
  constraint plans_monthly_credits_nonnegative_check
    check (monthly_credits >= 0),
  constraint plans_max_concurrent_check
    check (max_concurrent_generations >= 1)
);

comment on table public.plans is 'Subscription plans with credit allocations and Razorpay plan IDs.';

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 3. credit_packs                                                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.credit_packs (
  id          uuid primary key default gen_random_uuid(),
  name        text             not null,
  slug        text             not null,
  description text,
  credits     bigint           not null,
  price_paise bigint           not null,
  currency    text             not null default 'INR',
  is_active   boolean          not null default false,
  is_public   boolean          not null default false,
  sort_order  smallint         not null default 0,
  created_at  timestamptz      not null default now(),
  updated_at  timestamptz      not null default now(),

  constraint credit_packs_slug_unique unique (slug),
  constraint credit_packs_slug_format_check
    check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  constraint credit_packs_name_length_check
    check (char_length(trim(name)) between 1 and 100),
  constraint credit_packs_credits_positive_check
    check (credits > 0),
  constraint credit_packs_price_nonnegative_check
    check (price_paise >= 0),
  constraint credit_packs_currency_format_check
    check (currency ~ '^[A-Z]{3}$')
);

comment on table public.credit_packs is 'One-time credit purchase packages for Phase 14.';

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 4. credit_wallets                                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- One wallet per user. Created by trigger on signup.
create table public.credit_wallets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  balance           bigint      not null default 0,
  lifetime_purchased bigint     not null default 0,
  lifetime_granted  bigint      not null default 0,
  lifetime_used     bigint      not null default 0,
  lifetime_refunded bigint      not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint credit_wallets_user_unique unique (user_id),
  constraint credit_wallets_balance_nonnegative_check
    check (balance >= 0),
  constraint credit_wallets_lifetime_purchased_nonnegative_check
    check (lifetime_purchased >= 0),
  constraint credit_wallets_lifetime_granted_nonnegative_check
    check (lifetime_granted >= 0),
  constraint credit_wallets_lifetime_used_nonnegative_check
    check (lifetime_used >= 0),
  constraint credit_wallets_lifetime_refunded_nonnegative_check
    check (lifetime_refunded >= 0)
);

comment on table public.credit_wallets is 'Single credit wallet per user. Balance modified only via server-side RPC.';

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 5. subscriptions                                                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid                       not null references public.profiles(id) on delete restrict,
  plan_id                  uuid                       not null references public.plans(id) on delete restrict,
  provider                 text                       not null,
  provider_subscription_id text,
  provider_customer_id     text,
  billing_cycle            public.billing_cycle        not null,
  status                   public.subscription_status  not null default 'pending',
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean                    not null default false,
  cancelled_at             timestamptz,
  metadata                 jsonb                      not null default '{}'::jsonb,
  created_at               timestamptz                not null default now(),
  updated_at               timestamptz                not null default now(),

  constraint subscriptions_provider_length_check
    check (char_length(trim(provider)) between 1 and 50),
  constraint subscriptions_period_order_check
    check (
      current_period_start is null
      or current_period_end is null
      or current_period_end >= current_period_start
    )
);

comment on table public.subscriptions is 'User subscriptions linked to plans and payment providers.';

-- Only one "active" subscription per user at a time.
-- Active statuses: pending, trialing, active, past_due, paused.
create unique index idx_subscriptions_user_active
  on public.subscriptions (user_id)
  where status in ('pending', 'trialing', 'active', 'past_due', 'paused');

create index idx_subscriptions_user_status on public.subscriptions (user_id, status);
create index idx_subscriptions_plan on public.subscriptions (plan_id);
create index idx_subscriptions_period_end on public.subscriptions (current_period_end);

-- Provider subscription ID should be unique when present
create unique index idx_subscriptions_provider_sub_id
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 6. ai_models                                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.ai_models (
  id                      uuid primary key default gen_random_uuid(),
  provider                text                  not null,
  provider_model_id       text,
  name                    text                  not null,
  slug                    text                  not null,
  description             text,
  generation_type         public.generation_type not null,
  base_credit_cost        bigint                not null default 0,
  credit_cost_per_second  bigint                not null default 0,
  supported_durations     smallint[]            not null default '{}',
  supported_aspect_ratios text[]                not null default '{}',
  supports_image_input    boolean               not null default false,
  supports_text_input     boolean               not null default true,
  supports_negative_prompt boolean              not null default false,
  is_active               boolean               not null default false,
  is_featured             boolean               not null default false,
  configuration           jsonb                 not null default '{}'::jsonb,
  created_at              timestamptz           not null default now(),
  updated_at              timestamptz           not null default now(),

  constraint ai_models_slug_unique unique (slug),
  constraint ai_models_slug_format_check
    check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  constraint ai_models_name_length_check
    check (char_length(trim(name)) between 1 and 200),
  constraint ai_models_provider_length_check
    check (char_length(trim(provider)) between 1 and 50),
  constraint ai_models_base_cost_nonnegative_check
    check (base_credit_cost >= 0),
  constraint ai_models_cost_per_second_nonnegative_check
    check (credit_cost_per_second >= 0),
  -- An active model must have a provider model ID configured
  constraint ai_models_active_requires_provider_id_check
    check (is_active = false or (provider_model_id is not null and char_length(trim(provider_model_id)) > 0))
);

comment on table public.ai_models is 'AI model configurations. Provider-specific options go in the configuration jsonb column.';

create index idx_ai_models_generation_type_active on public.ai_models (generation_type, is_active);
create index idx_ai_models_featured_active on public.ai_models (is_featured, is_active);

create unique index idx_ai_models_provider_model_id
  on public.ai_models (provider, provider_model_id)
  where provider_model_id is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 7. generations                                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.generations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid                    not null references public.profiles(id) on delete restrict,
  model_id            uuid                    not null references public.ai_models(id) on delete restrict,
  provider            text                    not null,
  provider_request_id text,
  idempotency_key     text,
  generation_type     public.generation_type  not null,
  prompt              text,
  negative_prompt     text,
  duration_seconds    smallint,
  aspect_ratio        text,
  status              public.generation_status not null default 'draft',
  progress            smallint                not null default 0,
  credits_charged     bigint                  not null default 0,
  request_payload     jsonb                   not null default '{}'::jsonb,
  provider_response   jsonb                   not null default '{}'::jsonb,
  error_code          text,
  error_message       text,
  started_at          timestamptz,
  completed_at        timestamptz,
  failed_at           timestamptz,
  cancelled_at        timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz             not null default now(),
  updated_at          timestamptz             not null default now(),

  constraint generations_prompt_length_check
    check (prompt is null or char_length(prompt) <= 5000),
  constraint generations_negative_prompt_length_check
    check (negative_prompt is null or char_length(negative_prompt) <= 2000),
  constraint generations_progress_range_check
    check (progress between 0 and 100),
  constraint generations_credits_nonnegative_check
    check (credits_charged >= 0),
  constraint generations_duration_positive_check
    check (duration_seconds is null or duration_seconds > 0),
  constraint generations_provider_length_check
    check (char_length(trim(provider)) between 1 and 50)
);

comment on table public.generations is 'AI generation requests with status tracking and provider response data.';

create index idx_generations_user_created on public.generations (user_id, created_at desc);
create index idx_generations_user_status_created on public.generations (user_id, status, created_at desc);
create index idx_generations_model on public.generations (model_id);
create index idx_generations_status_created on public.generations (status, created_at);

create unique index idx_generations_provider_request_id
  on public.generations (provider, provider_request_id)
  where provider_request_id is not null;

create unique index idx_generations_user_idempotency
  on public.generations (user_id, idempotency_key)
  where idempotency_key is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 8. media_assets                                                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.media_assets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid                   not null references public.profiles(id) on delete restrict,
  generation_id     uuid                   references public.generations(id) on delete set null,
  asset_type        public.media_asset_type not null,
  storage_bucket    text                   not null,
  storage_path      text                   not null,
  original_filename text,
  mime_type         text,
  file_size_bytes   bigint,
  width             integer,
  height            integer,
  duration_seconds  numeric,
  checksum          text,
  metadata          jsonb                  not null default '{}'::jsonb,
  deleted_at        timestamptz,
  created_at        timestamptz            not null default now(),
  updated_at        timestamptz            not null default now(),

  constraint media_assets_storage_unique
    unique (storage_bucket, storage_path),
  constraint media_assets_bucket_length_check
    check (char_length(trim(storage_bucket)) between 1 and 100),
  constraint media_assets_path_length_check
    check (char_length(trim(storage_path)) between 1 and 1000),
  constraint media_assets_file_size_nonnegative_check
    check (file_size_bytes is null or file_size_bytes >= 0),
  constraint media_assets_width_positive_check
    check (width is null or width > 0),
  constraint media_assets_height_positive_check
    check (height is null or height > 0),
  constraint media_assets_duration_positive_check
    check (duration_seconds is null or duration_seconds > 0)
);

comment on table public.media_assets is 'Tracks files in Supabase Storage. Never stores signed URLs — generate on demand.';

create index idx_media_assets_user_created on public.media_assets (user_id, created_at desc);
create index idx_media_assets_user_type_created on public.media_assets (user_id, asset_type, created_at desc);
create index idx_media_assets_generation on public.media_assets (generation_id);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 9. payments                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.payments (
  id                           uuid primary key default gen_random_uuid(),
  user_id                      uuid                 not null references public.profiles(id) on delete restrict,
  subscription_id              uuid                 references public.subscriptions(id) on delete set null,
  credit_pack_id               uuid                 references public.credit_packs(id) on delete set null,
  provider                     text                 not null,
  provider_payment_id          text,
  provider_order_id            text,
  provider_signature_reference text,
  amount_paise                 bigint               not null,
  currency                     text                 not null default 'INR',
  status                       public.payment_status not null default 'created',
  payment_type                 public.payment_type   not null,
  refunded_amount_paise        bigint               not null default 0,
  metadata                     jsonb                not null default '{}'::jsonb,
  created_at                   timestamptz          not null default now(),
  updated_at                   timestamptz          not null default now(),

  constraint payments_provider_length_check
    check (char_length(trim(provider)) between 1 and 50),
  constraint payments_amount_nonnegative_check
    check (amount_paise >= 0),
  constraint payments_refund_nonnegative_check
    check (refunded_amount_paise >= 0),
  constraint payments_refund_not_above_amount_check
    check (refunded_amount_paise <= amount_paise),
  constraint payments_currency_format_check
    check (currency ~ '^[A-Z]{3}$')
);

comment on table public.payments is 'Payment records from Razorpay. Never store raw card details or secrets.';

create index idx_payments_user_created on public.payments (user_id, created_at desc);
create index idx_payments_subscription on public.payments (subscription_id);
create index idx_payments_credit_pack on public.payments (credit_pack_id);
create index idx_payments_status_created on public.payments (status, created_at);

create unique index idx_payments_provider_payment_id
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

create unique index idx_payments_provider_order_id
  on public.payments (provider, provider_order_id)
  where provider_order_id is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 10. credit_transactions (append-only ledger)                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.credit_transactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid                           not null references public.profiles(id) on delete restrict,
  wallet_id         uuid                           not null references public.credit_wallets(id) on delete restrict,
  generation_id     uuid                           references public.generations(id) on delete restrict,
  subscription_id   uuid                           references public.subscriptions(id) on delete set null,
  payment_id        uuid                           references public.payments(id) on delete restrict,
  transaction_type  public.credit_transaction_type  not null,
  amount            bigint                         not null,
  balance_before    bigint                         not null,
  balance_after     bigint                         not null,
  description       text,
  idempotency_key   text,
  metadata          jsonb                          not null default '{}'::jsonb,
  created_at        timestamptz                    not null default now(),

  -- No updated_at — append-only ledger
  constraint credit_transactions_amount_nonzero_check
    check (amount <> 0),
  constraint credit_transactions_balance_before_nonnegative_check
    check (balance_before >= 0),
  constraint credit_transactions_balance_after_nonnegative_check
    check (balance_after >= 0),
  constraint credit_transactions_balance_math_check
    check (balance_after = balance_before + amount),
  constraint credit_transactions_description_length_check
    check (description is null or char_length(description) <= 500)
);

comment on table public.credit_transactions is 'Immutable credit ledger. Every balance change is recorded with before/after snapshots.';

create index idx_credit_transactions_user_created on public.credit_transactions (user_id, created_at desc);
create index idx_credit_transactions_wallet_created on public.credit_transactions (wallet_id, created_at desc);
create index idx_credit_transactions_generation on public.credit_transactions (generation_id);
create index idx_credit_transactions_subscription on public.credit_transactions (subscription_id);
create index idx_credit_transactions_payment on public.credit_transactions (payment_id);

create unique index idx_credit_transactions_idempotency
  on public.credit_transactions (idempotency_key)
  where idempotency_key is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 11. webhook_events                                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.webhook_events (
  id                    uuid primary key default gen_random_uuid(),
  provider              text                            not null,
  provider_event_id     text,
  event_type            text                            not null,
  payload               jsonb                           not null default '{}'::jsonb,
  headers               jsonb                           not null default '{}'::jsonb,
  signature_verified    boolean,
  processing_status     public.webhook_processing_status not null default 'received',
  attempt_count         integer                         not null default 0,
  error_message         text,
  received_at           timestamptz                     not null default now(),
  processing_started_at timestamptz,
  processed_at          timestamptz,
  created_at            timestamptz                     not null default now(),

  -- No updated_at — append-only log
  constraint webhook_events_provider_length_check
    check (char_length(trim(provider)) between 1 and 50),
  constraint webhook_events_event_type_length_check
    check (char_length(trim(event_type)) between 1 and 200),
  constraint webhook_events_attempt_count_nonnegative_check
    check (attempt_count >= 0)
);

comment on table public.webhook_events is 'Webhook event log for idempotent processing. Do not store auth headers or secrets.';

create index idx_webhook_events_status_received on public.webhook_events (processing_status, received_at);

create unique index idx_webhook_events_provider_event_id
  on public.webhook_events (provider, provider_event_id)
  where provider_event_id is not null;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 12. admin_audit_logs (append-only)                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create table public.admin_audit_logs (
  id              uuid primary key default gen_random_uuid(),
  admin_user_id   uuid        not null references public.profiles(id) on delete restrict,
  target_user_id  uuid        references public.profiles(id) on delete set null,
  entity_type     text        not null,
  entity_id       uuid,
  action          text        not null,
  reason          text,
  before_data     jsonb,
  after_data      jsonb,
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),

  -- No updated_at — append-only
  constraint admin_audit_logs_entity_type_length_check
    check (char_length(trim(entity_type)) between 1 and 100),
  constraint admin_audit_logs_action_length_check
    check (char_length(trim(action)) between 1 and 100)
);

comment on table public.admin_audit_logs is 'Immutable admin action log for audit trail.';

create index idx_admin_audit_logs_admin_created on public.admin_audit_logs (admin_user_id, created_at desc);
create index idx_admin_audit_logs_target_created on public.admin_audit_logs (target_user_id, created_at desc);
create index idx_admin_audit_logs_entity on public.admin_audit_logs (entity_type, entity_id, created_at desc);
