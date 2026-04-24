-- ============================================================
-- Atomic signup helper — runs as SECURITY DEFINER so it bypasses
-- all RLS policies (needed because Tbl_Users doesn't exist yet
-- when we insert Tbl_Firms, making get_my_firm_id() return NULL).
-- ============================================================

CREATE OR REPLACE FUNCTION create_firm_and_user(
  p_firm_name text,
  p_firm_email text,
  p_user_name text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_firm_id bigint;
BEGIN
  INSERT INTO "Tbl_Firms" (name, email)
  VALUES (p_firm_name, p_firm_email)
  RETURNING id INTO v_firm_id;

  INSERT INTO "Tbl_Users" (supabase_uid, firm_id, name, email, role, is_active, is_deleted)
  VALUES (auth.uid()::text, v_firm_id, p_user_name, p_firm_email, 'owner', true, false);

  INSERT INTO "Tbl_InvoiceSequences" (firm_id, last_number)
  VALUES (v_firm_id, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION create_firm_and_user(text, text, text) TO authenticated;
