const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();




module.exports = {
    createReply: async (entries, mainCommentId, user, repliedCommentAuthorId, repliedReplyAuthorId) => {
        return await prisma.reply.create({
            data: {
                content: entries.content,
                comment_id: mainCommentId,
                replied_id: repliedCommentAuthorId || repliedReplyAuthorId,
                user_id: user.users_id,
            }
        })
    },
    getRepliesPerComment: async (commentId, search='', page='', limit='') => {
        const inCommentReplies = await prisma.reply.findMany({
            where: {
                comment_id: commentId,
                // OR: [
                //     { content: { contains: search, mode: "insensitive" } }
                // ]
            },
            // orderBy: {
            //     createdAt: "asc"
            // },
            // skip: limit * (page - 1),
            // take: limit
        })
        return inCommentReplies.sort((a, b) => a.createdAt - b.createdAt);
    },

    fetchSingleReply: async (replyId) => await prisma.reply.findFirst({where: {replies_id: replyId}}),

    updateReply: async (user, commentId, entries, replyId) => {
        return await prisma.reply.update({
            where: {
                user_id: user.users_id,
                comment_id: commentId,
                replies_id: replyId,
            },
            data: { content: entries.content, isUpdated: true, lastUpdate: new Date() }
        })
    },

    likeUnlikeReply: async (replyId, commentId, user) => {
        const reply = await prisma.reply.findFirst({where: {comment_id: commentId, replies_id: replyId}});


        const like_exists = reply.likes.includes(user.users_id);
        const dislike_exists = reply.dislikes.includes(user.users_id);

        const unliked = reply.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = reply.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...reply.likes, user.users_id];
        const dislikes = dislike_exists ? undo_dislike : [...reply.dislikes]

        return await prisma.reply.update({
            where: {
                replies_id: replyId,
                comment_id: commentId,
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },

    dislikeUndoDislikeReply: async (replyId, commentId, user) => {
        const reply = await prisma.reply.findFirst({where: {comment_id: commentId, replies_id: replyId}});

        const dislike_exists = reply.dislikes.includes(user.users_id);
        const like_exists = reply.likes.includes(user.users_id);

        const unliked = reply.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = reply.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...reply.likes];
        const dislikes = dislike_exists ? undo_dislike : [...reply.dislikes, user.users_id]

        return await prisma.reply.update({
            where: {
                replies_id: replyId,
                comment_id: commentId,
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },

    deleteReplyByReplier: async (replyId, commentId, user) => {
        const reply = await prisma.reply.findFirst({where: {replies_id: replyId}})
        if (reply) {
            await prisma.reply.delete({
                where: {
                    replies_id: replyId,
                    comment_id: commentId,
                    user_id: user.users_id
                    }
            })
            return reply
        } else {
            return false
        }
    },

    deleteReplyByAdmin: async (replyId, commentId) => {
        const reply = await prisma.reply.findFirst({where: {replies_id: replyId}})
        if (reply) {
            await prisma.reply.delete({
                where: {
                    replies_id: replyId,
                    comment_id: commentId,
                    }
            })
            return reply
        } else {
            return false
        }
    },
}