-- Fix circular RLS bootstrap on Tbl_Users.
-- The old policy (firm_id = get_my_firm_id()) blocked all rows whenever
-- get_my_firm_id() returned NULL (orphan auth user, is_active=false, etc.),
-- causing getFirmId() on the frontend to get a 406 from PostgREST .single().
-- Adding OR supabase_uid = auth.uid()::text ensures a user can always read
-- their own row regardless of the get_my_firm_id() result.

DROP POLICY IF EXISTS "users_select" ON "Tbl_Users";

CREATE POLICY "users_select" ON "Tbl_Users"
  FOR SELECT
  USING (
    firm_id = get_my_firm_id()
    OR supabase_uid = auth.uid()::text
  );
