-- Add email verification fields
ALTER TABLE "public"."User"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "public"."User"
ADD COLUMN "emailVerificationToken" TEXT;

ALTER TABLE "public"."User"
ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);

-- Token must be unique
CREATE UNIQUE INDEX "User_emailVerificationToken_key"
ON "public"."User"("emailVerificationToken");

-- Existing accounts are treated as already verified.
-- New accounts will use the default value: false.
UPDATE "public"."User"
SET "emailVerified" = true;