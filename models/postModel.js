const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    createPost: async (entries, status, user) => {
        const post = await prisma.post.create({
            data: {
                content: entries.content,
                status: status,
                user_id: user.users_id,
                title: entries.title,
                excerpt: entries.excerpt,
                suggnsToPost: entries.suggestion ? [entries.suggestion] : [],
                readTime: +entries.timeRead,
                priority: entries.priority
            }
        });

        if (entries.suggestion) {
            await prisma.suggestedTopics.update({
                where: {
                    suggns_id: entries.suggestion
                },
                data: {
                    status: "ADDRESSED",
                    updatedAt: new Date(),
                    postsToSugg: [post.posts_id]
                }
            })
        }
        return post
    },

    deletePost: async ( postId, user ) => {
        const post = await prisma.post.findFirst({ where: { posts_id: postId } });
        if (post) {
            const comments = await prisma.comment.findMany({where: {post_id: postId}});
            await Promise.all(comments.map(async comment => await prisma.reply.deleteMany({where: {comment_id: comment.comments_id}})))
            await prisma.comment.deleteMany({where: {post_id: postId}});
            await prisma.post.delete({
                where: {
                    user_id: user.users_id,
                    posts_id: postId
                }
            });
            return post
        } else {
            return false
        }
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
                priority: entries.priority,
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
        const like_exists = post.likes.includes(user.users_id);
        const dislike_exists = post.dislikes.includes(user.users_id);

        const unliked = post.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = post.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...post.likes, user.users_id];
        const dislikes = dislike_exists ? undo_dislike : [...post.dislikes]

        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },

    dislikeUndoDislikePost: async (postId, user) => {
        const post = await prisma.post.findFirst({where:{posts_id: postId}})
        const dislike_exists = post.dislikes.includes(user.users_id);
        const like_exists = post.likes.includes(user.users_id);

        const unliked = post.likes.filter(likes => likes !== user.users_id)

        const undo_dislike = post.dislikes.filter(dislike => dislike !== user.users_id);

        const likes = like_exists ? unliked : [...post.likes];
        const dislikes = dislike_exists ? undo_dislike : [...post.dislikes, user.users_id]

        await prisma.post.update({
            where: {
                posts_id: postId
            },
            data: {
                likes: likes,
                dislikes: dislikes
            }
        })
    },

    fetchPosts: async (search="", page=1, limit=6) => {
        const currentPosts = await prisma.post.findMany({
            where: {
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit
        });

        const allPosts = await prisma.post.findMany({
            where: {
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ],
            }
        });

        return {
            currentPosts,
            allPosts
        };
    },


    fetchPublishedPosts: async (search="", page=1, limit=6) => {
        const currentPosts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit

        });
        const allPosts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ]
            }
        });
        return {
            currentPosts,
            allPosts
        };
    },

    fetchHighPriorityPosts: async (search="", page=1, limit=3) => {
        const current = await prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                priority: "HIGH"
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page - 1),
            take: limit
        })
        const allPosts = await prisma.post.findMany({ where: {status: "PUBLISHED", priority: "HIGH" }})
        return { current, allPosts }
    },

    // fetching a single post

    fetchSinglePost: async ( postId, user ) => {
        const post = await prisma.post.findFirst({where: {posts_id: postId}});
        const suggestions =
                (post && post.suggnsToPost.length > 0) ?
                    await Promise.all( post.suggnsToPost.map(sugg => prisma.suggestedTopics.findFirst({ where: { suggns_id: sugg } })))
                    : []
        if (post) {
            const viewed = post.views.includes(user.users_id);
            const views = viewed ? post.views : [...post.views, user.users_id];
            await prisma.post.update({
                where: { posts_id: postId },
                data: { views: views }
            })
            return {post, suggestions}
        } else {
            return false
        }
    },

    fetchSinglePubPost: async ( postId, user ) => {
        const post = await prisma.post.findFirst({
            where: {posts_id: postId, status: "PUBLISHED"}
        })
        const suggestions = post.suggnsToPost.length > 0 ?
            await Promise.all( post.suggnsToPost.map(sugg => prisma.suggestedTopics.findFirst({ where: { suggns_id: sugg } })))
            : [];

        if (post) {
            const viewed = post.views.includes(user.users_id);
            const views = viewed ? post.views : [...post.views, user.users_id];
            await prisma.post.update({
                where: { posts_id: postId },
                data: { views: views }
            })
            return {post, suggestions}
        } else {
            return false
        }
    },

    fetchUnpublishedPost: async (search="", page=1, limit=6) => {
        const currentPosts = await prisma.post.findMany({
            where: {
                status: "DRAFT",
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: limit * (page-1),
            take: limit
        });
        const allPosts = await prisma.post.findMany({
            where: {
                status: "DRAFT",
                OR: [
                    {content: {contains: search.trim(), mode: "insensitive"}},
                    {title: {contains: search.trim(), mode: "insensitive"}},
                    {excerpt: {contains: search.trim(), mode: "insensitive"}},
                ]
            }
        });
        return {
            currentPosts,
            allPosts
        };
    },

    fetchManyUsersWithAction: async (postId, action, page=1, limit=6) => {
        const post = await prisma.post.findFirst({ where: { posts_id: postId } });
        if (action === "likes") {
            const all = await Promise.all(post.likes.map(user => prisma.users.findFirst({ where: { users_id: user } })))
            const paginated = all.slice((page-1) * limit, (page * limit));
            return {all, paginated}
        }

        if (action === "dislikes") {
            const all = await Promise.all(post.dislikes.map(user => prisma.users.findFirst({ where: { users_id: user } })))
            const paginated = all.slice((page-1) * limit, (page * limit));
            return {all, paginated}
        }

        if (action === "views") {
            const all = await Promise.all(post.views.map(user => prisma.users.findFirst({ where: { users_id: user } })))
            const paginated = all.slice((page-1) * limit, (page * limit));
            return {all, paginated}
        }
    },

    fetchManyUsersWithActionOnComment: async (postId, commentId, action, page=1, limit=6) => {
        const comment = await prisma.comment.findFirst({
                where: {
                    post_id: postId,
                    comments_id: commentId
                }
            });
        if (action === "likes") {
            const all = await Promise.all(comment.likes.map(user => prisma.users.findFirst({ where: { users_id: user } })))
            const paginated = all.slice((page-1) * limit, (page * limit));
            return {all, paginated}
        }

        if (action === "dislikes") {
            const all = await Promise.all(comment.dislikes.map(user => prisma.users.findFirst({ where: { users_id: user } })))
            const paginated = all.slice((page-1) * limit, (page * limit));
            return {all, paginated}
        }

        if (action === "replies") {
            const replies = await prisma.reply.findMany( {
                 where: { comment_id: commentId },
                 orderBy: {createdAt: "desc"},
                 skip: limit * (page - 1),
                 take: limit
            } );

            const allReplies = await prisma.reply.findMany({ where: { comment_id: commentId } });

            return {replies, allReplies}
        }
    }
}
