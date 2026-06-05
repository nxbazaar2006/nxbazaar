/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `BlogTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `CategoryTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `MarketTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ProductTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productCode]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `SubCategoryTranslation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `BlogTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `CategoryTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `MarketTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ProductTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Made the column `sku` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `barcode` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productVariantId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `SubCategoryTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlogTranslation" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CategoryTranslation" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MarketTranslation" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "qrCodeUrl" TEXT,
ADD COLUMN     "qrData" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productVariantId" TEXT NOT NULL,
ADD COLUMN     "qrCodeUrl" TEXT,
ADD COLUMN     "qrData" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "gstRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductTranslation" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "productVariantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubCategoryTranslation" ADD COLUMN     "slug" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SlugModel";

-- CreateTable
CREATE TABLE "Vlog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productId" TEXT,
    "userId" TEXT,
    "blogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VlogTranslation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "vlogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VlogTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vlog_slug_key" ON "Vlog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VlogTranslation_slug_locale_key" ON "VlogTranslation"("slug", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTranslation_slug_key" ON "BlogTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_slug_key" ON "CategoryTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MarketTranslation_slug_key" ON "MarketTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_slug_key" ON "ProductTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategoryTranslation_slug_key" ON "SubCategoryTranslation"("slug");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vlog" ADD CONSTRAINT "Vlog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vlog" ADD CONSTRAINT "Vlog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vlog" ADD CONSTRAINT "Vlog_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VlogTranslation" ADD CONSTRAINT "VlogTranslation_vlogId_fkey" FOREIGN KEY ("vlogId") REFERENCES "Vlog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
