-- ============================================
-- Migration: 002_add_firm_id_to_invoices_interactions
-- ============================================

-- Add firm_id to Tbl_Invoices
ALTER TABLE "Tbl_Invoices" ADD COLUMN IF NOT EXISTS "firm_id" BIGINT;
-- Update existing invoices with firm_id from their clients (if any exists)
UPDATE "Tbl_Invoices" i SET "firm_id" = c."firm_id" FROM "Tbl_Clients" c WHERE i."client_id" = c.id;
-- Ensure it's not null in the future (though we might have empty data initially)
-- ALTER TABLE "Tbl_Invoices" ALTER COLUMN "firm_id" SET NOT NULL;

-- Add firm_id to Tbl_Interactions
ALTER TABLE "Tbl_Interactions" ADD COLUMN IF NOT EXISTS "firm_id" BIGINT;
-- Update existing interactions with firm_id from their clients
UPDATE "Tbl_Interactions" i SET "firm_id" = c."firm_id" FROM "Tbl_Clients" c WHERE i."client_id" = c.id;
-- ALTER TABLE "Tbl_Interactions" ALTER COLUMN "firm_id" SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_firm ON "Tbl_Invoices"("firm_id");
CREATE INDEX IF NOT EXISTS idx_interactions_firm ON "Tbl_Interactions"("firm_id");
