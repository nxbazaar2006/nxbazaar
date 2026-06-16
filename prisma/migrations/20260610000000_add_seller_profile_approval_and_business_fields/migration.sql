DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SellerStatus') THEN
        CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
    END IF;
END $$;

ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "approvalStatus" "SellerStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "pickupAddress" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "state" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS "zip" TEXT,
ADD COLUMN IF NOT EXISTS "businessName" TEXT,
ADD COLUMN IF NOT EXISTS "legalName" TEXT,
ADD COLUMN IF NOT EXISTS "businessType" TEXT,
ADD COLUMN IF NOT EXISTS "gstNumber" TEXT,
ADD COLUMN IF NOT EXISTS "panNumber" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT,
ADD COLUMN IF NOT EXISTS "bankIfscCode" TEXT,
ADD COLUMN IF NOT EXISTS "bankName" TEXT,
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "SellerProfile_gstNumber_key" ON "SellerProfile"("gstNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "SellerProfile_panNumber_key" ON "SellerProfile"("panNumber");
CREATE INDEX IF NOT EXISTS "SellerProfile_approvalStatus_idx" ON "SellerProfile"("approvalStatus");
CREATE INDEX IF NOT EXISTS "SellerProfile_isActive_idx" ON "SellerProfile"("isActive");
CREATE INDEX IF NOT EXISTS "SellerProfile_businessName_idx" ON "SellerProfile"("businessName");
CREATE INDEX IF NOT EXISTS "SellerProfile_phone_idx" ON "SellerProfile"("phone");
