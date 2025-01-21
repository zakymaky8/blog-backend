const Post = require("../models/postModel")
const Comment = require("../models/commentModel")
const Reply = require("../models/replyModel")
const User = require("../models/userModel")

const postDeletePost = async (req, res) => {
    if (req.user && req.user.Role === "ADMIN") {
        const  { postId } = req.params
        await Post.deletePost(postId, req.user)
        return res.sendStatus(200)
    }
    return res.sendStatus(403)
}


const commentDeletePost = async (req, res) => {
    const  { postId, commentId } = req.params;

    if (req.user && req.user.Role === "ADMIN") {
        await Comment.deleteSingleCommentByAdmin(postId, commentId)
        return res.sendStatus(200)
    } if (req.user && req.user.Role === "USER") {
        await Comment.deleteCommentByUser(postId, commentId, req.user)
        return res.sendStatus(200)
    } else {
        return res.sendStatus(401)
    }

}

const deleteReply = async (req, res) => {
    const  { postId, commentId, replyId } = req.params;

    if (req.user && req.user.Role === "ADMIN") {
        await Reply.deleteReplyByAdmin(replyId, commentId)
        return res.sendStatus(200)
    } if (req.user && req.user.Role === "USER") {
        await Reply.deleteReplyByReplier(replyId, commentId,req.user)
        return res.sendStatus(200)
    } else {
        return res.sendStatus(401)
    }

}

const deleteOneUser = async (req, res) => {
    const { userId } = req.params;
    const { action } = req.query;
    if (req.user && action === "delete-account" && (req.user.users_id === userId || req.user.Role === "ADMIN")) {
        await User.deleteSingleUser(userId)
        return res.sendStatus(200)
    }
    return res.sendStatus(404)
}


module.exports = {
    postDeletePost,
    commentDeletePost,
    deleteReply,
    deleteOneUser
}