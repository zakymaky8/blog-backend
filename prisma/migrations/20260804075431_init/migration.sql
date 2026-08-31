/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'EDITOR', 'CREATOR', 'MEMBER');
ALTER TABLE "Users" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "Role" TYPE "Role_new" USING ("Role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "Users" ALTER COLUMN "Role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "Role" SET DEFAULT 'MEMBER';

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
