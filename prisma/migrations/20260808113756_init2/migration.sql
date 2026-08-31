-- CreateEnum
CREATE TYPE "Role_Status" AS ENUM ('SUSPENDED', 'ACTIVE', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role_status" "Role_Status" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Roles" (
    "role_id" TEXT NOT NULL,
    "name" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Open_Role" (
    "open_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "slots" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Open_Role_pkey" PRIMARY KEY ("open_id")
);

-- CreateTable
CREATE TABLE "Role_Request" (
    "request_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "value_proposition" TEXT NOT NULL,
    "contact" INTEGER NOT NULL,

    CONSTRAINT "Role_Request_pkey" PRIMARY KEY ("request_id")
);

-- AddForeignKey
ALTER TABLE "Open_Role" ADD CONSTRAINT "Open_Role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_Request" ADD CONSTRAINT "Role_Request_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;
