-- AlterTable
ALTER TABLE "TimeLog" ADD COLUMN "endedAt2" TIMESTAMPTZ(3);
UPDATE "TimeLog" SET "endedAt2" = "endedAt"
