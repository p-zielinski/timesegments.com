-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('CREATED', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'CREATED';
