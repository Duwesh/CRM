-- ============================================================
-- Migration: 003_add_expanded_fields_to_clients
-- Purpose: Add metadata fields to support detailed client profiles 
--          as per the new Client Master UI requirements.
-- ============================================================

ALTER TABLE "Tbl_Clients" 
ADD COLUMN IF NOT EXISTS "cin" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "constitution" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "services_availed" TEXT,
ADD COLUMN IF NOT EXISTS "registered_address" TEXT,
ADD COLUMN IF NOT EXISTS "it_password" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "gst_password" VARCHAR(255);

-- Optional: Create a GIN index on services_availed if search is needed, 
-- but for now simple text columns are sufficient.
