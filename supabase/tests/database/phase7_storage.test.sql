-- ============================================================================
-- Phase 7 Database Test Suite: Storage & Security
-- ============================================================================
-- Tests private user-media bucket configuration and objects RLS policies.
-- Runs inside a transaction and rolls back automatically.
-- ============================================================================

begin;

-- Plan 12 assertions
select plan(12);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 1. Buckets Configuration Verification                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
select results_eq(
  $$ select count(*)::integer from storage.buckets where id = 'user-media' $$,
  $$ values (1) $$,
  'user-media bucket should be registered'
);

select results_eq(
  $$ select public from storage.buckets where id = 'user-media' $$,
  $$ values (false) $$,
  'user-media bucket should be private'
);

select results_eq(
  $$ select file_size_limit from storage.buckets where id = 'user-media' $$,
  $$ values (6291456::bigint) $$,
  'user-media bucket file size limit should be 6 MiB (6,291,456 bytes)'
);

select results_eq(
  $$ select allowed_mime_types from storage.buckets where id = 'user-media' $$,
  $$ values (array['image/jpeg', 'image/png', 'image/webp']::text[]) $$,
  'user-media bucket allowed MIME types should restrict to jpeg, png, and webp'
);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 2. Row Level Security on storage.objects                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
select row_policies_enabled('storage', 'objects', 'storage.objects RLS should be enabled');

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 3. Policy Existence & Separation Verification                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
select results_eq(
  $$ select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow active users to read their own media objects' $$,
  $$ values (1) $$,
  'The owner-isolated SELECT policy should exist'
);

select results_eq(
  $$ select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd = 'SELECT' $$,
  $$ values (1) $$,
  'Exactly one SELECT policy should exist on storage.objects'
);

select results_eq(
  $$ select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd = 'INSERT' $$,
  $$ values (0) $$,
  'No general INSERT policy should exist on storage.objects'
);

select results_eq(
  $$ select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd = 'UPDATE' $$,
  $$ values (0) $$,
  'No general UPDATE policy should exist on storage.objects'
);

select results_eq(
  $$ select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd = 'DELETE' $$,
  $$ values (0) $$,
  'No general DELETE policy should exist on storage.objects'
);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 4. Policy Roles and Constraints Verification                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
select results_eq(
  $$ select roles from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow active users to read their own media objects' $$,
  $$ values (array['authenticated']::name[]) $$,
  'SELECT policy should only target the authenticated role'
);

select results_eq(
  $$ select qual from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow active users to read their own media objects' $$,
  $$ select qual from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow active users to read their own media objects' $$,
  'Polices should contain conditions verifying is_active_user and folder uids'
);

select * from finish();
rollback;
