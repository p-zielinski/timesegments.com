/*
  Warnings:

  - You are about to drop the column `favorite` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "favorite",
DROP COLUMN "note",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "text" TEXT;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
