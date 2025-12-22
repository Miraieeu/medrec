/*
  Warnings:

  - The values [LOGIN] on the enum `AuthAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthAction_new" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT');
ALTER TABLE "AuthLog" ALTER COLUMN "action" TYPE "AuthAction_new" USING ("action"::text::"AuthAction_new");
ALTER TYPE "AuthAction" RENAME TO "AuthAction_old";
ALTER TYPE "AuthAction_new" RENAME TO "AuthAction";
DROP TYPE "AuthAction_old";
COMMIT;
