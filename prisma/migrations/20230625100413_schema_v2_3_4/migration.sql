/*
  Warnings:

  - The values [EMAIL_CONTINUATION] on the enum `EmailType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailType_new" AS ENUM ('EMAIL_CONFIRMATION', 'RESET_PASSWORD', 'CHANGE_EMAIL_ADDRESS');
ALTER TABLE "Email" ALTER COLUMN "type" TYPE "EmailType_new" USING ("type"::text::"EmailType_new");
ALTER TYPE "EmailType" RENAME TO "EmailType_old";
ALTER TYPE "EmailType_new" RENAME TO "EmailType";
DROP TYPE "EmailType_old";
COMMIT;
