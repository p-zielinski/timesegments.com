/*
  Warnings:

  - The `sortingCategories` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CategoriesSortOption" AS ENUM ('NEWEST', 'OLDEST', 'ALPHABETICAL', 'REVERSED_ALPHABETICAL');

-- CreateEnum
CREATE TYPE "NotesSortOption" AS ENUM ('BY_DATE', 'FAVORITES_FIRST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sortingNotes" "NotesSortOption" NOT NULL DEFAULT 'BY_DATE',
DROP COLUMN "sortingCategories",
ADD COLUMN     "sortingCategories" "CategoriesSortOption" NOT NULL DEFAULT 'NEWEST';

-- DropEnum
DROP TYPE "ColumnSortOption";
