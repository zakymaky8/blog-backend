const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();




module.exports = {
    createReply: async (entries, mainCommentId, user, repliedCommentAuthorId, repliedReplyAuthorId) => {
        await prisma.reply.create({
            data: {
                content: entries.content,
                comment_id: mainCommentId,
                replied_id: repliedCommentAuthorId || repliedReplyAuthorId,
                user_id: user.users_id,
            }
        })
    },
    getRepliesPerComment: async (commentId) => {
        const inCommentReplies = await prisma.reply.findMany({
            where: {
                comment_id: commentId
            },orderBy: {
                createdAt: "asc"
            }
        })
        return inCommentReplies;
    },
    fetchSingleReply: async (replyId) => {
         return  await prisma.reply.findFirst({where: {replies_id: replyId}})
    },

    updateReply: async (user, commentId, entries, replyId) => {
        await prisma.reply.update({
            where: {
                user_id: user.users_id,
                comment_id: commentId,
                replies_id: replyId
            },
            data: { content: entries.content }
        })
    },

    likeUnlikeReply: async (replyId, commentId, user) => {
        const reply = await prisma.reply.findFirst({
            where: {
                    comment_id: commentId,
                    replies_id: replyId
                }
            });

        const exists = reply.likes.includes(user.users_id)
        const unliked = reply.likes.filter(likes => likes !== user.users_id)
        const liked = [...reply.likes, user.users_id]
        const likes = exists ? unliked : liked

        await prisma.reply.update({
            where: {
                replies_id: replyId,
                comment_id: commentId,
            },
            data: {
                likes: likes
            }
        })
    },
    deleteReplyByReplier: async (replyId, commentId, user) => {
        await prisma.reply.delete({
            where: {
                replies_id: replyId,
                comment_id: commentId,
                user_id: user.users_id
                }
            })
    },
    
    deleteReplyByAdmin: async (replyId, commentId) => {
        await prisma.reply.delete({
            where: {
                replies_id: replyId,
                comment_id: commentId,
                }
            })
    },
}