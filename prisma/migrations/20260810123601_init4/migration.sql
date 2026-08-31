/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Open_Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Role_Request` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role_Request_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Open_Role" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Role_Request" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Tags" (
    "tag_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "Content_Formats" (
    "format_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT,

    CONSTRAINT "Content_Formats_pkey" PRIMARY KEY ("format_id")
);

-- CreateTable
CREATE TABLE "Content_Category" (
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Content_SubCategory" (
    "subcategory_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_SubCategory_pkey" PRIMARY KEY ("subcategory_id")
);

-- CreateTable
CREATE TABLE "Content_Languages" (
    "language_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "native_name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_Languages_pkey" PRIMARY KEY ("language_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_slug_key" ON "Tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_Formats_name_key" ON "Content_Formats"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Content_Formats_slug_key" ON "Content_Formats"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_Category_name_key" ON "Content_Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Content_Category_slug_key" ON "Content_Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_SubCategory_category_id_name_key" ON "Content_SubCategory"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Content_SubCategory_category_id_slug_key" ON "Content_SubCategory"("category_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_Languages_code_key" ON "Content_Languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- AddForeignKey
ALTER TABLE "Role_Request" ADD CONSTRAINT "Role_Request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content_SubCategory" ADD CONSTRAINT "Content_SubCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Content_Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
