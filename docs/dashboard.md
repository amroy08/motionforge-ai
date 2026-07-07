# Dashboard Architecture & Layout Design

This document details the route layout, server-side data fetching pipeline, and display components built in Phase 6.

---

## 1. Route Structure

All user-authenticated dashboard routes reside in the `(dashboard)` folder group:

```text
/dashboard        -> Overview metrics, activity summary, recent generations
/create           -> AI image-to-video studio settings configurations and validation workspace
/generations      -> History listing of created AI media (Placeholder)
/assets           -> View uploaded source image asset library cards
/billing          -> Plan subscriptions, credit levels, invoices (Placeholder)
/settings         -> Personal settings dashboard configurations (Placeholder)
```

---

## 2. Server & Client Component Boundaries

To optimize performance and security, files are scoped cleanly:

### Server Components (Default)
- **`DashboardLayout`**: Performs server-side authorization checkpoints and queries basic display details.
- **`DashboardPage`**: Executes server-side count aggregations and list queries for dashboard overview metrics.
- **Placeholder Pages**: Renders informational notices and locked studio previews.

### Client Components
- **`AppSidebar`**: Manages responsive collapses and route-active highlighting.
- **`DashboardHeader`**: Renders breadcrumb pathname segment strings.
- **`DashboardUserMenu`**: Drops down shortcut menus.
- **`EmptyState`**: Displays CTAs with client route triggers.
- **`DashboardError`**: Handles React error recovery boundaries.

---

## 3. Authorization Flow

1. The root layout calls `requireActiveUser(routes.dashboard)` before rendering layout wrappers.
2. It obtains the database user profile, checking that `status = 'active'`. Suspended or deleted credentials fail closed.
3. Minimal display credentials (email, name, role) are parsed and propagated to navigation panels. Secret access cookies are kept strictly server-side.

---

## 4. Dashboard Data Layer & Metric Calculations

- **`getDashboardOverview(userId)`**: A server-only helper executing query boundaries:
  - **Wallet Balance**: Fetches the balance from `credit_wallets` table.
  - **Subscription Plan**: Queries `subscriptions` joined with `plans` for `status` in trialing/active.
  - **Generation Counts**: Performs aggregate server counts excluding drafts and soft-deleted rows:
    - `total`: Count of all non-deleted generations.
    - `completed`: Status matching `completed`.
    - `processing`: Status matching `queued` or `processing`.
    - `failed`: Status matching `failed`.
  - **Recent Generations**: Limits outputs to 6 records sorting by `created_at DESC`.
  - **7-Day Activity**: Aggregates UTC creation timestamp frequencies into Mon-Sun columns.

---

## 5. Formatting & Fail-Closed Errors

- **Credit Formatting**: Zero credits display as `0 credits`, larger credits format with standard thousands separator (e.g. `1,250 credits`), integers only.
- **Postgres Fail-Safe**: Missing database tables (Postgres code `42P01`) due to pending migrations are caught by the overview data layer. The page degrades gracefully, showing a `ConfigurationWarning` alert for developers and safe fallback displays for users.

---

## 6. Phase 6 Limitations

- **AI Generation**: Mocked; no fal.ai integrations.
- **Asset Storage**: Mocked; no Supabase Storage buckets or uploads.
- **Billing Changes**: Mocked; no payment gateways or Razorpay checkouts.
- **Account Edits**: Mocked; name, email, and avatars are read-only.
