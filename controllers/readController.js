const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Reply = require("../models/replyModel");
const Suggestion = require("../models/suggestModel");

const allPublishedPostsGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }
    const { allPosts, currentPosts } = await Post.fetchPublishedPosts(search ? search : "", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                posts: currentPosts,
                meta: {
                items_per_page: limit ? +limit : 6,
                current_page_items: currentPosts.length,
                current_page: page ? +page : 1,
                total_items: allPosts.length,
                total_pages: Math.ceil(allPosts.length / (limit ?  +limit : 6))
                }
            })
}

const highPriorityPostsGet = async (req, res) => {
    const { search, page, limit } = req.query;
    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }
    const { allPosts, current } = await Post.fetchHighPriorityPosts(search ? search : "", page ? +page : 1, limit ? +limit : 3);
    return res
    .status(200)
    .json({
           success: true,
           message: "Successfull!",
           posts: current,
           meta: {
            items_per_page: limit ? +limit : 3,
            current_page_items: current.length,
            current_page: page ? +page : 1,
            total_items: allPosts.length,
            total_pages: Math.ceil(allPosts.length / (limit ?  +limit : 3))
           }
        })
}

const allPostsForAdminGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if ( req.user && req.user.Role === "ADMIN") {
        const { allPosts, currentPosts } = await Post.fetchPosts(search ? search : "", page ? +page : 1, limit ? +limit : 6);
        return res
                .status(200)
                .json({
                    success: true,
                    message: "Successfull!",
                    data: {
                        posts: currentPosts
                    },
                    meta: {
                        items_per_page: limit ? +limit : 6,
                        current_page_items: currentPosts.length,
                        current_page: page ? +page : 1,
                        total_items: allPosts.length,
                        total_pages: Math.ceil(allPosts.length / (limit ?  +limit : 6))
                    }
                })

    } else if (res.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({success: false, message: "Access Denied!", data: { posts: null }, meta: null})

    } else {
        return res.status(401).json({success: false, message: "Please login first!", data: { posts: null }, meta: null})
    }
}

const unpublishedPostsGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if (req.user && req.user.Role === "ADMIN") {
        const {allPosts, currentPosts} = await Post.fetchUnpublishedPost(search ? search : "", page ? +page : 1, limit ? +limit : 6);
        return res
                 .status(200)
                 .json({
                    success: true,
                    message: "Successful!",
                    data: {
                        drafts: currentPosts
                    },
                    meta: {
                        items_per_page: limit ? +limit : 6,
                        current_page_items: currentPosts.length,
                        current_page: page ? +page : 1,
                        total_items: allPosts.length,
                        total_pages: Math.ceil(allPosts.length / (limit ?  +limit : 6))
                        }
                    })
    }

    if (req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({success: false, message: "Access Denied!", data: {drafts: null}})
    }

    else {
        return res
                .status(401)
                .json({success: false, message: "Authentication failed, please login!", data: {drafts: null}})
    }
}



const singlePostGet = async (req, res) => {

    const {post, suggestions}  =
            (req.user && req.user.Role === "ADMIN") ?
            await Post.fetchSinglePost(req.params.postId, req.user) :
            (req.user && req.user.Role === "USER") ?
            await Post.fetchSinglePubPost(req.params.postId, req.user) : false

    if (post) {
        const author = await User.fetchSingleUser(post.user_id);
        return res
                .status(200)
                .json({success: true, message: "Successfull!", data: {post, author, currentUser: req.user, suggestions}})

    } else {
        return res
                .status(404)
                .json({success: false, message: "The post was whether not found or deleted or unpublished!", data: null})
    }
}


const commentsFetchGet = async (req, res) => {
    const { postId } = req.params;

    const page = req.query.page && !isNaN(+req.query.page) ? +req.query.page : undefined
    const limit = req.query.limit && !isNaN(+req.query.limit) ? +req.query.limit : undefined

    const {comments, allComments} = await Comment.fetchComments(postId, req.query.search, page, limit);

    if (comments.length) {
        const authors =  await Promise.all(comments.map(async comment => await User.fetchSingleUser(comment.user_id)));
        const repliesArray = await Promise.all(comments.map(async comment => await Reply.getRepliesPerComment(comment.comments_id)))
        const replies = repliesArray.flat();
        const replyActorPairs = await Promise.all(replies.map(async reply =>{
            return {
                replier: await User.fetchSingleUser(reply.user_id),
                replied_to: await User.fetchSingleUser(reply.replied_id)
            }
        } ))
        return res
                .status(200)
                .json({
                    success: true,
                    message: "Successfull!",
                    data: {comments, totalComments: allComments.length, authors, currentUser: req.user, replies, replyActorPairs},
                    meta: {
                        items_per_page: limit ? +limit : 8,
                        current_page_items: comments.length,
                        current_page: page ? +page : 1,
                        total_items: allComments.length,
                        total_pages: Math.ceil(allComments.length / (limit ? +limit : 8))
                    }
                })
    }
    return res
            .status(200)
            .json({ success: true, message: "No comment!", data: {comments, authors: [], currentUser: req.user, replies: [], replyActorPairs: []},
                meta: {
                    items_per_page: limit ? +limit : 8,
                    current_page_items: comments.length,
                    current_page: page ? +page : 1,
                    total_items: allComments.length,
                    total_pages: Math.ceil(allComments.length / (limit ? +limit : 8))
                }})
}

const singleUserGet = async (req, res) => {
    const { userId } = req.params;

    const user = await User.fetchSingleUser(userId)

    if (user && req.user && req.user.Role === "ADMIN") {
        return res
                .status(200)
                .json({success: true, message: "Successful!", data: { user }})
    }
    else if (!user) {
        return res
                .status(404)
                .json({success: false, message: "Account Terminated or Deleted!", data: { user: null }})

    }
    else if (req.user && req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({success: false, message: "Access Denied!", data: {user: null}})
    }
    else {
        return res
                 .status(401)
                 .json({success: false, message: "Please Login!", data: { user: null }})
    }
}



const getSingleUserActivities = async (req, res) => {
    const { userId } = req.params;

    const user = await User.fetchSingleUser(userId);

    if (user && req.user && req.user.Role === "ADMIN") {
        const likedPosts = await User.getLikedPosts(userId);
        const paired = await User.getCommentsAndTheirPosts(userId);
        const dislikedPosts = await User.getDislikedPostsBySingleUser(userId)
        const viewedPosts = await User.getViewedPostsBySingleUser(userId)
        return res
                .status(200)
                .json({success: true, message: "Successful!", data: {user, likedPosts, paired, dislikedPosts, viewedPosts}})
    }

    if (!user) {
        return res
                .status(404)
                .json({success: false, message: "User wasn't found!", data: { user: null, likedPosts: null, paired: null, dislikedPosts: null, viewedPosts: null }})
    }

    if (req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Access Denied!", data: { user: null, likedPosts: null, paired: null, dislikedPosts: null, viewedPosts: null } })
    }
}


const allUsersGet = async (req, res) => {

    const { page, search, limit } = req.query;

    if (req.user && req.user.Role === "ADMIN") {
        const {users, allUsers} = await User.fetchAllUsers(page ? + page : 1, search ? search : "", limit ? +limit : 6);
        return res
                .status(200)
                .json({
                        success: true,
                        message: "Successful!",
                        data: { users },
                        meta: {
                            items_per_page: limit ? +limit : 6,
                            current_page_items: users.length,
                            current_page: page ? +page : 1,
                            total_items: allUsers.length,
                            total_pages: Math.ceil(allUsers.length / (limit ? +limit : 6))
                        }

                    })
    } if ( req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Action Denied!", data: { users: null } })
    }
     else {
        return res
                 .status(401)
                 .json({ success: false, message: "Please login!", data: { users: null }})
     }
}



const allSuggestionsGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }

    const { allSugg, suggestions, users } = await Suggestion.getAllSuggestions(search ? search : "", page ? +page : 1, limit ? +limit : 4);

    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                suggestions: suggestions,
                users,
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: suggestions.length,
                    current_page: page ? +page : 1,
                    total_items: allSugg.length,
                    total_pages: Math.ceil(allSugg.length / (limit ?  +limit : 4))
                }
            })
}


const singleSuggestionGet = async (req, res) => {
    const { suggId } = req.params;
    const { suggestion, user } = await Suggestion.fetchSingleSuggestion(suggId)
    return res
            .status(200)
            .json({ success: true, message: "Successful!", data: { suggestion, user } })
}

const onesSuggestionsGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }

    const { allSugg, suggestions, user } = await Suggestion.getSelfSuggestions(req.user.users_id, search ? search : "", page ? +page : 1, limit ? +limit : 4);

    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                suggestions: suggestions,
                user,
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: suggestions.length,
                    current_page: page ? +page : 1,
                    total_items: allSugg.length,
                    total_pages: Math.ceil(allSugg.length / (limit ?  +limit : 4))
                }
            })
}


const othersSuggestionsGet = async (req, res) => {

    const { search, page, limit } = req.query;

    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }

    const { allSugg, suggestions, users } = await Suggestion.getOthersSuggestions(req.user.users_id, search ? search : "", page ? +page : 1, limit ? +limit : 4);

    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                suggestions: suggestions,
                users,
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: suggestions.length,
                    current_page: page ? +page : 1,
                    total_items: allSugg.length,
                    total_pages: Math.ceil(allSugg.length / (limit ?  +limit : 4))
                }
            })
}



const postLikesGet = async (req, res) => {
    const { postId } = req.params;
    const { page, limit } = req.query;

    const { all, paginated } = await Post.fetchManyUsersWithAction(postId, "likes", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                    success: true,
                    message: "Successfull!",
                    data: { users: paginated },
                    meta: {
                        items_per_page: limit ? +limit : 4,
                        current_page_items: paginated.length,
                        current_page: page ? +page : 1,
                        total_items: all.length,
                        total_pages: Math.ceil(all.length / (limit ?  +limit : 4))
                    }
                })
}

const postDislikesGet = async (req, res) => {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const { all, paginated } = await Post.fetchManyUsersWithAction(postId, "dislikes", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                data: { users: paginated },
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: paginated.length,
                    current_page: page ? +page : 1,
                    total_items: all.length,
                    total_pages: Math.ceil(all.length / (limit ?  +limit : 4))
                }
            })

}
const postViewsGet = async (req, res) => {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const { all, paginated } = await Post.fetchManyUsersWithAction(postId, "views", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                data: { users: paginated },
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: paginated.length,
                    current_page: page ? +page : 1,
                    total_items: all.length,
                    total_pages: Math.ceil(all.length / (limit ?  +limit : 4))
                }
            })
}





const commentLikesGet = async (req, res) => {
    const { postId, commentId } = req.params;
    const { page, limit } = req.query;

    const { all, paginated } = await Post.fetchManyUsersWithActionOnComment(postId, commentId, "likes", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                    success: true,
                    message: "Successfull!",
                    data: { users: paginated },
                    meta: {
                        items_per_page: limit ? +limit : 4,
                        current_page_items: paginated.length,
                        current_page: page ? +page : 1,
                        total_items: all.length,
                        total_pages: Math.ceil(all.length / (limit ?  +limit : 4))
                    }
                })
}

const commentDislikesGet = async (req, res) => {
    const { postId, commentId } = req.params;
    const { page, limit } = req.query;
    const { all, paginated } = await Post.fetchManyUsersWithActionOnComment(postId, commentId, "dislikes", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                data: { users: paginated },
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: paginated.length,
                    current_page: page ? +page : 1,
                    total_items: all.length,
                    total_pages: Math.ceil(all.length / (limit ?  +limit : 4))
                }
            })

}
const commentRepliesGet = async (req, res) => {
    const { postId, commentId } = req.params;
    const { page, limit } = req.query;
    const { replies, allReplies } = await Post.fetchManyUsersWithActionOnComment(postId, commentId, "replies", page ? +page : 1, limit ? +limit : 6);
    return res
            .status(200)
            .json({
                success: true,
                message: "Successfull!",
                data: { replies: replies },
                meta: {
                    items_per_page: limit ? +limit : 4,
                    current_page_items: replies.length,
                    current_page: page ? +page : 1,
                    total_items: allReplies.length,
                    total_pages: Math.ceil(allReplies.length / (limit ?  +limit : 4))
                }
            })
}


module.exports = {
    allPublishedPostsGet,
    singlePostGet,
    commentsFetchGet,
    allPostsForAdminGet,
    unpublishedPostsGet,
    singleUserGet,
    getSingleUserActivities,
    allUsersGet,
    highPriorityPostsGet,
    allSuggestionsGet,
    onesSuggestionsGet,
    othersSuggestionsGet,
    singleSuggestionGet,
    postLikesGet,
    postDislikesGet,
    postViewsGet,
    commentLikesGet,
    commentRepliesGet,
    commentDislikesGet,
}