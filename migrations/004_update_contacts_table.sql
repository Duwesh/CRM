-- ============================================
-- Update Tbl_Contacts with missing fields
-- Migration: 004_update_contacts_table
-- ============================================

-- Rename whatsapp if it exists, otherwise add whatsapp_number
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tbl_Contacts' AND column_name='whatsapp') THEN
        ALTER TABLE "Tbl_Contacts" RENAME COLUMN "whatsapp" TO "whatsapp_number";
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tbl_Contacts' AND column_name='whatsapp_number') THEN
        ALTER TABLE "Tbl_Contacts" ADD COLUMN "whatsapp_number" VARCHAR(20);
    END IF;
END $$;

-- Add birthday field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tbl_Contacts' AND column_name='birthday') THEN
        ALTER TABLE "Tbl_Contacts" ADD COLUMN "birthday" DATE;
    END IF;
END $$;

-- Add notes field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tbl_Contacts' AND column_name='notes') THEN
        ALTER TABLE "Tbl_Contacts" ADD COLUMN "notes" TEXT;
    END IF;
END $$;
