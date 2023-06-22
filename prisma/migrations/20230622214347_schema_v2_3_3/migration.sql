/*
  Warnings:

  - Added the required column `updatedAt` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;
