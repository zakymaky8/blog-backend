-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isUpdated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isUpdated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Reply" ADD COLUMN     "isUpdated" BOOLEAN NOT NULL DEFAULT false;
