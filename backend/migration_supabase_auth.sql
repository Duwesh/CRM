-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
ALTER TABLE "Tbl_Users" ADD COLUMN IF NOT EXISTS supabase_uid VARCHAR(255) UNIQUE;
ALTER TABLE "Tbl_Users" ALTER COLUMN password_hash DROP NOT NULL;
