-- ============================================================
-- FirmEdge CRM - Full Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- FIRMS (one row per CA firm)
-- ============================================
CREATE TABLE IF NOT EXISTS firms (
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
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           VARCHAR(50) DEFAULT 'member',
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_firm  ON users(firm_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token      UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVITE TOKENS (for team onboarding)
-- ============================================
CREATE TABLE IF NOT EXISTS invite_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id    UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  token      UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, firm_id)
);

-- ============================================
-- TEAM MEMBERS (staff inside the CA firm)
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
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
CREATE INDEX IF NOT EXISTS idx_team_firm ON team_members(firm_id);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id      UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  manager_id   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  name         VARCHAR(255) NOT NULL,
  type         VARCHAR(100),
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
CREATE INDEX IF NOT EXISTS idx_clients_firm   ON clients(firm_id);
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(pan,'') || ' ' || COALESCE(gstin,''))
);

-- ============================================
-- CLIENT SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS client_services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_csvc_client ON client_services(client_id);

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
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
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id           UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  contact_person    VARCHAR(255),
  phone             VARCHAR(20),
  email             VARCHAR(255),
  services_interest TEXT,
  estimated_value   DECIMAL(12, 2),
  stage             VARCHAR(50) DEFAULT 'new',
  source            VARCHAR(100),
  referred_by       VARCHAR(255),
  notes             TEXT,
  followup_date     DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_firm ON leads(firm_id);

-- ============================================
-- ENGAGEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS engagements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to  UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  type         VARCHAR(100),
  period       VARCHAR(100),
  deadline     DATE,
  fees         DECIMAL(12, 2),
  status       VARCHAR(50) DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_eng_client   ON engagements(client_id);
CREATE INDEX IF NOT EXISTS idx_eng_assigned ON engagements(assigned_to);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to    UUID REFERENCES team_members(id) ON DELETE SET NULL,
  engagement_id  UUID REFERENCES engagements(id) ON DELETE SET NULL,
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  due_date       DATE,
  priority       VARCHAR(20) DEFAULT 'medium',
  status         VARCHAR(50) DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_firm   ON tasks(firm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);

-- ============================================
-- DEADLINES
-- ============================================
CREATE TABLE IF NOT EXISTS deadlines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  due_date    DATE NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deadlines_firm ON deadlines(firm_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(due_date);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number   VARCHAR(50) UNIQUE NOT NULL,
  description      TEXT,
  invoice_date     DATE NOT NULL,
  due_date         DATE,
  amount           DECIMAL(12, 2) NOT NULL,
  gst_amount       DECIMAL(12, 2) DEFAULT 0,
  amount_received  DECIMAL(12, 2) DEFAULT 0,
  status           VARCHAR(50) DEFAULT 'unpaid',
  pdf_url          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_client ON invoices(client_id);

-- Invoice number sequence per firm
CREATE TABLE IF NOT EXISTS invoice_sequences (
  firm_id     UUID PRIMARY KEY REFERENCES firms(id) ON DELETE CASCADE,
  last_number INT DEFAULT 0
);

-- ============================================
-- INTERACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  team_member_id   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  contact_name     VARCHAR(255),
  interaction_type VARCHAR(100),
  interaction_date DATE NOT NULL,
  summary          TEXT,
  followup_date    DATE,
  action_required  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_int_client ON interactions(client_id);

-- ============================================
-- REMINDERS
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
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
CREATE INDEX IF NOT EXISTS idx_rem_firm ON reminders(firm_id);
CREATE INDEX IF NOT EXISTS idx_rem_date ON reminders(reminder_date);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by   UUID REFERENCES team_members(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  file_url      TEXT NOT NULL,
  file_type     VARCHAR(50),
  category      VARCHAR(100),
  file_size_kb  INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_docs_client ON documents(client_id);
