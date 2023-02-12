-- CreateEnum
CREATE TYPE "ColumnSortOption" AS ENUM ('NEWEST', 'OLDEST', 'ALPHABETICAL', 'REVERSE_ALPHABETICAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sortingCategories" "ColumnSortOption" NOT NULL DEFAULT 'NEWEST';
