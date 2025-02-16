const Post = require("../models/postModel")
const Comment = require("../models/commentModel")
const Reply = require("../models/replyModel")
const User = require("../models/userModel")

const deleteSinglePost = async (req, res) => {
    if (req.user && req.user.Role === "ADMIN") {
        const  { postId } = req.params
        const post = await Post.deletePost(postId, req.user);
        if (post) {
            return res
                    .status(200)
                    .json({ success: true, message: "Post deleted successfully!", post })
        } else {
            res
              .status(404)
              .json({success: false, message: "Post wasn't originally found!", post: null})
        }
    }
    return res.status(403).json({ success: false, message: "Action Denied!", post: null })
}


const commentDeletePost = async (req, res) => {
    const  { postId, commentId } = req.params;

    if (req.user && req.user.Role === "ADMIN") {
        const comment = await Comment.deleteSingleCommentByAdmin(postId, commentId);
        if (comment) {
            return res
                     .status(200)
                     .json({ success: true, message: "Comment successfully deleted!", comment})
        } else {
               res
                .status(404)
                .json({success: false, message: "Comment wasn't originally found!", comment: null})
        }

    }

    if (req.user && req.user.Role === "USER") {
        const comment = await Comment.deleteCommentByUser(postId, commentId, req.user)
        if (comment) {
            return res
                     .status(200)
                     .json({ success: true, message: "Comment successfully deleted!", comment})
        } else {
               return res
                        .status(404)
                        .json({success: false, message: "Comment wasn't originally found!", comment: null})
        }
    }

    return res.status(400).json({success: false, message: "Invalid action!", comment: null})

}

const deleteReply = async (req, res) => {
    const  { postId, commentId, replyId } = req.params;

    if (req.user && req.user.Role === "ADMIN") {

        const reply = await Reply.deleteReplyByAdmin(replyId, commentId);
        if (reply) {
            return res
                    .status(200)
                    .json({ success: true, message: "Reply successfully deleted!", reply})
        }
        else {
            return res
                    .status(404)
                    .json({success: false, message: "Reply wasn't originally found!", reply: null})
        }
    }
    
    if (req.user && req.user.Role === "USER") {
        const reply = await Reply.deleteReplyByReplier(replyId, commentId,req.user)
        if (reply) {
            return res
                    .status(200)
                    .json({ success: true, message: "Reply successfully deleted!", reply})
        }
        else {
            return res
                    .status(404)
                    .json({success: false, message: "Reply wasn't originally found!", reply: null})
        }
    }
    return res.status(400).json({success: false, message: "Invalid action!", reply: null})
}


const deleteOneUser = async (req, res) => {
    const { userId } = req.params;
    if (req.user && (req.user.users_id === userId || req.user.Role === "ADMIN")) {
        const deletionData = await User.deleteSingleUser(userId);
        if (deletionData) {
            return res
                     .status(200)
                     .json({ success: true, message: "Account Deleted successfully!", data: {...deletionData} })
        }
        return res
                 .status(404)
                 .json({ success: false, message: "The user originally wasn't found!", data: { deletedReplies: null, deletedComments: null, deletedUser: null } })
    }
    else if (req.user && (req.user.users_id !== userId && req.user.Role !== "ADMIN")) {
        return res
                .status(403)
                .json({ success: false, message: "Access denied!", data: { deletedReplies: null, deletedComments: null, deletedUser: null } })
    }
    return res
            .status(401)
            .json({ success: false, message: "Please Login!", data: {deletedReplies: null, deletedComments: null, deletedUser: null} })
}


module.exports = {
    deleteSinglePost,
    commentDeletePost,
    deleteReply,
    deleteOneUser
}