DROP INDEX IF EXISTS "ProductVariant_productCode_key";

CREATE INDEX IF NOT EXISTS "ProductVariant_productCode_idx" ON "ProductVariant"("productCode");
