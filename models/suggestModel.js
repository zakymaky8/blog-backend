const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient()


module.exports = {
    getAllSuggestions: async (search="", page=1, limit=4) => {
        const suggestions = await prisma.suggestedTopics.findMany({
            where: {
                OR: [
                    { content: { contains: search.trim(), mode: "insensitive" } }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit
        });

        const allSugg = await prisma.suggestedTopics.findMany({where: { content: { contains: search.trim(), mode: "insensitive" } }});
        const users = await Promise.all(allSugg.map(sug => prisma.users.findFirst({where: {users_id: sug.user_id}})));

        let singled = [];
        for (const user of users) {
            if (singled.every(item => item.users_id !== user.users_id)) {
                singled.push(user)
            } continue
        }

        return { suggestions, allSugg, users: singled }
    },

    getSelfSuggestions: async (userId, search="", page=1, limit=4) => {
        const suggestions = await prisma.suggestedTopics.findMany({
            where: {
                user_id: userId,
                OR: [
                    { content: { contains: search.trim(), mode: "insensitive" } }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit
        });

        const allSugg = await prisma.suggestedTopics.findMany({ where: { user_id: userId, content: { contains: search.trim(), mode: "insensitive" }}});
        const user = await prisma.users.findFirst({where: { users_id: userId }});

        return { suggestions, allSugg, user }
    },

    getOthersSuggestions: async (userId, search="", page=1, limit=4) => {
        const suggestions = await prisma.suggestedTopics.findMany({
            where: {
                user_id: { not: userId },
                status: "ADDRESSED",
                OR: [
                    { content: { contains: search.trim(), mode: "insensitive" } }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit
        });

        const allSugg = await prisma.suggestedTopics.findMany({ where: { user_id: { not: userId }, status: "ADDRESSED", content: { contains: search.trim(), mode: "insensitive" }}});
        console.log(allSugg.length)
        const users = await Promise.all(allSugg.map(async sug => await prisma.users.findFirst({where: {users_id: sug.user_id}})));

        let singled = [];
        for (const user of users) {
            if (singled.every(item => item.users_id !== user.users_id)) {
                singled.push(user)
            } continue
        }
        return { suggestions, allSugg, users: singled };
    },

    getSuggestionsByUser: async (userId) => {
        return await prisma.suggestedTopics.findMany({where: { user_id: userId }, orderBy: { createdAt: "desc" }})
    },


    updateSuggestions: async (sugg_id, entries) => {
        await prisma.suggestedTopics.update({
            where: {
                suggns_id: sugg_id
            },
            data: {
                content: entries.content,
                isVisible: entries.visibility === "show" ? true : false,
                priority: entries.priority,
                updatedAt: new Date()
            }
        })
    },

    updateSuggestionStatus: async (sugId, status) => {
        await prisma.suggestedTopics.update({
            where: {suggns_id: sugId},
            data: {
                status: status.toUpperCase(),
                updatedAt: new Date()
            }
        })
    },

    updateSuggToPostToSugg: async (body) => {
        const post = await prisma.post.findFirst({ where: { posts_id: body.postId } });
        const suggsToPost = post.suggnsToPost.includes(body.suggId) ? post.suggnsToPost : [...post.suggnsToPost, body.suggId];
        await prisma.post.update({
            where: {posts_id: post.posts_id},
            data: { suggnsToPost: suggsToPost }
        })
        await prisma.suggestedTopics.update({
            where: { suggns_id: body.suggId },
            data: {
                    postsToSugg: [body.slug],
                    status: "ADDRESSED"
                }
        })
    },

    deleteSuggestions: async (sugg_id, user) => {
        if (user.Role === "ADMIN") {
            return await prisma.suggestedTopics.delete({where: {suggns_id: sugg_id}});
        }
        return await prisma.suggestedTopics.delete({ where: { suggns_id: sugg_id, user_id: user.users_id } })
    },

    createSuggestions: async (user, entries) => {
        await prisma.suggestedTopics.create({
            data: {
                content: entries.content,
                isVisible: entries.visibility === "show" ? true : false,
                priority: entries.priority,
                user_id: user.users_id,
            }
        })
    },

    fetchSingleSuggestion: async (suggId) => {
        const suggestion =  prisma.suggestedTopics.findFirst({ where: { suggns_id: suggId } })
        const user = await prisma.users.findFirst({ where: { users_id: suggestion.user_id } })

        return { suggestion, user }
    }
}

// module.exports.createSuggestions()