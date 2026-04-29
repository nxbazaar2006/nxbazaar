ALTER TABLE "CategoryTranslation" ADD COLUMN "slug" TEXT;
ALTER TABLE "SubCategoryTranslation" ADD COLUMN "slug" TEXT;
ALTER TABLE "ProductTranslation" ADD COLUMN "slug" TEXT;
ALTER TABLE "BlogTranslation" ADD COLUMN "slug" TEXT;
ALTER TABLE "MarketTranslation" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "CategoryTranslation_locale_slug_key" ON "CategoryTranslation"("locale", "slug");
CREATE INDEX "CategoryTranslation_locale_slug_idx" ON "CategoryTranslation"("locale", "slug");

CREATE UNIQUE INDEX "SubCategoryTranslation_locale_slug_key" ON "SubCategoryTranslation"("locale", "slug");
CREATE INDEX "SubCategoryTranslation_locale_slug_idx" ON "SubCategoryTranslation"("locale", "slug");

CREATE UNIQUE INDEX "ProductTranslation_locale_slug_key" ON "ProductTranslation"("locale", "slug");
CREATE INDEX "ProductTranslation_locale_slug_idx" ON "ProductTranslation"("locale", "slug");

CREATE UNIQUE INDEX "BlogTranslation_locale_slug_key" ON "BlogTranslation"("locale", "slug");
CREATE INDEX "BlogTranslation_locale_slug_idx" ON "BlogTranslation"("locale", "slug");

CREATE UNIQUE INDEX "MarketTranslation_locale_slug_key" ON "MarketTranslation"("locale", "slug");
CREATE INDEX "MarketTranslation_locale_slug_idx" ON "MarketTranslation"("locale", "slug");
