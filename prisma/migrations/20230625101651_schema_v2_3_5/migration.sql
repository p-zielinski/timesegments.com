/*
  Warnings:

  - You are about to drop the column `key` on the `Email` table. All the data in the column will be lost.
  - Added the required column `secretKey` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
SP

-- AlterTable
ALTER TABLE "Email" RENAME COLUMN "key" TO "secretKey",
