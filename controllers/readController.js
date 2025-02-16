const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Reply = require("../models/replyModel");
const { json } = require("body-parser");

const allPublishedPostsGet = async (req, res) => {
    const posts  = await Post.fetchPublishedPosts();
    if (!req.user) {
        return res
                .status(401)
                .json({ success: false, message: "Missing credential, Login first!", posts: null })
    }
    return res
            .status(200)
            .json({success: true, message: "Successfull!", posts: posts})
}

const allPostsForAdminGet = async (req, res) => {
    if ( req.user && req.user.Role === "ADMIN") {
        const posts = await Post.fetchPosts();

        if (posts.length) {
            return res
                    .status(200)
                    .json({success: true, message: "Successfull!", data: {posts}})
        }

    } else if (res.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({success: false, message: "Access Denied!", data: { posts: null }})

    } else {
        return res.status(401).json({success: false, message: "Please login first!", data: { posts: null }})
    }
}

const unpublishedPostsGet = async (req, res) => {

    if (req.user && req.user.Role === "ADMIN") {
        const posts = await Post.fetchUnpublishedPost();
        return res
                 .status(200)
                 .json({success: true, message: "Successful!", data: {drafts: posts}})
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

    const post  =
            (req.user && req.user.Role === "ADMIN") ?
            await Post.fetchSinglePost(req.params.postId) :
            (req.user && req.user.Role === "USER") ?
            await Post.fetchSinglePubPost(req.params.postId) : false

    if (post) {
        const author = await User.fetchSingleUser(post.user_id);
        return res
                .status(200)
                .json({success: true, message: "Successfull!", data: {post, author, currentUser: req.user}})

    } else {
        return res
                .status(404)
                .json({success: false, message: "The post was whether not found or deleted or unpublished!", data: null})
    }
}


const commentsFetchGet = async (req, res) => {
    const { postId } = req.params;

    const comments = await Comment.fetchComments(postId);
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
                .json({ success: true, message: "Successfull!", data: {comments, authors, currentUser: req.user, replies, replyActorPairs}})
    }
    return res
            .status(200)
            .json({ success: true, message: "No comment!", data: {comments, authors: [], currentUser: req.user, replies: [], replyActorPairs: []}})
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
        return res
                .status(200)
                .json({success: true, message: "Successful!", data: {user, likedPosts, paired}})
    }

    if (!user) {
        return res
                .status(404)
                .json({success: false, message: "User wasn't found!", data: { user: null, likedPosts: null, paired: null }})
    }

    if (req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Access Denied!", data: { user: null, likedPosts: null, paired: null } })
    }
}

module.exports = {
    allPublishedPostsGet,
    singlePostGet,
    commentsFetchGet,
    allPostsForAdminGet,
    unpublishedPostsGet,
    singleUserGet,
    getSingleUserActivities
}