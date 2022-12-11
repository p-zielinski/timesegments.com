-- DropForeignKey
ALTER TABLE "TimeLog" DROP CONSTRAINT "TimeLog_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "TimeLog" ALTER COLUMN "subcategoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
