-- Add department column to Tbl_TeamMembers.
-- The team page form sends this field but the column was never created
-- in Supabase (it only existed in the old backend schema under a different table name).

ALTER TABLE "Tbl_TeamMembers"
ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);
