-- CreateTable
CREATE TABLE "ProductHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productCode" TEXT,
    "productTitle" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "variantId" TEXT,
    "sku" TEXT,
    "changedByUserId" TEXT,
    "changedByUserCode" TEXT,
    "changedByRole" TEXT,
    "sellerCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductHistory_productId_createdAt_idx" ON "ProductHistory"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductHistory_variantId_idx" ON "ProductHistory"("variantId");

-- CreateIndex
CREATE INDEX "ProductHistory_action_idx" ON "ProductHistory"("action");

-- CreateIndex
CREATE INDEX "ProductHistory_changedByUserId_idx" ON "ProductHistory"("changedByUserId");

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
