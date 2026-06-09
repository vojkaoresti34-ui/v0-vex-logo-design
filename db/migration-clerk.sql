-- Migration: Add Clerk authentication support
-- Run once against your existing database.
-- Safe to run multiple times (uses IF NOT EXISTS / DO $$ blocks).

DO $$
BEGIN
  -- Add clerkId column to User table if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'clerkId'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;
  END IF;

  -- Unique index for fast Clerk lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'User' AND indexname = 'User_clerkId_key'
  ) THEN
    CREATE UNIQUE INDEX "User_clerkId_key" ON "User" ("clerkId")
      WHERE "clerkId" IS NOT NULL;
  END IF;
END $$;
