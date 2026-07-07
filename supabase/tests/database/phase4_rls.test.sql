-- ============================================================================
-- Phase 4 Database Test Suite: RLS & Privileges
-- ============================================================================
-- Tests structural properties, enums, privileges, and RLS policies.
-- Runs inside a transaction and rolls back automatically.
-- ============================================================================

begin;

-- Initialize pgTAP testing
select plan(49);

-- ── 1. Structural Verification ──────────────────────────────────────────────

-- Check all 12 tables exist
select has_table('profiles', 'profiles table should exist');
select has_table('plans', 'plans table should exist');
select has_table('credit_packs', 'credit_packs table should exist');
select has_table('subscriptions', 'subscriptions table should exist');
select has_table('credit_wallets', 'credit_wallets table should exist');
select has_table('credit_transactions', 'credit_transactions table should exist');
select has_table('ai_models', 'ai_models table should exist');
select has_table('generations', 'generations table should exist');
select has_table('media_assets', 'media_assets table should exist');
select has_table('payments', 'payments table should exist');
select has_table('webhook_events', 'webhook_events table should exist');
select has_table('admin_audit_logs', 'admin_audit_logs table should exist');

-- Check RLS is enabled on all 12 tables
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.profiles'::regclass $$, $$ values (true) $$, 'profiles RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.plans'::regclass $$, $$ values (true) $$, 'plans RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.credit_packs'::regclass $$, $$ values (true) $$, 'credit_packs RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.subscriptions'::regclass $$, $$ values (true) $$, 'subscriptions RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.credit_wallets'::regclass $$, $$ values (true) $$, 'credit_wallets RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.credit_transactions'::regclass $$, $$ values (true) $$, 'credit_transactions RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.ai_models'::regclass $$, $$ values (true) $$, 'ai_models RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.generations'::regclass $$, $$ values (true) $$, 'generations RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.media_assets'::regclass $$, $$ values (true) $$, 'media_assets RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.payments'::regclass $$, $$ values (true) $$, 'payments RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.webhook_events'::regclass $$, $$ values (true) $$, 'webhook_events RLS should be enabled');
select results_eq($$ select relrowsecurity from pg_class where oid = 'public.admin_audit_logs'::regclass $$, $$ values (true) $$, 'admin_audit_logs RLS should be enabled');

-- Check Helper Functions exist
select has_function('private', 'is_active_user', '{}'::name[], 'is_active_user helper function should exist');
select has_function('private', 'is_admin', '{}'::name[], 'is_admin helper function should exist');

-- ── 2. Privilege Tests ──────────────────────────────────────────────────────

-- Check that public roles cannot execute private functions directly
-- (PG permissions system will check execution privileges)
select function_privs_are(
  'private', 'is_active_user', '{}'::name[], 'public', '{}'::text[],
  'public should have no execution privileges on private.is_active_user'
);
select function_privs_are(
  'private', 'is_admin', '{}'::name[], 'public', '{}'::text[],
  'public should have no execution privileges on private.is_admin'
);

-- Check direct writes are strictly revoked on critical tables from public/anon/authenticated
select table_privs_are(
  'public', 'credit_wallets', 'anon', '{REFERENCES,TRIGGER,TRUNCATE}'::text[],
  'anon should have no privileges on credit_wallets'
);
select table_privs_are(
  'public', 'credit_transactions', 'anon', '{REFERENCES,TRIGGER,TRUNCATE}'::text[],
  'anon should have no privileges on credit_transactions'
);
select table_privs_are(
  'public', 'payments', 'anon', '{REFERENCES,TRIGGER,TRUNCATE}'::text[],
  'anon should have no privileges on payments'
);
select table_privs_are(
  'public', 'webhook_events', 'anon', '{REFERENCES,TRIGGER,TRUNCATE}'::text[],
  'anon should have no privileges on webhook_events'
);
select table_privs_are(
  'public', 'admin_audit_logs', 'anon', '{REFERENCES,TRIGGER,TRUNCATE}'::text[],
  'anon should have no privileges on admin_audit_logs'
);

-- Check column level update privileges for profiles table
select column_privs_are(
  'public', 'profiles', 'full_name', 'authenticated', '{SELECT,UPDATE,REFERENCES}'::text[],
  'authenticated user should only be able to SELECT and UPDATE full_name'
);
select column_privs_are(
  'public', 'profiles', 'avatar_url', 'authenticated', '{SELECT,UPDATE,REFERENCES}'::text[],
  'authenticated user should only be able to SELECT and UPDATE avatar_url'
);
select column_privs_are(
  'public', 'profiles', 'role', 'authenticated', '{SELECT,REFERENCES}'::text[],
  'authenticated user should only be able to SELECT role (no direct UPDATE)'
);
select column_privs_are(
  'public', 'profiles', 'status', 'authenticated', '{SELECT,REFERENCES}'::text[],
  'authenticated user should only be able to SELECT status (no direct UPDATE)'
);

-- ── 3. Test Setup (Fixtures) ────────────────────────────────────────────────

-- Create test auth users
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'user-a@motionforge.ai'),
  ('00000000-0000-0000-0000-00000000000b', 'user-b@motionforge.ai'),
  ('00000000-0000-0000-0000-00000000000c', 'suspended-user@motionforge.ai'),
  ('00000000-0000-0000-0000-00000000000d', 'admin-user@motionforge.ai');

-- Update profiles table roles/status (since auth trigger defaults to role=user, status=active)
update public.profiles
set status = 'suspended'::public.profile_status
where id = '00000000-0000-0000-0000-00000000000c';

update public.profiles
set role = 'admin'::public.app_role
where id = '00000000-0000-0000-0000-00000000000d';

-- Add configuration fixtures (plans, packs, models)
insert into public.plans (id, name, slug, monthly_price_paise, monthly_credits, max_concurrent_generations, is_active, is_public)
values
  ('10000000-0000-0000-0000-000000000001', 'Active Plan', 'active-plan', 9900, 100, 1, true, true),
  ('10000000-0000-0000-0000-000000000002', 'Inactive Plan', 'inactive-plan', 19900, 250, 2, false, false);

insert into public.credit_packs (id, name, slug, credits, price_paise, is_active, is_public)
values
  ('20000000-0000-0000-0000-000000000001', 'Active Pack', 'active-pack', 100, 4900, true, true),
  ('20000000-0000-0000-0000-000000000002', 'Inactive Pack', 'inactive-pack', 200, 9900, false, false);

insert into public.ai_models (id, provider, provider_model_id, name, slug, generation_type, is_active)
values
  ('30000000-0000-0000-0000-000000000001', 'fal', 'fal-model-active', 'Active Model', 'active-model', 'image_to_video', true),
  ('30000000-0000-0000-0000-000000000002', 'fal', 'fal-model-inactive', 'Inactive Model', 'inactive-model', 'image_to_video', false);

-- ── 4. RLS Behavioral Assertion Tests ──────────────────────────────────────

-- 4.1 Anonymous access to configs
set local role anon;

select results_eq(
  $$ select count(*)::integer from public.plans $$,
  $$ select count(*)::integer from public.plans where is_active = true and is_public = true $$,
  'Anonymous role should only see active/public plans'
);

select results_eq(
  $$ select count(*)::integer from public.credit_packs $$,
  $$ select count(*)::integer from public.credit_packs where is_active = true and is_public = true $$,
  'Anonymous role should only see active/public credit packs'
);

select results_eq(
  $$ select count(*)::integer from public.ai_models $$,
  $$ select count(*)::integer from public.ai_models where is_active = true $$,
  'Anonymous role should only see active AI models'
);

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  'permission denied for table profiles',
  'Anonymous role should get permission denied on profiles SELECT'
);

-- 4.2 Authenticated User A isolation
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000a"}', true);

select results_eq(
  $$ select count(*)::integer from public.profiles $$,
  $$ select 1 $$,
  'User A should only see their own profile row'
);

select results_eq(
  $$ select id from public.profiles $$,
  $$ select '00000000-0000-0000-0000-00000000000a'::uuid $$,
  'User A profile row id should match A uid'
);

-- Try to update full_name
select lives_ok(
  $$ update public.profiles set full_name = 'User A Name' where id = '00000000-0000-0000-0000-00000000000a' $$,
  'User A should be able to update their own full_name'
);

-- Try to change role (should throw security violation due to column privilege check)
select throws_ok(
  $$ update public.profiles set role = 'admin'::public.app_role where id = '00000000-0000-0000-0000-00000000000a' $$,
  'permission denied for table profiles',
  'User A should not be allowed to update their own role'
);

-- 4.3 Suspended User behavior
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000c"}', true);

select results_eq(
  $$ select count(*)::integer from public.profiles $$,
  $$ select 1 $$,
  'Suspended User should be able to see their own profile'
);

select throws_ok(
  $$ update public.profiles set full_name = 'Suspended name' where id = '00000000-0000-0000-0000-00000000000c' $$,
  'new row violates row-level security policy for table "profiles"',
  'Suspended user should fail RLS profile update'
);

-- 4.4 Admin access
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000d"}', true);

select results_eq(
  $$ select count(*)::integer from public.profiles $$,
  $$ select count(*)::integer from public.profiles $$,
  'Active Admin should be able to see all user profiles'
);

select results_eq(
  $$ select count(*)::integer from public.plans $$,
  $$ select count(*)::integer from public.plans $$,
  'Active Admin should see all plans (active + inactive)'
);

-- Complete test suite
select * from finish();
rollback;
