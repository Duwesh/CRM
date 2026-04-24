-- ============================================================
-- STEP 1: Schema usage
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================
-- STEP 2: Table-level grants for authenticated users
-- (Tables were created by Sequelize and never received auto-grants)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Firms"               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Users"               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_TeamMembers"         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Clients"             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_ClientServices"      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Contacts"            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Leads"               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Tasks"               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Engagements"         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Invoices"            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_InvoiceSequences"    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Deadlines"           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Interactions"        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Reminders"           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_Documents"           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_InviteTokens"        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Tbl_PasswordResetTokens" TO authenticated;

-- ============================================================
-- STEP 3: Sequence grants (needed for INSERT on tables with serial PKs)
-- ============================================================
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- STEP 4: RPC / function grants
-- ============================================================
GRANT EXECUTE ON FUNCTION get_my_firm_id()                    TO authenticated;
GRANT EXECUTE ON FUNCTION is_firm_admin()                     TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_summary()             TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(bigint)     TO authenticated;
