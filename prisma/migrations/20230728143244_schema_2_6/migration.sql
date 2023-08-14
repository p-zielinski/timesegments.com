/*
  Warnings:

  - You are about to drop the column `categoriesControlValue` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notesControlValue` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timeLogsControlValue` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userControlValue` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "categoriesControlValue",
DROP COLUMN "notesControlValue",
DROP COLUMN "timeLogsControlValue",
DROP COLUMN "userControlValue";
