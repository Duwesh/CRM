-- Add firm_id to Tbl_Documents so documents can exist without a client
-- (e.g. general firm-level documents). RLS policies are updated to allow
-- insert/select by firm_id when client_id is NULL.

ALTER TABLE "Tbl_Documents"
ADD COLUMN IF NOT EXISTS "firm_id" BIGINT REFERENCES "Tbl_Firms"(id) ON DELETE CASCADE;

-- Re-create RLS policies to support both client-linked and firm-level docs
DROP POLICY IF EXISTS "documents_select" ON "Tbl_Documents";
DROP POLICY IF EXISTS "documents_insert" ON "Tbl_Documents";
DROP POLICY IF EXISTS "documents_update" ON "Tbl_Documents";
DROP POLICY IF EXISTS "documents_delete" ON "Tbl_Documents";

CREATE POLICY "documents_select" ON "Tbl_Documents"
  FOR SELECT
  USING (
    firm_id = get_my_firm_id()
    OR client_id IN (SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id())
  );

CREATE POLICY "documents_insert" ON "Tbl_Documents"
  FOR INSERT
  WITH CHECK (
    firm_id = get_my_firm_id()
    OR client_id IN (SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id())
  );

CREATE POLICY "documents_update" ON "Tbl_Documents"
  FOR UPDATE
  USING (
    firm_id = get_my_firm_id()
    OR client_id IN (SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id())
  );

CREATE POLICY "documents_delete" ON "Tbl_Documents"
  FOR DELETE
  USING (
    firm_id = get_my_firm_id()
    OR client_id IN (SELECT id FROM "Tbl_Clients" WHERE firm_id = get_my_firm_id())
  );
