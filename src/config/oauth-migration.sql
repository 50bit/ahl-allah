-- OAuth Migration Script
-- Add OAuth fields to Users table

-- Add OAuth provider fields
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "provider" VARCHAR(50) DEFAULT 'local',
ADD COLUMN IF NOT EXISTS "providerId" VARCHAR(256),
ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT false;

-- Make password optional for OAuth users
ALTER TABLE "Users" ALTER COLUMN "password" DROP NOT NULL;

-- Make optional fields nullable for OAuth users
ALTER TABLE "Users" ALTER COLUMN "birthyear" DROP NOT NULL;
ALTER TABLE "Users" ALTER COLUMN "age" DROP NOT NULL;
ALTER TABLE "Users" ALTER COLUMN "gender" DROP NOT NULL;

-- Add indexes for OAuth fields
CREATE INDEX IF NOT EXISTS "idx_users_provider" ON "Users" ("provider");
CREATE INDEX IF NOT EXISTS "idx_users_provider_id" ON "Users" ("providerId");
CREATE INDEX IF NOT EXISTS "idx_users_email_verified" ON "Users" ("isEmailVerified");

-- Update existing users to have email verified if they have a password
UPDATE "Users" 
SET "isEmailVerified" = true 
WHERE "password" IS NOT NULL AND "isEmailVerified" = false;

