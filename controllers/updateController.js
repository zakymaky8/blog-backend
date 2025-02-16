const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reply = require("../models/replyModel");
const User = require("../models/userModel");



const updatePost = async (req, res) => {

    const { postId } = req.params;
    const { action } = req.query;

    const allowedActions = ["publish", "unpublish", "like_unlike", "update"]

    if (req.user && req.user.Role === "ADMIN" && action === "publish") {
        await Post.publishPost(postId)
        return res
                .status(200)
                .json({ success: true, message: "Post successfully published!" })
    }

    if (req.user && req.user.Role === "ADMIN" && action ==="unpublish") {
        await Post.unPublishPost(postId)
        return res
                .status(200)
                .json({ success: true, message: "Post successfully unpublished!" })
    }

    if (req.user && action === "like_unlike") {
        await Post.likeUnlikePost(postId, req.user)
        return res
                .status(200)
                .json({ success: true, message: "Successful!" })
    }

    if (req.user && req.user.Role === "ADMIN" && action === "update") {
        await Post.updatePostFromEdit(postId, req.body, action)
        return res
                .status(200)
                .json({ success: true, message: "Post successfully Updated!" })
    }

    else if (req.user && req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Access to this action is not granted!" });
    }

    else if (!allowedActions.includes(action)) {
        return res
                .status(406)
                .json({ success: false, message: "Request includes unacceptable action!" })
    }
    return res.status(400).json({ success: false, message: "Invalid action!" });

}


const updateComment = async (req, res) => {
    const {postId, commentId} = req.params;
    const { action } = req.query;

    const allowedActions = ["like_unlike", "update_content"];
    const comment = await Comment.fetchByCommentId(commentId);

    if (req.user && action ==="like_unlike") {
        const comment = await Comment.likeUnlikeComment(postId, commentId, req.user)
        return res
                .status(200)
                .json({ success: true, message: "Successful!", comment})
    }

    if (req.user && action === "update_content" && comment.user_id === req.user.users_id) {
        const comment = await Comment.updateCommentContent(postId, req.user, commentId, req.body)
        return res
                .status(200)
                .json({ success: true, message: "Comment Successfully Updated!", comment})
    }

    if (!allowedActions.includes(action)) {
        return res
                .status(406)
                .json({ success: false, message: "Request includes unacceptable action!", comment: null })
    }

    if (comment.user_id !== req.user.users_id && action === "update_content") {
        return res
                 .status(403)
                 .json({ success: false, message: "Action not allowed!", comment: null })
    }
    else {
        return res
                .status(400)
                .json({ success: false, message: "Invalid action!", comment: null });
    }
}

const updateReply = async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const  { action } = req.query;

    const allowedActions = ["like_unlike", "update_content"];
    const reply = await Reply.fetchSingleReply(replyId)

    if (req.user && action ==="like_unlike") {
        const reply = await Reply.likeUnlikeReply(replyId, commentId, req.user)
        return res
                .status(200)
                .json({ success: true, message: "Successful!", reply })
    }

    if (req.user && action === "update_content" && reply.user_id === req.user.users_id) {
        const reply = await Reply.updateReply(req.user, commentId, req.body, replyId)
        return res
                .status(200)
                .json({ success: true, message: "Reply Successfully Updated!", reply})
    }

    if (req.user && action === "update_content" && reply.user_id !== req.user.users_id) {
        return res
                .status(403)
                .json({ success: false, message: "Action not allowed!", reply: null})
    }

    if (!allowedActions.includes(action)) {
        return res
                .status(406)
                .json({ success: false, message: "Request includes unacceptable action!", reply: null})
    }

    else {
        return res
                .status(400)
                .json({ success: false, message: "Invalid action!", reply: null});
    }
}


const updateUserPwdPut = async (req, res) => {
    const updated = await User.changePassword(req.user, req.body);
    if (updated) {
        res.json({message: "Password changed successfully"})
    } else {
        res.status(401).json({ error: "May be you've forgotten the old one!" })
    }
}

module.exports = {
    updatePost,
    updateComment,
    updateReply,
    updateUserPwdPut
}