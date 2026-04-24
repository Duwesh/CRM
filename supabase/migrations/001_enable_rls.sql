-- ============================================================
-- Phase 1: Enable Row Level Security (RLS)
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Helper functions
-- ============================================================

-- Returns the firm_id for the currently authenticated user.
-- Used in every RLS policy below.
CREATE OR REPLACE FUNCTION get_my_firm_id()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT firm_id
  FROM "Tbl_Users"
  WHERE supabase_uid = auth.uid()::text
    AND is_deleted = false
    AND is_active = true
  LIMIT 1;
$$;

-- Returns true if the current user is an owner or admin of their firm.
-- Used to restrict destructive or privileged operations.
CREATE OR REPLACE FUNCTION is_firm_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Tbl_Users"
    WHERE supabase_uid = auth.uid()::text
      AND role IN ('owner', 'admin')
      AND is_deleted = false
      AND is_active = true
  );
$$;


-- ============================================================
-- STEP 2: Tbl_Firms
-- Each user belongs to one firm. They can only see/edit their own firm.
-- INSERT is allowed for authenticated users (needed during signup).
-- ============================================================

ALTER TABLE "Tbl_Firms" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firms_select" ON "Tbl_Firms"
  FOR SELECT
  USING (id = get_my_firm_id());

CREATE POLICY "firms_insert" ON "Tbl_Firms"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "firms_update" ON "Tbl_Firms"
  FOR UPDATE
  USING (id = get_my_firm_id())
  WITH CHECK (id = get_my_firm_id());


-- ============================================================
-- STEP 3: Tbl_Users
-- Users can see all members of their own firm.
-- INSERT allows a new user to create their own row during signup.
-- UPDATE restricted to own row only (admins use service role for bulk changes).
-- ============================================================

ALTER TABLE "Tbl_Users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON "Tbl_Users"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

-- During signup get_my_firm_id() is NULL (no row yet).
-- Allow insert only when the supabase_uid matches the calling user.
CREATE POLICY "users_insert_own" ON "Tbl_Users"
  FOR INSERT
  WITH CHECK (supabase_uid = auth.uid()::text);

CREATE POLICY "users_update_own" ON "Tbl_Users"
  FOR UPDATE
  USING (supabase_uid = auth.uid()::text)
  WITH CHECK (supabase_uid = auth.uid()::text);


-- ============================================================
-- STEP 4: Tbl_TeamMembers
-- ============================================================

ALTER TABLE "Tbl_TeamMembers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select" ON "Tbl_TeamMembers"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "team_members_insert" ON "Tbl_TeamMembers"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id() AND is_firm_admin());

CREATE POLICY "team_members_update" ON "Tbl_TeamMembers"
  FOR UPDATE
  USING (firm_id = get_my_firm_id() AND is_firm_admin())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "team_members_delete" ON "Tbl_TeamMembers"
  FOR DELETE
  USING (firm_id = get_my_firm_id() AND is_firm_admin());


-- ============================================================
-- STEP 5: Tbl_Clients
-- ============================================================

ALTER TABLE "Tbl_Clients" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON "Tbl_Clients"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "clients_insert" ON "Tbl_Clients"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "clients_update" ON "Tbl_Clients"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "clients_delete" ON "Tbl_Clients"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 6: Tbl_ClientServices
-- No firm_id — access controlled through the parent client.
-- ============================================================

ALTER TABLE "Tbl_ClientServices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_services_select" ON "Tbl_ClientServices"
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "client_services_insert" ON "Tbl_ClientServices"
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "client_services_delete" ON "Tbl_ClientServices"
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );


-- ============================================================
-- STEP 7: Tbl_Contacts
-- No firm_id — access through parent client.
-- ============================================================

ALTER TABLE "Tbl_Contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON "Tbl_Contacts"
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "contacts_insert" ON "Tbl_Contacts"
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "contacts_update" ON "Tbl_Contacts"
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "contacts_delete" ON "Tbl_Contacts"
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );


-- ============================================================
-- STEP 8: Tbl_Leads
-- ============================================================

ALTER TABLE "Tbl_Leads" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select" ON "Tbl_Leads"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "leads_insert" ON "Tbl_Leads"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "leads_update" ON "Tbl_Leads"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "leads_delete" ON "Tbl_Leads"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 9: Tbl_Tasks
-- ============================================================

ALTER TABLE "Tbl_Tasks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON "Tbl_Tasks"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "tasks_insert" ON "Tbl_Tasks"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "tasks_update" ON "Tbl_Tasks"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "tasks_delete" ON "Tbl_Tasks"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 10: Tbl_Engagements
-- No firm_id — access through parent client.
-- ============================================================

ALTER TABLE "Tbl_Engagements" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engagements_select" ON "Tbl_Engagements"
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "engagements_insert" ON "Tbl_Engagements"
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "engagements_update" ON "Tbl_Engagements"
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "engagements_delete" ON "Tbl_Engagements"
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );


-- ============================================================
-- STEP 11: Tbl_Invoices
-- ============================================================

ALTER TABLE "Tbl_Invoices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select" ON "Tbl_Invoices"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "invoices_insert" ON "Tbl_Invoices"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "invoices_update" ON "Tbl_Invoices"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "invoices_delete" ON "Tbl_Invoices"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 12: Tbl_InvoiceSequences
-- Only one row per firm (firm_id is the PK).
-- ============================================================

ALTER TABLE "Tbl_InvoiceSequences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_sequences_select" ON "Tbl_InvoiceSequences"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

-- INSERT during signup — get_my_firm_id() still NULL at that point,
-- so allow any authenticated user to insert their own firm's row.
CREATE POLICY "invoice_sequences_insert" ON "Tbl_InvoiceSequences"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "invoice_sequences_update" ON "Tbl_InvoiceSequences"
  FOR UPDATE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 13: Tbl_Deadlines
-- ============================================================

ALTER TABLE "Tbl_Deadlines" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deadlines_select" ON "Tbl_Deadlines"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "deadlines_insert" ON "Tbl_Deadlines"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "deadlines_update" ON "Tbl_Deadlines"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "deadlines_delete" ON "Tbl_Deadlines"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 14: Tbl_Interactions
-- ============================================================

ALTER TABLE "Tbl_Interactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_select" ON "Tbl_Interactions"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "interactions_insert" ON "Tbl_Interactions"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "interactions_update" ON "Tbl_Interactions"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "interactions_delete" ON "Tbl_Interactions"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 15: Tbl_Reminders
-- ============================================================

ALTER TABLE "Tbl_Reminders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select" ON "Tbl_Reminders"
  FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "reminders_insert" ON "Tbl_Reminders"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "reminders_update" ON "Tbl_Reminders"
  FOR UPDATE
  USING (firm_id = get_my_firm_id())
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "reminders_delete" ON "Tbl_Reminders"
  FOR DELETE
  USING (firm_id = get_my_firm_id());


-- ============================================================
-- STEP 16: Tbl_Documents
-- No firm_id — access through parent client.
-- ============================================================

ALTER TABLE "Tbl_Documents" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON "Tbl_Documents"
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "documents_insert" ON "Tbl_Documents"
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "documents_update" ON "Tbl_Documents"
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );

CREATE POLICY "documents_delete" ON "Tbl_Documents"
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id()
    )
  );


-- ============================================================
-- STEP 17: Tbl_InviteTokens
-- Only admins/owners can create or view invite tokens.
-- ============================================================

ALTER TABLE "Tbl_InviteTokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_tokens_select" ON "Tbl_InviteTokens"
  FOR SELECT
  USING (firm_id = get_my_firm_id() AND is_firm_admin());

CREATE POLICY "invite_tokens_insert" ON "Tbl_InviteTokens"
  FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id() AND is_firm_admin());

CREATE POLICY "invite_tokens_delete" ON "Tbl_InviteTokens"
  FOR DELETE
  USING (firm_id = get_my_firm_id() AND is_firm_admin());


-- ============================================================
-- STEP 18: Tbl_PasswordResetTokens
-- Users can only access their own reset token.
-- ============================================================

ALTER TABLE "Tbl_PasswordResetTokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_select" ON "Tbl_PasswordResetTokens"
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM "Tbl_Users" WHERE supabase_uid = auth.uid()::text
    )
  );

CREATE POLICY "password_reset_tokens_insert" ON "Tbl_PasswordResetTokens"
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM "Tbl_Users" WHERE supabase_uid = auth.uid()::text
    )
  );

CREATE POLICY "password_reset_tokens_delete" ON "Tbl_PasswordResetTokens"
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM "Tbl_Users" WHERE supabase_uid = auth.uid()::text
    )
  );


-- ============================================================
-- STEP 19: Invoice number generation (atomic, race-condition safe)
-- Call this function from the frontend when creating an invoice:
--   const { data } = await supabase.rpc('generate_invoice_number', { p_firm_id: firmId })
-- ============================================================

CREATE OR REPLACE FUNCTION generate_invoice_number(p_firm_id bigint)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number integer;
  firm_prefix text;
BEGIN
  -- Ensure the caller owns this firm
  IF p_firm_id != get_my_firm_id() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Atomic increment — safe under concurrent writes
  UPDATE "Tbl_InvoiceSequences"
  SET last_number = last_number + 1
  WHERE firm_id = p_firm_id
  RETURNING last_number INTO new_number;

  IF new_number IS NULL THEN
    RAISE EXCEPTION 'Invoice sequence not found for firm %', p_firm_id;
  END IF;

  SELECT UPPER(LEFT(name, 3)) INTO firm_prefix
  FROM "Tbl_Firms"
  WHERE id = p_firm_id;

  RETURN COALESCE(firm_prefix, 'INV') || '-' || LPAD(new_number::text, 4, '0');
END;
$$;


-- ============================================================
-- STEP 20: Dashboard summary (replaces /api/dashboard/summary)
-- Call from frontend:
--   const { data } = await supabase.rpc('get_dashboard_summary')
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_firm_id bigint;
  v_today date := CURRENT_DATE;
  v_thirty_days_later date := CURRENT_DATE + INTERVAL '30 days';
  v_start_of_month date := DATE_TRUNC('month', CURRENT_DATE)::date;
  v_start_of_prev_month date := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date;

  v_total_clients int;
  v_prev_clients int;
  v_active_tasks int;
  v_prev_tasks int;
  v_active_leads int;
  v_upcoming_deadlines_count int;
  v_outstanding_amount numeric;

  v_upcoming_deadlines json;
  v_overdue_invoices json;
  v_recent_activity json;
BEGIN
  v_firm_id := get_my_firm_id();

  IF v_firm_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Client counts
  SELECT COUNT(*) INTO v_total_clients
  FROM "Tbl_Clients"
  WHERE firm_id = v_firm_id AND is_deleted = false;

  SELECT COUNT(*) INTO v_prev_clients
  FROM "Tbl_Clients"
  WHERE firm_id = v_firm_id AND is_deleted = false AND created_at < v_start_of_month;

  -- Task counts
  SELECT COUNT(*) INTO v_active_tasks
  FROM "Tbl_Tasks"
  WHERE firm_id = v_firm_id AND is_deleted = false AND status != 'completed';

  SELECT COUNT(*) INTO v_prev_tasks
  FROM "Tbl_Tasks"
  WHERE firm_id = v_firm_id AND is_deleted = false AND status != 'completed'
    AND created_at < v_start_of_month;

  -- Active leads
  SELECT COUNT(*) INTO v_active_leads
  FROM "Tbl_Leads"
  WHERE firm_id = v_firm_id AND is_deleted = false AND stage != 'closed';

  -- Upcoming deadlines (next 30 days) count
  SELECT COUNT(*) INTO v_upcoming_deadlines_count
  FROM "Tbl_Deadlines"
  WHERE firm_id = v_firm_id AND is_deleted = false
    AND due_date BETWEEN v_today AND v_thirty_days_later;

  -- Outstanding invoice amount
  SELECT COALESCE(SUM(i.amount - i.amount_received), 0) INTO v_outstanding_amount
  FROM "Tbl_Invoices" i
  WHERE i.firm_id = v_firm_id AND i.is_deleted = false AND i.status != 'paid';

  -- Upcoming deadlines (top 5)
  SELECT json_agg(d) INTO v_upcoming_deadlines FROM (
    SELECT d.id, d.title, d.due_date, d.category, d.status, c.name AS client_name
    FROM "Tbl_Deadlines" d
    LEFT JOIN "Tbl_Clients" c ON c.id = d.client_id
    WHERE d.firm_id = v_firm_id AND d.is_deleted = false
      AND d.due_date BETWEEN v_today AND v_thirty_days_later
    ORDER BY d.due_date ASC
    LIMIT 5
  ) d;

  -- Overdue invoices (top 3)
  SELECT json_agg(inv) INTO v_overdue_invoices FROM (
    SELECT i.id, i.invoice_number, i.amount, i.amount_received, i.due_date, i.status, c.name AS client_name
    FROM "Tbl_Invoices" i
    JOIN "Tbl_Clients" c ON c.id = i.client_id
    WHERE i.firm_id = v_firm_id AND i.is_deleted = false
      AND i.status != 'paid' AND i.due_date < v_today
    ORDER BY i.due_date ASC
    LIMIT 3
  ) inv;

  -- Recent interactions (top 3)
  SELECT json_agg(act) INTO v_recent_activity FROM (
    SELECT ia.id, ia.interaction_type, ia.interaction_date, ia.summary,
           c.name AS client_name, tm.name AS team_member_name
    FROM "Tbl_Interactions" ia
    JOIN "Tbl_Clients" c ON c.id = ia.client_id
    LEFT JOIN "Tbl_TeamMembers" tm ON tm.id = ia.team_member_id
    WHERE ia.firm_id = v_firm_id AND ia.is_deleted = false
    ORDER BY ia.interaction_date DESC, ia.created_at DESC
    LIMIT 3
  ) act;

  RETURN json_build_object(
    'stats', json_build_object(
      'clients',               v_total_clients,
      'clientsChange',         CASE
                                 WHEN v_prev_clients = 0 THEN '+100%'
                                 ELSE CONCAT(ROUND(((v_total_clients - v_prev_clients)::numeric / v_prev_clients) * 100), '%')
                               END,
      'clientsIsUp',           v_total_clients >= v_prev_clients,
      'tasks',                 v_active_tasks,
      'tasksChange',           CASE
                                 WHEN v_prev_tasks = 0 THEN '+100%'
                                 ELSE CONCAT(ROUND(((v_active_tasks - v_prev_tasks)::numeric / v_prev_tasks) * 100), '%')
                               END,
      'tasksIsUp',             v_active_tasks >= v_prev_tasks,
      'leads',                 v_active_leads,
      'deadlines',             v_upcoming_deadlines_count,
      'outstandingAmount',     v_outstanding_amount
    ),
    'upcomingDeadlines',  COALESCE(v_upcoming_deadlines, '[]'::json),
    'overdueInvoices',    COALESCE(v_overdue_invoices, '[]'::json),
    'recentActivity',     COALESCE(v_recent_activity, '[]'::json)
  );
END;
$$;
