const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();



// there might be a limit parameter here to be considered later
//  with single user consideration if there are some updates on
//  peoples flexibility to even create post of there own user
// parameter will be passed here

module.exports = {
    createPost: async (entries, status, user) => {
        await prisma.post.create({
            data: {
                content: entries.content,
                status: status,
                user_id: user.users_id,
                title: entries.title,
                excerpt: entries.excerpt,
                readTime: +entries.timeRead
            }
        })
    },

    deletePost: async ( postId, user ) => {

        const comments = await prisma.comment.findMany({where: {post_id: postId}});
        await Promise.all(comments.map(async comment => await prisma.reply.deleteMany({where: {comment_id: comment.comments_id}})))
        await prisma.comment.deleteMany({where: {post_id: postId}});
        await prisma.post.delete({
            where: {
                user_id: user.users_id,
                posts_id: postId
            }
        });
    },
    // update post regardless of the user
    updatePostFromEdit: async (postId, entries) => {
        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                content: entries.content,
                title: entries.title,
                excerpt: entries.excerpt,
                readTime: +entries.timeRead,
                lastUpdate: new Date(),
                isUpdated: true
            }
        })
    },

    publishPost: async (postId) => {
        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                status: "PUBLISHED"
            }
        })
    },
    unPublishPost: async (postId) => {
        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                status: "DRAFT"
            }
        })
    },

    likeUnlikePost: async (postId, user) => {
        const post = await prisma.post.findFirst({where:{posts_id: postId}})
        const exists = post.likes.includes(user.users_id)
        const unliked = post.likes.filter(likes => likes !== user.users_id)
        const liked = [...post.likes, user.users_id]
        const likes = exists ? unliked : liked

        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                likes: likes
            }
        })
    },

    fetchPosts: async () => {
        const posts = await prisma.post.findMany();
        return posts.sort((a, b) => b.lastUpdate - a.lastUpdate);
    },

    fetchPublishedPosts: async () => {
        const posts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED"
            }
        });
        return posts.sort((a, b) => b.createdAt - a.createdAt);
    },
    // fetching a single post

    fetchSinglePost: async ( postId ) => {
        const post = await prisma.post.findFirst({
            where: {
                posts_id: postId
            }
        })
        if (post) {
            return post
        } else {
            return false
        }
    },

    fetchSinglePubPost: async ( postId ) => {
        const post = await prisma.post.findFirst({
            where: {
                posts_id: postId,
                status: "PUBLISHED"
            }
        })
        if (post) {
            return post
        } else {
            return false
        }
    },

    fetchUnpublishedPost: async () => {
        const drafts = await prisma.post.findMany({
            where: {status: "DRAFT"}
        });
        return drafts;
    }
}
