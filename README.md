# MotionForge AI

AI-powered image and video generation SaaS platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4, shadcn/ui (Base UI)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI Provider:** fal.ai
- **Payments:** Razorpay
- **Deployment:** Vercel-compatible

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### 1. Install Dependencies

```bash
cd motionforge-ai
npm install
```

### 2. Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

**Required for Phase 2:**

| Variable | Where to Find | Public? |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key | **No — server only** |

> ⚠️ **NEVER** commit `.env.local` to version control.
> ⚠️ **NEVER** prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
> ⚠️ The service-role key **bypasses Row Level Security** — keep it secret.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Verify Build

```bash
npm run lint
npm run build
```

## Supabase Configuration

### How It Works

The platform uses three different Supabase clients:

| Client | File | Key Used | Use Case |
|--------|------|----------|----------|
| **Browser** | `src/lib/supabase/client.ts` | `anon` key | Client Components — interactive UI |
| **Server** | `src/lib/supabase/server.ts` | `anon` key | Server Components, Server Actions, Route Handlers |
| **Admin** | `src/lib/supabase/admin.ts` | `service_role` key | Server-only admin operations (bypasses RLS) |

### Session Refresh (Proxy)

Next.js 16 uses `src/proxy.ts` (the new proxy convention, replacing the deprecated `middleware.ts`).

On every request, the proxy:
1. Reads auth cookies from the incoming request
2. Contacts Supabase Auth to verify/refresh the session via `auth.getUser()`
3. Writes updated cookies to both the request and response
4. Redirects unauthenticated users away from protected routes
5. Redirects authenticated users away from guest-only routes

**`auth.getUser()`** is used instead of `auth.getSession()` because `getUser()` contacts the Supabase Auth server and validates the JWT, while `getSession()` only reads unverified data from cookies.

### Protected Routes

| Route Prefix | Behavior |
|-------------|----------|
| `/dashboard`, `/admin` | Requires authentication → redirects to `/login` |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Guest-only → authenticated users redirect to `/dashboard` |
| `/`, `/auth/callback` | Public — no restrictions |

### Auth Callback

`/auth/callback` handles Supabase email verification and OAuth redirects. It:
- Exchanges the `code` parameter for a session
- Validates `next` parameter to prevent open redirects
- Redirects to `/dashboard` by default

### Session Verification (Dev Helper)

```
GET /api/auth/session
```

Returns:
```json
{ "authenticated": false, "user": null }
```

or when logged in:
```json
{ "authenticated": true, "user": { "id": "...", "email": "..." } }
```

Never returns tokens, cookies, or sensitive metadata.

### Testing Unauthenticated Behavior

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000` — landing page loads normally
3. Visit `http://localhost:3000/dashboard` — redirects to `/login?next=%2Fdashboard`
4. Visit `http://localhost:3000/admin` — redirects to `/login?next=%2Fadmin`
5. Visit `http://localhost:3000/login` — shows login placeholder
6. Visit `http://localhost:3000/api/auth/session` — returns `{ "authenticated": false, "user": null }`

### Security Notes

- The service-role key is only used in `src/lib/supabase/admin.ts`, which has `import "server-only"`
- The admin client is never used in the proxy layer
- Environment secrets are never logged or returned in API responses
- Redirect targets are validated against open-redirect attacks
- `auth.getUser()` is used for all authorization decisions (verified server-side)
- Cookie-based auth is managed by `@supabase/ssr` — no manual localStorage tokens

## Database Migrations & Seed

The database schema and configurations are managed using version-controlled migrations under `supabase/migrations/` and seed data under `supabase/seed.sql`.

### Local Migrations & Reset (Requires Docker)
If Docker is installed, you can start the local database, reset the schema, run the seeds, and generate TypeScript types using the following commands:
```bash
# Start local Supabase containers
npx supabase start

# Apply all migrations and execute seed.sql
npx supabase db reset

# Run database policy test suite
npx supabase test db

# Generate TypeScript types from local DB
npx supabase gen types typescript --local > src/types/database.ts
```

### Remote Deployments (Authorized Only)
To link your remote project and push migrations:
```bash
# Link your local CLI to the remote project
npx supabase link --project-ref <your-project-ref>

# Apply local migrations to the remote database
npx supabase db push

# Generate TypeScript types from remote DB
npx supabase gen types typescript --linked > src/types/database.ts
```
> ⚠️ **CRITICAL WARNING:** Never run `db reset` on a remote/production database. Never push migrations without code review.

## What's Next

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Setup | ✅ Complete |
| Phase 2 | Supabase Configuration | ✅ Complete |
| Phase 3 | Database Design & Schema | ✅ Complete |
| Phase 4 | Row Level Security & Authorization | ✅ Complete |
| Phase 5 | Email & Password Authentication | ✅ Complete |
| Phase 6–20 | Dashboard, Generation, Billing, Admin, etc. | 🔲 Pending |


## License

Proprietary — All rights reserved.
