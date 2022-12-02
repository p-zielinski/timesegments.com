/*
  Warnings:

  - You are about to drop the column `disabled` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `Subcategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "disabled",
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Subcategory" DROP COLUMN "disabled",
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;
