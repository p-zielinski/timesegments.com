-- AlterTable
ALTER TABLE "TimeLog" ADD COLUMN     "endedAt" TIMESTAMPTZ(3);
UPDATE "TimeLog" SET "endedAt" = "endedAt2"
