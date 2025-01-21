const Comment = require("../models/commentModel");
const Post = require("../models/postModel")
const Reply = require("../models/replyModel")
const User = require("../models/userModel")

const postCreatePost = async (req, res) => {
    const { status } = req.query;
    if (req.user && req.user.Role === "ADMIN") {
        await Post.createPost(req.body, status, req.user);
        res.sendStatus(200)
    } else {
        return res.status(403).json({error: "login first"})
    }
}

const commentCreatePost = async (req, res) => {

    const { postId } = req.params;

    if (req.user) {
        await Comment.createCommentByUser(postId, req.body, req.user);
        return res.sendStatus(200)
    } else {
        res.sendStatus(401)
    }
}
const replyCreatePost = async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const { action } = req.query;
    
    if (req.user && action === "to_comment") {
        const comment = await Comment.getOneCommentWithNoUser(commentId);
        const repliedCommentAuthor = await User.fetchSingleUser(comment.user_id) 
        await Reply.createReply(req.body, commentId, req.user, repliedCommentAuthor.users_id, undefined)
        return res.sendStatus(200)
        
    } else if (req.user && action === "to_reply") {
        const reply = await Reply.fetchSingleReply(replyId); //reply
        const repliedReplyAuthor = await User.fetchSingleUser(reply.user_id) //by reply id now
        await Reply.createReply(req.body, commentId, req.user, undefined, repliedReplyAuthor.users_id)
        return res.sendStatus(200)
    }
}


module.exports = {
    postCreatePost,
    commentCreatePost,
    replyCreatePost
}