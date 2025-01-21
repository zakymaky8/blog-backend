const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reply = require("../models/replyModel");
const User = require("../models/userModel");

const updatePost = async (req, res) => {
    const { postId } = req.params;
    const { action } = req.query;
    
    if (req.user && req.user.Role === "ADMIN" && action === "publish") {
        await Post.publishPost(postId)
        return res.sendStatus(200)
    } if (req.user && req.user.Role === "ADMIN" && action ==="unpublish") {
        await Post.unPublishPost(postId)
        return res.sendStatus(200)
    }
    if (req.user && action === "like_unlike") {
        await Post.likeUnlikePost(postId, req.user)
        return res.sendStatus(200)
    }
     if (req.user && req.user.Role === "ADMIN" && action === "update") {
        await Post.updatePostFromEdit(postId, req.body, action)
        return res.sendStatus(200)
    } else {
        return res.status(400).json({ message: "Invalid action or unauthorized user." });
      }

}


const updateComment = async (req, res) => {
    const {postId, commentId} = req.params;
    const { action } = req.query;

    if (req.user && action ==="like_unlike") {
        await Comment.likeUnlikeComment(postId, commentId, req.user)
        return res.sendStatus(200)
    }  if (req.user && action === "update_content") {
        await Comment.updateCommentContent(postId, req.user, commentId, req.body)
        return res.sendStatus(200)
    } else {
        return res.sendStatus(401)
    }
}

const updateReply = async (req, res) => {
    const {postId, commentId, replyId} = req.params;
    const  {action} = req.query;
    
    if (req.user && action ==="like_unlike") {
        await Reply.likeUnlikeReply(replyId, commentId, req.user)
        return res.sendStatus(200)
    }  if (req.user && action === "update_content") {
        await Reply.updateReply(req.user, commentId, req.body, replyId)
        return res.sendStatus(200)
    } else {
        return res.sendStatus(401)
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