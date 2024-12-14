const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();

//  all methods considered as utility function so they have no
// error handlers if neccessary handle the possible errorthat
//  comes out these methods should be handled on wherever they
//  are used

module.exports = {
    createCommentByUser: async (postId, entries, user) => { //
        await prisma.comment.create({
            data: {
                post_id: postId,
                content: entries.content,
                user_id: user.users_id,
            }
        })
    },
    // createComment: async (entries) => {
    //     await prisma.comment.create({
    //         data: {
    //             content: "" // by admin
    //         }
    //     })
    // }
    //  with right authorship
    deleteCommentByUser: async (postId, commentId, user) => {
        await prisma.reply.deleteMany({where: {comment_id: commentId}});
        await prisma.comment.delete({
            where: {
                user_id: user.users_id,
                post_id: postId,
                comments_id: commentId
            }
        });
    },
//  it shouldn't require who u are to delete when admin is deleting

    deleteSingleCommentByAdmin: async (postId, commentId) => {
        await prisma.reply.deleteMany({where: {comment_id: commentId}})
        await prisma.comment.delete({
            where: {
                comments_id: commentId,
                post_id: postId
            }
        })
    },

    deleteAllComments: async () => await prisma.comment.deleteMany(),

    // bear with this for the later time 👈👈👈👈👈👈👈
    updateCommentContent: async (postId, user, commentId, entries) => {
        await prisma.comment.update({
            where: {
                user_id: user.users_id,
                post_id: postId,
                comments_id: commentId
            },
            data: { content: entries.content }
        })
    },

    fetchComments: async (postId) => {
        // there might be a limit parameter here to be considered later
        const comments = await prisma.comment.findMany({
            where: {
                    post_id: postId
                   }
        });
        return comments;
    },

    fetchAllComments: async () => {
        const allComments = await prisma.comment.findMany();
        return allComments;
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

        await prisma.comment.update({
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