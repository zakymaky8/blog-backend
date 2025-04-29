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
            return comment
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

    updateCommentContent: async (postId, user, commentId, entries) => {
        return await prisma.comment.update({
            where: {
                user_id: user.users_id,
                post_id: postId,
                comments_id: commentId,
            },
            data: { content: entries.content, isUpdated: true, lastUpdate: new Date() }
        })
    },

    fetchComments: async (postId, search="", page=1, limit=8) => {

        const comments = await prisma.comment.findMany({
            where: {
                post_id: postId,
                OR: [
                    { content: { contains: search, mode: "insensitive" } },
                ]
            },
            orderBy: {
                createdAt: "asc"
            },
            skip: limit * (page-1),
            take: limit
        });

        const allComments = await prisma.comment.findMany({
                where: {
                    post_id: postId,
                    content: { contains: search, mode: "insensitive" }
                }
            })
        return {comments, allComments};
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
        const comment = await prisma.comment.findFirst({where: {post_id: postId, comments_id: commentId}});

        const like_exists = comment.likes.includes(user.users_id);
        const dislike_exists = comment.dislikes.includes(user.users_id);

        const unliked = comment.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = comment.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...comment.likes, user.users_id];
        const dislikes = dislike_exists ? undo_dislike : [...comment.dislikes]


        return await prisma.comment.update({
            where: {
                post_id: postId,
                comments_id: commentId,
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },


    dislikeUndoDislikeComment: async (postId, commentId, user) => {
        const comment = await prisma.comment.findFirst({where: {post_id: postId, comments_id: commentId}});

        const dislike_exists = comment.dislikes.includes(user.users_id);
        const like_exists = comment.likes.includes(user.users_id);

        const unliked = comment.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = comment.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...comment.likes];
        const dislikes = dislike_exists ? undo_dislike : [...comment.dislikes, user.users_id]

        return await prisma.comment.update({
            where: {
                post_id: postId,
                comments_id: commentId,
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },
}