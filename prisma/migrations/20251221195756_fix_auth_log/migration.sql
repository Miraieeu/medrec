/*
  Warnings:

  - Added the required column `email` to the `AuthLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AuthAction" ADD VALUE 'LOGIN_FAILED';

-- DropForeignKey
ALTER TABLE "AuthLog" DROP CONSTRAINT "AuthLog_userId_fkey";

-- AlterTable
ALTER TABLE "AuthLog" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AuthLog" ADD CONSTRAINT "AuthLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
