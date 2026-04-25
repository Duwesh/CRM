-- Make client_id nullable in Tbl_Documents to allow firm-level documents
-- that are not tied to a specific client.

ALTER TABLE "Tbl_Documents"
ALTER COLUMN "client_id" DROP NOT NULL;
