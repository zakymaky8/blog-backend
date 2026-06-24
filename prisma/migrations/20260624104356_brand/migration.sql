-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SuggStatus" AS ENUM ('DENIED', 'ADDRESSED', 'PENDING');

-- CreateTable
CREATE TABLE "Users" (
    "users_id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "Role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isWarned" BOOLEAN NOT NULL DEFAULT false,
    "profilePic" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "SuggestedTopics" (
    "suggns_id" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "user_id" TEXT NOT NULL,
    "postsToSugg" TEXT[],
    "upvote" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downvote" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "status" "SuggStatus" NOT NULL DEFAULT 'PENDING',
    "content" TEXT NOT NULL,

    CONSTRAINT "SuggestedTopics_pkey" PRIMARY KEY ("suggns_id")
);

-- CreateTable
CREATE TABLE "Post" (
    "posts_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'place-holder-1234',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "readTime" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgs" TEXT[],
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "likes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "user_id" TEXT NOT NULL,
    "isUpdated" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "suggnsToPost" TEXT[],

    CONSTRAINT "Post_pkey" PRIMARY KEY ("posts_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comments_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "likes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "isUpdated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comments_id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "replies_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "replied_id" TEXT NOT NULL,
    "isUpdated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "likes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("replies_id")
);

-- CreateTable
CREATE TABLE "_PostToSuggestedTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_PostToSuggestedTopics_AB_unique" ON "_PostToSuggestedTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToSuggestedTopics_B_index" ON "_PostToSuggestedTopics"("B");

-- AddForeignKey
ALTER TABLE "SuggestedTopics" ADD CONSTRAINT "SuggestedTopics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("posts_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("comments_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_replied_id_fkey" FOREIGN KEY ("replied_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSuggestedTopics" ADD CONSTRAINT "_PostToSuggestedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("posts_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSuggestedTopics" ADD CONSTRAINT "_PostToSuggestedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "SuggestedTopics"("suggns_id") ON DELETE CASCADE ON UPDATE CASCADE;
