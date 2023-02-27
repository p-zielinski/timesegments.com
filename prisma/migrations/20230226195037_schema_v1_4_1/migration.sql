/*
  Warnings:

  - The values [REVERSE_ALPHABETICAL] on the enum `ColumnSortOption` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ColumnSortOption_new" AS ENUM ('NEWEST', 'OLDEST', 'ALPHABETICAL', 'REVERSED_ALPHABETICAL');
ALTER TABLE "User" ALTER COLUMN "sortingCategories" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "sortingCategories" TYPE "ColumnSortOption_new" USING ("sortingCategories"::text::"ColumnSortOption_new");
ALTER TYPE "ColumnSortOption" RENAME TO "ColumnSortOption_old";
ALTER TYPE "ColumnSortOption_new" RENAME TO "ColumnSortOption";
DROP TYPE "ColumnSortOption_old";
ALTER TABLE "User" ALTER COLUMN "sortingCategories" SET DEFAULT 'NEWEST';
COMMIT;
