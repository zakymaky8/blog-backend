require("dotenv").config()
const bcrypt = require("bcrypt")

const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    // some pwd confimation, user exist and other validations goes here
    createUser: async (entries) => {
        console.log(entries);
        
        await prisma.users.create({
            data:  {
                firstname: entries.firstname,
                lastname: entries.lastname,
                password: await bcrypt.hash(entries.password, 10),
                username: entries.username,
                Role: "USER"
            }
        })
    },
    createAdmin: async (entries) => {
        await prisma.users.create({
            data:  {
                firstname: entries.firstname,
                lastname: entries.lastname,
                password: await bcrypt.hash(entries.password, 10),
                username: entries.username,
                Role: "ADMIN"
            }
        })
    },
    fetchAllUsers: async () => {
        const users = await prisma.users.findMany();
        return users;
    },

    fetchSingleUser: async (userId) => {
        const user = await prisma.users.findFirst({
            where: {
                users_id: userId
            }
        })
        if (!user) {
            return false
        }

        return user;
    },
    changePassword: async (user, entry) => {
        const originalUser = await prisma.users.findFirst({where: {users_id: user.users_id}})
        const matches = await bcrypt.compare(entry.oldpwd, originalUser.password)
        if (matches) {
            await prisma.users.update({
                where: {
                    users_id: user.users_id,
                },
                data: {
                    password: await bcrypt.hash(entry.newpwd, 10)
                }
            })
            return true
        }
        else {
            return false
        }
    },

    deleteSingleUser: async (userId) => {

        await prisma.reply.deleteMany({where: {user_id: userId}}) //delete all replies by the deleted user

        const comments = await prisma.comment.findMany({where: {user_id: userId}});
        await Promise.all(comments.map(async comment => await prisma.reply.deleteMany({where: {comment_id: comment.comments_id}})));
        await prisma.comment.deleteMany({where: {user_id: userId}})

        await prisma.users.delete({
            where: {
                users_id: userId
            }
        })

    },

    getLikedPosts: async (userId) => {
        const likedPosts =  await prisma.post.findMany({
            where: {
                likes: {
                    has: userId
                }
            }
        })

        return likedPosts
    },

    getCommentsAndTheirPosts: async (userId) => {
        const comments = await prisma.comment.findMany({where: {user_id: userId}})

        const paired = comments ? await Promise.all(comments.map(async comment => {
            return {
                comment: comment,
                post: await prisma.post.findFirst({where: {posts_id: comment.post_id}})
            }
        })) : null
        return paired

    }
}

// module.exports.getCommentsAndTheirPosts("3bbaa75c-3b45-4fc4-9a78-19b71b2b5e2d")