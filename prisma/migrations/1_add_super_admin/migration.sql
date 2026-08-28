-- Add SUPER_ADMIN role
ALTER TYPE "public"."UserRole"
ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Add active status to users
ALTER TABLE "public"."User"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;