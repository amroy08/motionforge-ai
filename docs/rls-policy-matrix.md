# Row Level Security (RLS) Policy Matrix

This document outlines the Row Level Security (RLS) policies and privilege structures configured for the 12 application tables in MotionForge AI.

---

## 1. RLS Policy Matrix

All policies use the `TO` clause to target specific roles (`anon`, `authenticated`). If no policy matches a role, access defaults to **DENY**.

| Table | Role | SELECT | INSERT | UPDATE | DELETE | Row Condition / Column Restrictions |
|---|---|---|---|---|---|---|
| **profiles** | `authenticated` | Own / Admin | Deny | Own | Deny | `SELECT`: `auth.uid() = id OR is_admin()` <br> `UPDATE`: `auth.uid() = id AND is_active_user()` <br> **Column Restriction**: Can only update `full_name`, `avatar_url` |
| **plans** | `anon`, `authenticated` | Public / Admin | Deny | Deny | Deny | `SELECT`: `(is_active = true AND is_public = true) OR is_admin()` |
| **credit_packs** | `anon`, `authenticated` | Public / Admin | Deny | Deny | Deny | `SELECT`: `(is_active = true AND is_public = true) OR is_admin()` |
| **ai_models** | `anon`, `authenticated` | Active / Admin | Deny | Deny | Deny | `SELECT`: `is_active = true OR is_admin()` |
| **subscriptions** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` |
| **credit_wallets** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` <br> Balance modified only via backend RPC |
| **credit_transactions** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` <br> Append-only database ledger |
| **generations** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` <br> Creation done via backend actions |
| **media_assets** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` |
| **payments** | `authenticated` | Own / Admin | Deny | Deny | Deny | `SELECT`: `(user_id = auth.uid() AND is_active_user()) OR is_admin()` |
| **webhook_events** | — | Deny | Deny | Deny | Deny | **Service Role Only** (contains raw payload / headers with signature values/secrets) |
| **admin_audit_logs** | `authenticated` | Admin | Deny | Deny | Deny | `SELECT`: `is_admin()` |

---

## 2. Security Roles & Authorization Principles

### 2.1 Database Roles vs. Table Privileges
We use the database privileges (grants/revokes) as the first layer of defense, followed by RLS.
- **`anon` role**: Granted `SELECT` only on configuration tables (`plans`, `credit_packs`, `ai_models`). No write permissions.
- **`authenticated` role**: Granted `SELECT` on operational data. Direct `INSERT`, `UPDATE`, and `DELETE` privileges are strictly revoked from most tables to protect balance adjustments, subscription creation, and generation costs. Users edit profiles via column-level update grants (`full_name` and `avatar_url` only).
- **`service_role`**: Bypasses RLS and column-level privileges entirely to perform administrative backend transactions (ledger entries, payment reconciliations, profile creation via signup triggers).

### 2.2 Suspended and Inactive Account Rules
- **Suspended Users**: Can authenticate and read their own `profiles` row (to display account state and suspension reasons). They lose all privileges to view wallets, subscriptions, payments, generations, media assets, or transactions. They are redirected out of `/dashboard` and `/admin` routes.
- **Deleted Users**: Blocked from all authenticated tables.

### 2.3 Admin Authorization
Admins are authorized based on database values (`profiles.role = 'admin'` and `profiles.status = 'active'`). Frontend states, cookies, or JWT metadata (except the user ID) are never trusted.

### 2.4 Webhook Event Visibility
`webhook_events` has no public or admin RLS policies. It contains sensitive webhook signatures and raw headers. The administrative frontend will query a sanitized server endpoint that filters out credentials.

### 2.5 Storage RLS
Storage buckets are managed under the `storage` schema.
- **`user-media` bucket**: A private bucket with RLS enabled on the `storage.objects` table.
- **SELECT Policy**: Active authenticated users can select objects matching their uid prefix directory: `bucket_id = 'user-media' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = (auth.uid())::text AND (storage.foldername(name))[3] IN ('temporary', 'inputs') AND private.is_active_user() = true`.
- **INSERT / UPDATE / DELETE Policies**: Revoked for all authenticated and anonymous browser roles. Writes are authorized via signed upload URLs, and moves/removals are performed server-side via the service-role client.
- **Anonymous Access**: Completely denied.

---

## 3. Helper Functions

Configured under the `private` schema to restrict direct API access:

- `private.is_active_user()`
  Checks if the current `auth.uid()` belongs to a profile with `status = 'active'`. Defined as `security definer` with `set search_path = ''`.
- `private.is_admin()`
  Checks if the current `auth.uid()` has `role = 'admin'` and `status = 'active'`.

---

## 4. Verification and Local Testing Status

- **Docker/Local Test Status**: *Pending* (Docker daemon was not available during current execution).
- **Validation commands (run when Docker is installed)**:
  ```bash
  # Start local containers
  npx supabase start
  
  # Run structural and behavioral assertions
  npx supabase test db
  ```
- **Provisional Types**: Current types in `src/types/database.ts` are manually aligned. They must be regenerated via the Supabase CLI generator once local containers run:
  ```bash
  npx supabase gen types typescript --local > src/types/database.ts
  ```
