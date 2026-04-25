-- Add columns that exist in the frontend forms but were missing from the
-- Supabase tables (which were created from the original backend schema).

-- Tbl_TeamMembers: frontend sends mobile and status
ALTER TABLE "Tbl_TeamMembers"
ADD COLUMN IF NOT EXISTS "mobile"  VARCHAR(20),
ADD COLUMN IF NOT EXISTS "status"  VARCHAR(50) DEFAULT 'active';

-- Tbl_Contacts: frontend sends whatsapp_number, birthday, notes
-- (old schema had "whatsapp"; frontend uses "whatsapp_number")
ALTER TABLE "Tbl_Contacts"
ADD COLUMN IF NOT EXISTS "whatsapp_number" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "birthday"        DATE,
ADD COLUMN IF NOT EXISTS "notes"           TEXT;
