-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;
