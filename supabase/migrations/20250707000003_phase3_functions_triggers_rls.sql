-- ============================================================================
-- Phase 3 Migration 3: Functions, Triggers, RLS, and Privilege Revocations
-- ============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 1. Updated-at Trigger Function                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function private.set_updated_at() is 'Automatically sets updated_at to now() on row update.';

-- Apply updated_at triggers to all mutable tables
-- (NOT applied to append-only: credit_transactions, webhook_events, admin_audit_logs)

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger set_plans_updated_at
  before update on public.plans
  for each row execute function private.set_updated_at();

create trigger set_credit_packs_updated_at
  before update on public.credit_packs
  for each row execute function private.set_updated_at();

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();

create trigger set_credit_wallets_updated_at
  before update on public.credit_wallets
  for each row execute function private.set_updated_at();

create trigger set_ai_models_updated_at
  before update on public.ai_models
  for each row execute function private.set_updated_at();

create trigger set_generations_updated_at
  before update on public.generations
  for each row execute function private.set_updated_at();

create trigger set_media_assets_updated_at
  before update on public.media_assets
  for each row execute function private.set_updated_at();

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function private.set_updated_at();

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 2. New Auth User Trigger Function                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Creates a profile and credit wallet when a new user signs up.
-- Uses SECURITY DEFINER with an empty search_path for safety.
-- Does NOT grant welcome credits — that requires a ledger transaction (Phase 9).

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _full_name text;
begin
  -- Read the optional full name from user metadata
  _full_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');

  -- Create profile (conflict-safe for idempotency)
  insert into public.profiles (id, full_name, role, status)
  values (new.id, _full_name, 'user', 'active')
  on conflict (id) do nothing;

  -- Create zero-balance credit wallet (conflict-safe)
  insert into public.credit_wallets (user_id, balance, lifetime_purchased, lifetime_granted, lifetime_used, lifetime_refunded)
  values (new.id, 0, 0, 0, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function private.handle_new_auth_user() is
  'Triggered after auth.users INSERT. Creates profile and wallet. Does NOT grant welcome credits.';

-- Revoke execution from public roles — only the trigger system needs access
revoke execute on function private.handle_new_auth_user() from public;
revoke execute on function private.handle_new_auth_user() from anon;
revoke execute on function private.handle_new_auth_user() from authenticated;

-- Create the trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 3. Enable Row Level Security                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- RLS is enabled but NO user policies are created yet.
-- This means: deny-by-default for anon and authenticated roles.
-- The service_role key bypasses RLS and can still access all tables.
-- Phase 4 will create the actual access policies.

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.credit_packs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.ai_models enable row level security;
alter table public.generations enable row level security;
alter table public.media_assets enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.admin_audit_logs enable row level security;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 4. Revoke Unsafe Direct Writes on Critical Tables                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Even with RLS, explicitly revoke INSERT/UPDATE/DELETE on tables
-- that must only be modified through server-side RPC or service-role.
-- This does NOT affect service_role which bypasses these grants.

-- Credit wallets: balance modified only via server-side RPC
revoke insert, update, delete on public.credit_wallets from anon;
revoke insert, update, delete on public.credit_wallets from authenticated;

-- Credit transactions: append-only via server-side RPC
revoke insert, update, delete on public.credit_transactions from anon;
revoke insert, update, delete on public.credit_transactions from authenticated;

-- Payments: created and updated only via webhooks/server
revoke insert, update, delete on public.payments from anon;
revoke insert, update, delete on public.payments from authenticated;

-- Webhook events: written only by webhook handlers
revoke insert, update, delete on public.webhook_events from anon;
revoke insert, update, delete on public.webhook_events from authenticated;

-- Admin audit logs: written only by admin server actions
revoke insert, update, delete on public.admin_audit_logs from anon;
revoke insert, update, delete on public.admin_audit_logs from authenticated;
