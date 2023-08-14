/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "expiresAt",
ADD COLUMN     "valid" BOOLEAN NOT NULL DEFAULT true;
