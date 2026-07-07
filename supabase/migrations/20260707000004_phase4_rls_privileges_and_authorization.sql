-- ============================================================================
-- Phase 4 Migration: Row Level Security, Privileges, and Authorization
-- ============================================================================
-- Creates authorization helper functions, grants minimal privileges to roles,
-- and defines strict Row Level Security (RLS) policies.
-- ============================================================================

-- ── 1. Authorization Helper Functions ───────────────────────────────────────

/**
 * Returns true if the currently authenticated user has an active profile.
 * Marked as SECURITY DEFINER to bypass RLS during status check.
 * Empty search_path is set for security to prevent hijack attacks.
 */
create or replace function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'::public.profile_status
  );
$$;

comment on function private.is_active_user() is
  'Checks if the currently authenticated user profile has status = active.';

/**
 * Returns true if the currently authenticated user is an active admin.
 * Marked as SECURITY DEFINER to bypass RLS.
 */
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.app_role
      and status = 'active'::public.profile_status
  );
$$;

comment on function private.is_admin() is
  'Checks if the currently authenticated user profile has role = admin and status = active.';

-- ── 2. Privilege Scoping ───────────────────────────────────────────────────

-- Revoke all default function execution from public
revoke all on function private.is_active_user() from public;
revoke all on function private.is_admin() from public;

-- Grant execution to the authenticated role for policy evaluation
grant usage on schema private to authenticated;
grant execute on function private.is_active_user() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Revoke all default table access from public (anon + authenticated)
revoke all on public.profiles from public;
revoke all on public.plans from public;
revoke all on public.credit_packs from public;
revoke all on public.subscriptions from public;
revoke all on public.credit_wallets from public;
revoke all on public.credit_transactions from public;
revoke all on public.ai_models from public;
revoke all on public.generations from public;
revoke all on public.media_assets from public;
revoke all on public.payments from public;
revoke all on public.webhook_events from public;
revoke all on public.admin_audit_logs from public;

-- Anonymous Role grants: SELECT on public configurations only
grant select on public.plans to anon;
grant select on public.credit_packs to anon;
grant select on public.ai_models to anon;

-- Authenticated Role grants: SELECT on operational tables
grant select on public.profiles to authenticated;
grant select on public.plans to authenticated;
grant select on public.credit_packs to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.credit_wallets to authenticated;
grant select on public.credit_transactions to authenticated;
grant select on public.ai_models to authenticated;
grant select on public.generations to authenticated;
grant select on public.media_assets to authenticated;
grant select on public.payments to authenticated;
grant select on public.admin_audit_logs to authenticated;

-- Column-level update grants for users to edit their own profiles
grant update (full_name, avatar_url)
on table public.profiles
to authenticated;

-- ── 3. Row Level Security Policies ──────────────────────────────────────────

-- 3.1 profiles policies
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (private.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id and private.is_active_user())
  with check (auth.uid() = id and private.is_active_user());

-- 3.2 plans policies
drop policy if exists plans_select_public on public.plans;
create policy plans_select_public on public.plans
  for select to anon, authenticated
  using (is_active = true and is_public = true);

drop policy if exists plans_select_admin on public.plans;
create policy plans_select_admin on public.plans
  for select to authenticated
  using (private.is_admin());

-- 3.3 credit_packs policies
drop policy if exists credit_packs_select_public on public.credit_packs;
create policy credit_packs_select_public on public.credit_packs
  for select to anon, authenticated
  using (is_active = true and is_public = true);

drop policy if exists credit_packs_select_admin on public.credit_packs;
create policy credit_packs_select_admin on public.credit_packs
  for select to authenticated
  using (private.is_admin());

-- 3.4 ai_models policies
drop policy if exists ai_models_select_public on public.ai_models;
create policy ai_models_select_public on public.ai_models
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists ai_models_select_admin on public.ai_models;
create policy ai_models_select_admin on public.ai_models
  for select to authenticated
  using (private.is_admin());

-- 3.5 subscriptions policies
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists subscriptions_select_admin on public.subscriptions;
create policy subscriptions_select_admin on public.subscriptions
  for select to authenticated
  using (private.is_admin());

-- 3.6 credit_wallets policies
drop policy if exists credit_wallets_select_own on public.credit_wallets;
create policy credit_wallets_select_own on public.credit_wallets
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists credit_wallets_select_admin on public.credit_wallets;
create policy credit_wallets_select_admin on public.credit_wallets
  for select to authenticated
  using (private.is_admin());

-- 3.7 credit_transactions policies
drop policy if exists credit_transactions_select_own on public.credit_transactions;
create policy credit_transactions_select_own on public.credit_transactions
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists credit_transactions_select_admin on public.credit_transactions;
create policy credit_transactions_select_admin on public.credit_transactions
  for select to authenticated
  using (private.is_admin());

-- 3.8 generations policies
drop policy if exists generations_select_own on public.generations;
create policy generations_select_own on public.generations
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists generations_select_admin on public.generations;
create policy generations_select_admin on public.generations
  for select to authenticated
  using (private.is_admin());

-- 3.9 media_assets policies
drop policy if exists media_assets_select_own on public.media_assets;
create policy media_assets_select_own on public.media_assets
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists media_assets_select_admin on public.media_assets;
create policy media_assets_select_admin on public.media_assets
  for select to authenticated
  using (private.is_admin());

-- 3.10 payments policies
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists payments_select_admin on public.payments;
create policy payments_select_admin on public.payments
  for select to authenticated
  using (private.is_admin());

-- 3.11 webhook_events policies
-- Webhook events contain raw payloads and headers with potential secrets.
-- To maintain maximum security, no direct SELECT is allowed for authenticated users or admins.
-- This remains service-role only.

-- 3.12 admin_audit_logs policies
drop policy if exists admin_audit_logs_select_admin on public.admin_audit_logs;
create policy admin_audit_logs_select_admin on public.admin_audit_logs
  for select to authenticated
  using (private.is_admin());
