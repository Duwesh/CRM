# FirmEdge CRM — Complete Build & Deployment Plan

## Tech Stack (All Free Tier for Trial)

| Layer | Service | Free Limit |
|---|---|---|
| Frontend | Vercel | 100GB bandwidth/mo, custom domain |
| Backend | Railway | $5 credit/mo (~500MB RAM, always-on) |
| Database | Supabase (PostgreSQL) | 500MB, 50K MAU auth |
| File Storage | Cloudinary | 25GB, 25K transformations |
| Email | Resend | 3,000 emails/mo |
| Analytics | Posthog | 1M events/mo |
| Error tracking | Sentry | 5K errors/mo |
| DNS / Domain | Cloudflare | Free (get a cheap .in domain ~₹600/yr) |

---

## Folder Structure

```
firmEdge/
├── frontend/                      # Next.js 14 (App Router)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Sidebar + topbar shell
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── clients/
│   │   │   ├── contacts/
│   │   │   ├── leads/
│   │   │   ├── engagements/
│   │   │   ├── tasks/
│   │   │   ├── deadlines/
│   │   │   ├── invoices/
│   │   │   ├── interactions/
│   │   │   ├── reminders/
│   │   │   ├── documents/
│   │   │   ├── team/
│   │   │   └── settings/
│   │   └── api/                   # Next.js route handlers (proxy to backend)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Sidebar, Topbar, PageHeader
│   │   ├── modules/               # ClientTable, LeadKanban, etc.
│   │   └── shared/                # DataTable, Modal, ConfirmDialog
│   ├── lib/
│   │   ├── api.ts                 # Axios client with JWT interceptor
│   │   ├── auth.ts                # Auth helpers
│   │   └── utils.ts
│   └── types/                     # Shared TypeScript interfaces
│
├── backend/                       # Node.js + Express
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── db.ts              # Supabase/pg connection pool
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT verify + attach firm_id
│   │   │   ├── tenant.ts          # firm_id scope enforcement
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   ├── contacts.ts
│   │   │   ├── leads.ts
│   │   │   ├── engagements.ts
│   │   │   ├── tasks.ts
│   │   │   ├── deadlines.ts
│   │   │   ├── invoices.ts
│   │   │   ├── interactions.ts
│   │   │   ├── reminders.ts
│   │   │   ├── documents.ts
│   │   │   ├── team.ts
│   │   │   └── dashboard.ts
│   │   ├── services/
│   │   │   ├── emailService.ts    # Resend wrapper
│   │   │   ├── pdfService.ts      # Invoice PDF generation
│   │   │   ├── uploadService.ts   # Cloudinary upload
│   │   │   └── cronService.ts     # Daily reminder/deadline cron
│   │   └── utils/
│   └── migrations/                # SQL migration files
│
└── shared/
    └── types/                     # Shared TS types (optional)
```

---

## PostgreSQL Schema (Full SQL)

```sql
-- ============================================
-- FIRMS (one row per CA firm using the product)
-- ============================================
CREATE TABLE firms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(100),
  reg_number  VARCHAR(100),
  address     TEXT,
  phone       VARCHAR(20),
  email       VARCHAR(255),
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (login accounts, belong to a firm)
-- ============================================
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           VARCHAR(50) DEFAULT 'member',  -- 'owner', 'admin', 'member'
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_firm ON users(firm_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- TEAM MEMBERS (staff inside the CA firm)
-- ============================================
CREATE TABLE team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(100),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  specialization  VARCHAR(255),
  join_date       DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_team_firm ON team_members(firm_id);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id      UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  manager_id   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  name         VARCHAR(255) NOT NULL,
  type         VARCHAR(100),          -- 'Company (Pvt Ltd)', 'LLP', 'HUF', etc.
  pan          VARCHAR(20),
  gstin        VARCHAR(20),
  industry     VARCHAR(100),
  email        VARCHAR(255),
  phone        VARCHAR(20),
  status       VARCHAR(50) DEFAULT 'active',
  source       VARCHAR(100),
  since_year   INT,
  annual_fee   DECIMAL(12, 2),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_clients_firm ON clients(firm_id);
-- Full-text search index
CREATE INDEX idx_clients_search ON clients USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(pan,'') || ' ' || COALESCE(gstin,''))
);

-- ============================================
-- CLIENT SERVICES (many services per client)
-- ============================================
CREATE TABLE client_services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL
);
CREATE INDEX idx_csvc_client ON client_services(client_id);

-- ============================================
-- CONTACTS (people at client companies)
-- ============================================
CREATE TABLE contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  designation  VARCHAR(100),
  department   VARCHAR(100),
  mobile       VARCHAR(20),
  email        VARCHAR(255),
  whatsapp     VARCHAR(20),
  is_primary   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contacts_client ON contacts(client_id);

-- ============================================
-- LEADS (prospective clients)
-- ============================================
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id           UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  contact_person    VARCHAR(255),
  phone             VARCHAR(20),
  email             VARCHAR(255),
  services_interest TEXT,
  estimated_value   DECIMAL(12, 2),
  stage             VARCHAR(50) DEFAULT 'new',  -- new/contacted/meeting/proposal/won/lost
  source            VARCHAR(100),
  referred_by       VARCHAR(255),
  notes             TEXT,
  followup_date     DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leads_firm ON leads(firm_id);

-- ============================================
-- ENGAGEMENTS (work assigned to clients)
-- ============================================
CREATE TABLE engagements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to  UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  type         VARCHAR(100),          -- 'ITR Filing', 'GST Returns', etc.
  period       VARCHAR(100),          -- 'FY 2024-25'
  deadline     DATE,
  fees         DECIMAL(12, 2),
  status       VARCHAR(50) DEFAULT 'pending',  -- pending/active/completed/on-hold
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_eng_client ON engagements(client_id);
CREATE INDEX idx_eng_assigned ON engagements(assigned_to);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to    UUID REFERENCES team_members(id) ON DELETE SET NULL,
  engagement_id  UUID REFERENCES engagements(id) ON DELETE SET NULL,
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  due_date       DATE,
  priority       VARCHAR(20) DEFAULT 'medium',  -- low/medium/high
  status         VARCHAR(50) DEFAULT 'pending',  -- pending/wip/done
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_firm ON tasks(firm_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);

-- ============================================
-- DEADLINES (statutory compliance deadlines)
-- ============================================
CREATE TABLE deadlines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  category    VARCHAR(100),  -- GST / Income Tax / TDS / ROC / etc.
  due_date    DATE NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending',  -- pending/filed/extended/na
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deadlines_firm ON deadlines(firm_id);
CREATE INDEX idx_deadlines_date ON deadlines(due_date);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number   VARCHAR(50) UNIQUE NOT NULL,  -- INV-0001
  description      TEXT,
  invoice_date     DATE NOT NULL,
  due_date         DATE,
  amount           DECIMAL(12, 2) NOT NULL,
  gst_amount       DECIMAL(12, 2) DEFAULT 0,
  amount_received  DECIMAL(12, 2) DEFAULT 0,
  status           VARCHAR(50) DEFAULT 'unpaid',  -- unpaid/partial/paid
  pdf_url          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inv_client ON invoices(client_id);

-- Invoice number sequence per firm
CREATE TABLE invoice_sequences (
  firm_id     UUID PRIMARY KEY REFERENCES firms(id) ON DELETE CASCADE,
  last_number INT DEFAULT 0
);

-- ============================================
-- INTERACTIONS (client communication log)
-- ============================================
CREATE TABLE interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  team_member_id   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  contact_name     VARCHAR(255),
  interaction_type VARCHAR(100),  -- 'Phone Call', 'Meeting', 'Email', 'WhatsApp'
  interaction_date DATE NOT NULL,
  summary          TEXT,
  followup_date    DATE,
  action_required  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_int_client ON interactions(client_id);

-- ============================================
-- REMINDERS
-- ============================================
CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to     UUID REFERENCES team_members(id) ON DELETE SET NULL,
  reminder_text   TEXT NOT NULL,
  reminder_date   DATE NOT NULL,
  priority        VARCHAR(20) DEFAULT 'medium',
  is_done         BOOLEAN DEFAULT FALSE,
  email_sent      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rem_firm ON reminders(firm_id);
CREATE INDEX idx_rem_date ON reminders(reminder_date);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  file_url      TEXT NOT NULL,       -- Cloudinary URL
  file_type     VARCHAR(50),
  category      VARCHAR(100),        -- 'ITR', 'Audit Report', 'GST', etc.
  file_size_kb  INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_docs_client ON documents(client_id);
```

---

## API Routes Reference

```
Auth
  POST   /api/auth/register          Create firm + owner user
  POST   /api/auth/login             Returns JWT + refresh token
  POST   /api/auth/refresh           New access token
  POST   /api/auth/forgot-password   Email reset link
  POST   /api/auth/reset-password    Apply new password

Dashboard
  GET    /api/dashboard              Stats, upcoming deadlines, recent tasks

Clients
  GET    /api/clients                List (search, filter, paginate)
  POST   /api/clients                Create
  GET    /api/clients/:id            Single client with services
  PUT    /api/clients/:id            Update
  DELETE /api/clients/:id            Soft delete

Contacts
  GET    /api/clients/:id/contacts   List contacts for client
  POST   /api/contacts               Create
  PUT    /api/contacts/:id           Update
  DELETE /api/contacts/:id           Delete

Team
  GET    /api/team                   List team members
  POST   /api/team                   Add member
  PUT    /api/team/:id               Update
  DELETE /api/team/:id               Remove

Leads
  GET    /api/leads                  List (by stage)
  POST   /api/leads                  Create
  PUT    /api/leads/:id              Update (includes stage change)
  DELETE /api/leads/:id              Delete

Engagements
  GET    /api/engagements            List (filter by client, status)
  POST   /api/engagements            Create
  PUT    /api/engagements/:id        Update
  DELETE /api/engagements/:id        Delete

Tasks
  GET    /api/tasks                  List (filter by assigned, status, client)
  POST   /api/tasks                  Create
  PUT    /api/tasks/:id              Update (includes status drag-drop)
  DELETE /api/tasks/:id              Delete

Deadlines
  GET    /api/deadlines              List (filter by category, date range)
  POST   /api/deadlines              Create
  PUT    /api/deadlines/:id          Update status
  DELETE /api/deadlines/:id          Delete

Invoices
  GET    /api/invoices               List (filter by status, client)
  POST   /api/invoices               Create (auto-increments INV number)
  PUT    /api/invoices/:id           Update
  GET    /api/invoices/:id/pdf       Download PDF
  DELETE /api/invoices/:id           Delete

Interactions
  GET    /api/interactions           List (filter by client)
  POST   /api/interactions           Log new interaction
  PUT    /api/interactions/:id       Update
  DELETE /api/interactions/:id       Delete

Reminders
  GET    /api/reminders              List (filter by done/pending)
  POST   /api/reminders              Create
  PUT    /api/reminders/:id          Update / mark done
  DELETE /api/reminders/:id          Delete

Documents
  GET    /api/documents              List (filter by client, category)
  POST   /api/documents/upload       Multipart upload → Cloudinary → save record
  DELETE /api/documents/:id          Delete from Cloudinary + DB

Settings
  GET    /api/settings/firm          Get firm profile
  PUT    /api/settings/firm          Update firm profile + logo
  POST   /api/settings/invite        Generate invite link for new user
```

---

## Key Implementation Notes

### Multi-tenancy
Every table (except `firms`) has a `firm_id` column. The JWT middleware extracts `firm_id` from the token and every DB query appends `WHERE firm_id = $firmId`. Users from Firm A can never see Firm B's data.

### Trial invite flow
1. Owner registers → creates `firms` row + `users` row (role: owner)
2. Owner goes to Settings → Invite Team → generates a UUID invite token
3. Token stored in DB with `firm_id` and expiry
4. New user clicks link → registers → automatically joins that firm

### JWT structure
```json
{ "userId": "...", "firmId": "...", "role": "admin", "iat": ..., "exp": ... }
```

### Invoice numbering
Each firm has its own sequence in `invoice_sequences`. On creating an invoice: `UPDATE invoice_sequences SET last_number = last_number + 1 WHERE firm_id = $1 RETURNING last_number` → format as `INV-0001`.

### Cron job (Railway)
Daily at 8am IST: query reminders where `reminder_date = TODAY` and `is_done = false` and `email_sent = false` → send email via Resend → mark `email_sent = true`.

---

## Scale-Up Checklist (After Trial Validation)

When you've validated product-market fit:

| What | Free → Paid | Cost |
|---|---|---|
| Railway | Hobby → Pro | $20/mo |
| Supabase | Free → Pro | $25/mo |
| Cloudinary | Free → Plus | $89/mo |
| Add payments | — | Razorpay (2% per txn) |
| Subscription billing | — | Stripe or Razorpay subscriptions |
| Custom subdomain | firm.firmEdge.in | Cloudflare (free DNS) |

**Pricing model suggestion for SaaS:**
- ₹999/mo per firm (up to 3 users, 100 clients)
- ₹1,999/mo per firm (unlimited users + clients)
- 30-day free trial, no credit card required
