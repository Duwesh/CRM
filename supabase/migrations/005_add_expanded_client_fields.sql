-- Add expanded client profile fields (ported from backend migration 003).
-- Run this in Supabase SQL Editor before deploying frontend changes that
-- reference services_availed, cin, constitution, etc.

ALTER TABLE "Tbl_Clients"
ADD COLUMN IF NOT EXISTS "cin"                VARCHAR(100),
ADD COLUMN IF NOT EXISTS "constitution"       VARCHAR(100),
ADD COLUMN IF NOT EXISTS "services_availed"   TEXT,
ADD COLUMN IF NOT EXISTS "registered_address" TEXT,
ADD COLUMN IF NOT EXISTS "it_password"        VARCHAR(255),
ADD COLUMN IF NOT EXISTS "gst_password"       VARCHAR(255);
