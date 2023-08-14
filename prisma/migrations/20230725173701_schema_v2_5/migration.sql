/*
  Warnings:

  - You are about to drop the column `controlValue` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "controlValue",
ADD COLUMN     "notesControlValue" TEXT,
ADD COLUMN     "timeLogsControlValue" TEXT;
