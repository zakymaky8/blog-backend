const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    createCommentByUser: async (postId, entries, user) => { //
        return await prisma.comment.create({
            data: {
                post_id: postId,
                content: entries.content,
                user_id: user.users_id,
            }
        })
    },

    //  with right authorship
    deleteCommentByUser: async (postId, commentId, user) => {
        const comment = await prisma.comment.findFirst({ where: { comments_id: commentId } });
        if (comment) {
            await prisma.reply.deleteMany({where: {comment_id: commentId}});
            await prisma.comment.delete({
                where: {
                    user_id: user.users_id,
                    post_id: postId,
                    comments_id: commentId
                }
            });
        } else {
            return false
        }
    },

//  it shouldn't require who u are to delete when admin is deleting

    deleteSingleCommentByAdmin: async (postId, commentId) => {
        const comment = await prisma.comment.findFirst({ where: { comments_id: commentId } });
        if (comment) {
            await prisma.reply.deleteMany({where: {comment_id: commentId}})
            await prisma.comment.delete({
                where: {
                    comments_id: commentId,
                    post_id: postId
                }
            })
            return comment
        } else {
            return false
        }
    },

    deleteAllComments: async () => await prisma.comment.deleteMany(),

    // bear with this for the later time 👈👈👈👈👈👈👈
    updateCommentContent: async (postId, user, commentId, entries) => {
        return await prisma.comment.update({
            where: {
                user_id: user.users_id,
                post_id: postId,
                comments_id: commentId,
            },
            data: { content: entries.content, isUpdated: true }
        })
    },

    fetchComments: async (postId) => {
        const comments = await prisma.comment.findMany({
            where: {
                post_id: postId
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        return comments.sort((a, b)=> a.createdAt - b.createdAt);
    },

    fetchAllComments: async () => {
        const allComments = await prisma.comment.findMany();
        return allComments.sort((a, b) => a.createdAt - b.createdAt);
    },

    fetchSingleComment: async (user, commentId) => {
        const comment = await prisma.comment.findFirst({
            where: {
                user_id: user.users_id,
                comments_id: commentId
            }
        })
        return comment
    },

    fetchByCommentId: async commentId => await prisma.comment.findFirst({where: {comments_id: commentId}}),

    getOneCommentWithNoUser: async (commentId) => {
        return await prisma.comment.findFirst({where: {comments_id: commentId}})
    },

    likeUnlikeComment: async (postId, commentId, user) => {
        const comment = await prisma.comment.findFirst({
            where: {
                    post_id: postId,
                    comments_id: commentId
                }
            });

        const exists = comment.likes.includes(user.users_id)
        const unliked = comment.likes.filter(likes => likes !== user.users_id)
        const liked = [...comment.likes, user.users_id]
        const likes = exists ? unliked : liked

        return await prisma.comment.update({
            where: {
                post_id: postId,
                comments_id: commentId,
            },
            data: {
                likes: likes
            }
        })
    },
}