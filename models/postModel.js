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
                title: entries.title
            }
        })
    },

    deletePost: async ( postId, user ) => {
        await prisma.comment.deleteMany({where: {post_id: postId}});
        await prisma.post.delete({
            where: {
                user_id: user.users_id,
                posts_id: postId
            }
        });
    },
    // update post regardless of the user
    updatePostFromEdit: async (postId, entries, status) => {
        // const post = await prisma.comment.findFirst({
        //     where: {
        //         posts_id: postId
        //     }
        // })
        await prisma.post.update({
            where: {
                // user_id: user.users_id,
                posts_id: postId
            },
            data: {
                content: entries.content,
                // likes: post.likes + 1,
                title: entries.title,
                lastUpdate: new Date(),
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
    // likePost: async (postId, user) => {
    //     const post = await prisma.post.findFirst({where:{posts_id: postId}})
    //     await prisma.post.update({
    //         where: {
    //             posts_id: postId
    //         },
    //         data: {
    //             likes: post.likes.push(user.users_id)
    //         }
    //     })
    // },
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
    //  fetching all posts regardless of which user

    fetchPosts: async () => {
        const posts = await prisma.post.findMany();
        return posts;
    },

    fetchPublishedPosts: async () => {
        const posts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED"
            }
        });
        return posts;
    },
    // fetching a single post

    fetchSinglePost: async ( postId ) => {
        const post = await prisma.post.findFirst({
            where: {
                posts_id: postId
            }
        })
        return post
    },

    fetchUnpublishedPost: async () => {
        const drafts = await prisma.post.findMany({
            where: {status: "DRAFT"}
        });
        return drafts;
    }
}
