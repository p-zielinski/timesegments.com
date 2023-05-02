/*
  Warnings:

  - You are about to drop the column `deviceName` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "deviceName",
ADD COLUMN     "userAgent" TEXT;
