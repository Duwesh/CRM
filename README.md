# FirmEdge CRM — PV Advisory

A full-stack CRM built for Chartered Accountant and professional advisory firms. Manages clients, tasks, invoices, deadlines, engagements, team members, and more — with multi-tenant isolation enforced at the database level via Supabase Row Level Security.

**Production:** https://crm-jet-phi-83.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| UI Components | Radix UI, shadcn/ui, Lucide React, Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (`firm-assets` bucket) |
| PDF Generation | Supabase Edge Function (Deno + pdf-lib) |
| Deployment | Vercel (frontend) |

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | KPI cards (clients, tasks, leads, outstanding revenue), upcoming deadlines, overdue invoices, recent activity |
| **Clients** | Full CRUD, assigned manager, contact/service linking |
| **Tasks** | Create, assign to team members, link to clients, status tracking |
| **Leads** | Lead pipeline with status management |
| **Invoices** | Create invoices with GST, pagination, status tracking, PDF download |
| **Contacts** | Per-client contact directory |
| **Engagements** | Service engagement tracking per client |
| **Deadlines** | Compliance and filing deadline management |
| **Interactions** | Client interaction log with team member attribution |
| **Reminders** | Reminders with toggle-done functionality |
| **Document Vault** | Log and link external documents (Google Drive, etc.) |
| **Team Directory** | Firm member management with role-based access |
| **Fee Tracker** | Annual fee vs. invoiced vs. collected analysis per client |
| **Settings** | Firm profile, GSTIN, logo upload to Supabase Storage |
| **Notifications** | Activity feed (overdue tasks, paid invoices, upcoming deadlines, new interactions) |

---

## Architecture

### Direct Supabase Queries (No Backend Middleware)

All data is fetched directly from the frontend to Supabase. There is no Express/REST API in the request path. Each page imports from `src/lib/db/*` helper modules which call `supabase.from()` or `supabase.rpc()` directly.

```
Browser  →  Next.js Page  →  src/lib/db/*.js  →  Supabase (PostgreSQL + RLS)
```

### Multi-Tenancy via Row Level Security

Every table is scoped to a `firm_id`. RLS policies enforce that users can only read/write their own firm's data. This is handled entirely in PostgreSQL — no application-layer filtering needed.

The core helper function:

```sql
CREATE OR REPLACE FUNCTION get_my_firm_id()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT firm_id FROM "Tbl_Users"
  WHERE supabase_uid = auth.uid()::text
    AND is_deleted = false AND is_active = true LIMIT 1;
$$;
```

Tables without a direct `firm_id` (e.g. `Tbl_Contacts`, `Tbl_Documents`) use an indirect policy:

```sql
USING (client_id IN (SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()))
```

### Signup Flow (Chicken-and-Egg Fix)

During signup, `get_my_firm_id()` returns NULL because `Tbl_Users` doesn't exist yet. A `SECURITY DEFINER` RPC handles all three inserts atomically, bypassing RLS:

```
supabase.rpc("create_firm_and_user", { p_firm_name, p_firm_email, p_user_name })
  → INSERT Tbl_Firms
  → INSERT Tbl_Users (is_active: true, role: 'owner')
  → INSERT Tbl_InvoiceSequences
```

### Auth Guard

`Shell.jsx` wraps every protected page. On mount it calls `supabase.auth.getSession()` — if no session exists, it redirects to `/login` before rendering any content. It also subscribes to `onAuthStateChange` to catch sign-outs.

### PDF Generation

An Edge Function (`generate-invoice-pdf`) handles invoice PDFs:

1. Validates the caller owns the invoice via RLS (user's JWT)
2. Fetches full invoice + client + firm data via service role key
3. Builds an A4 PDF with `pdf-lib` (firm header, bill-to, line items, GST breakdown, balance due, status badge)
4. Returns `application/pdf` — frontend triggers browser download

---

## Database Schema

### Tables (17)

| Table | Key Columns |
|---|---|
| `Tbl_Firms` | `id`, `name`, `email`, `phone`, `address`, `reg_number`, `logo_url` |
| `Tbl_Users` | `id`, `supabase_uid`, `firm_id`, `name`, `email`, `role`, `is_active` |
| `Tbl_TeamMembers` | `id`, `firm_id`, `name`, `email`, `role`, `department`, `mobile` |
| `Tbl_Clients` | `id`, `firm_id`, `name`, `email`, `phone`, `type`, `annual_fee`, `manager_id` |
| `Tbl_ClientServices` | `id`, `client_id`, `service_name`, `status` |
| `Tbl_Contacts` | `id`, `client_id`, `name`, `email`, `phone`, `designation` |
| `Tbl_Leads` | `id`, `firm_id`, `name`, `email`, `source`, `status`, `value` |
| `Tbl_Tasks` | `id`, `firm_id`, `client_id`, `title`, `assigned_to`, `status`, `due_date` |
| `Tbl_Engagements` | `id`, `client_id`, `title`, `type`, `status`, `start_date`, `end_date` |
| `Tbl_Invoices` | `id`, `firm_id`, `client_id`, `invoice_number`, `amount`, `gst_amount`, `amount_received`, `status`, `due_date` |
| `Tbl_InvoiceSequences` | `id`, `firm_id`, `last_number` |
| `Tbl_Deadlines` | `id`, `firm_id`, `client_id`, `title`, `due_date`, `status` |
| `Tbl_Interactions` | `id`, `firm_id`, `client_id`, `team_member_id`, `interaction_type`, `summary`, `interaction_date` |
| `Tbl_Reminders` | `id`, `firm_id`, `title`, `due_date`, `is_done` |
| `Tbl_Documents` | `id`, `client_id`, `name`, `url`, `category`, `file_type` |
| `Tbl_InviteTokens` | `id`, `firm_id`, `token`, `email` |
| `Tbl_PasswordResetTokens` | `id`, `user_id`, `token`, `expires_at` |

### Postgres RPCs

| Function | Purpose |
|---|---|
| `get_my_firm_id()` | Returns current user's `firm_id` — used in all RLS policies |
| `is_firm_admin()` | Returns `true` if current user is `owner` or `admin` |
| `get_dashboard_summary()` | Returns stats + deadlines + invoices + activity in one call |
| `generate_invoice_number(p_firm_id)` | Atomically increments sequence, returns formatted invoice number |
| `create_firm_and_user(name, email, user_name)` | Signup RPC — SECURITY DEFINER, bypasses RLS |

---

## Project Structure

```
firmEdge/
├── frontend/                        # Next.js 14 app
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── tasks/
│   │   │   ├── leads/
│   │   │   ├── invoices/
│   │   │   ├── contacts/
│   │   │   ├── engagements/
│   │   │   ├── deadlines/
│   │   │   ├── interactions/
│   │   │   ├── reminders/
│   │   │   ├── documents/
│   │   │   ├── team/
│   │   │   ├── fees/
│   │   │   ├── settings/
│   │   │   ├── notifications/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── onboarding/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── auth/callback/
│   │   ├── components/
│   │   │   ├── Shell.jsx            # Layout + auth guard + sidebar
│   │   │   └── ui/                  # shadcn/ui components
│   │   └── lib/
│   │       ├── supabase.js          # Supabase client
│   │       └── db/                  # Data access layer
│   │           ├── auth.js          # signUp, getUserProfile, completeFirmSetup
│   │           ├── utils.js         # getFirmId() helper
│   │           ├── clients.js
│   │           ├── tasks.js
│   │           ├── leads.js
│   │           ├── invoices.js
│   │           ├── contacts.js
│   │           ├── engagements.js
│   │           ├── deadlines.js
│   │           ├── interactions.js
│   │           ├── reminders.js
│   │           ├── documents.js
│   │           ├── team.js
│   │           ├── fees.js
│   │           ├── settings.js
│   │           ├── notifications.js
│   │           └── pdf.js           # Edge function caller for invoice PDF
│   └── .env.local
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_enable_rls.sql       # RLS policies + helper functions
│   │   ├── 002_grant_authenticated.sql  # Table grants for authenticated role
│   │   └── 003_signup_rpc.sql       # create_firm_and_user() RPC
│   └── functions/
│       └── generate-invoice-pdf/
│           └── index.ts             # Deno edge function (pdf-lib)
│
└── backend/                         # Legacy Express API (no longer in active use)
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- A Supabase project

### 1. Clone and install

```bash
git clone <repo-url>
cd firmEdge/frontend
npm install
```

### 2. Environment variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Apply database migrations

Run each file in the Supabase SQL Editor (Dashboard → SQL Editor), in order:

```
supabase/migrations/001_enable_rls.sql
supabase/migrations/002_grant_authenticated.sql
supabase/migrations/003_signup_rpc.sql
```

> **Why manually?** The database tables were created by Sequelize. These migrations add RLS policies, table grants, and helper functions on top of the existing schema.

### 4. Supabase Auth settings

In your Supabase dashboard → Authentication → Providers:
- Disable email confirmation (the app handles its own onboarding flow)
- Optionally enable Google OAuth and set the redirect URL to `https://your-domain.com/auth/callback`

### 5. Supabase Storage

Create a public bucket named `firm-assets` for firm logo uploads:

```
Dashboard → Storage → New bucket → Name: firm-assets → Public: true
```

### 6. Deploy the Edge Function

```bash
supabase link --project-ref your-project-ref
supabase functions deploy generate-invoice-pdf
```

### 7. Run the dev server

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deployment (Vercel)

1. Push `frontend/` to GitHub
2. Import the repo in Vercel, set root directory to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Update the Google OAuth redirect URL in Supabase to the production domain after first deploy.

---

## Key Design Decisions

**No backend server** — The Express backend was removed. All queries go directly from the browser to Supabase using the anon key + RLS. The service role key is only used inside the Edge Function (server-side), never exposed to the browser.

**SECURITY DEFINER functions** — Helper functions like `get_my_firm_id()` and `create_firm_and_user()` are owned by `postgres` (superuser) and run outside RLS. This is intentional — they are the trusted core of the multi-tenancy model.

**Client-side data enrichment** — Supabase FK joins require explicit foreign key constraints in the schema. Since the schema was created by Sequelize without Supabase-aware FK declarations, related records (e.g. client name on a task) are fetched in parallel and merged client-side using ID maps.

**Invoice number atomicity** — `generate_invoice_number()` uses `UPDATE ... RETURNING` inside a transaction, making it safe under concurrent requests.
