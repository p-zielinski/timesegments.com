/*
  Warnings:

  - You are about to drop the column `expandSubcategories` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the column `sortingCategories` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Subcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_userId_fkey";

-- DropForeignKey
ALTER TABLE "TimeLog" DROP CONSTRAINT "TimeLog_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "expandSubcategories";

-- AlterTable
ALTER TABLE "TimeLog" DROP COLUMN "subcategoryId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sortingCategories";

-- DropTable
DROP TABLE "Subcategory";
