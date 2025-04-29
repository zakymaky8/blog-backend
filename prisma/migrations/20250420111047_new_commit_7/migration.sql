/*
  Warnings:

  - The `views` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SuggStatus" AS ENUM ('DENIED', 'ADDRESSED', 'PENDING');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "suggnsToPost" TEXT[],
DROP COLUMN "views",
ADD COLUMN     "views" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Reply" ADD COLUMN     "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "profilePic" TEXT;

-- CreateTable
CREATE TABLE "SuggestedTopics" (
    "suggns_id" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "user_id" TEXT NOT NULL,
    "postsToSugg" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "status" "SuggStatus" NOT NULL DEFAULT 'PENDING',
    "content" TEXT NOT NULL,

    CONSTRAINT "SuggestedTopics_pkey" PRIMARY KEY ("suggns_id")
);

-- CreateTable
CREATE TABLE "_PostToSuggestedTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToSuggestedTopics_AB_unique" ON "_PostToSuggestedTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToSuggestedTopics_B_index" ON "_PostToSuggestedTopics"("B");

-- AddForeignKey
ALTER TABLE "SuggestedTopics" ADD CONSTRAINT "SuggestedTopics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSuggestedTopics" ADD CONSTRAINT "_PostToSuggestedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("posts_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSuggestedTopics" ADD CONSTRAINT "_PostToSuggestedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "SuggestedTopics"("suggns_id") ON DELETE CASCADE ON UPDATE CASCADE;
