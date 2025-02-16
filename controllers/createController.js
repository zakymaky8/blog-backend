const Comment = require("../models/commentModel");
const Post = require("../models/postModel")
const Reply = require("../models/replyModel")
const User = require("../models/userModel")


const postCreatePost = async (req, res) => {
    const { status } = req.query;

    const allowedStatuses = ["DRAFT", "PUBLISHED"];

    const { title, excerpt, timeRead, content } = req.body;
    const allFields = [title, excerpt, timeRead, content];

    if (allFields.some(e => !Boolean(e))) {
        return res
                .status(400)
                .json({success: false, message: `Some field(s) detected being empty!`, post: null})
    }

    if (req.user && req.user.Role === "ADMIN" && allFields.every(e => Boolean(e))) {
        const post = await Post.createPost(req.body, status, req.user);
        return res
                 .status(201)
                 .json({success: true, message: "Post successfully created!", post: post})

    } else if (!req.user) {
        return res
                 .status(401)
                 .json({success: false, message: "Authentication error, please login!", post: null})

    } else if (!allowedStatuses.includes(status)) {
        return res
                 .status(406)
                 .json({ success: false, message: "Request includes unacceptable status!", post: null })
    } else {
        return res
                 .status(403)
                 .json({success: false, message: "Access denied, No previllage is granted for this action!", post: null})
    }


}

const commentCreatePost = async (req, res) => {

    const { postId } = req.params;

    if (req.user && req.body.content) {
        const comment = await Comment.createCommentByUser(postId, req.body, req.user);
        return res
                .status(201)
                .json({ success: true, message: "Comment Successfully Created!", comment })
    }

    else if (!req.body.content){
        return res
                .status(400)
                .json({success: false, message: "Content is Missing", comment: null})
    }

    else {
        return res
                 .status(403)
                 .json({success: false, message: "Access denied, No previllage is granted for this action!", comment: null})
    }
}


const replyCreatePost = async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const { action } = req.query;

    const allowedActions = ["to_comment", "to_reply"]

    if (req.user && action === "to_comment" && req.body.content) {

        const comment = await Comment.getOneCommentWithNoUser(commentId);
        const repliedCommentAuthor = await User.fetchSingleUser(comment.user_id) 
        const newReply = await Reply.createReply(req.body, commentId, req.user, repliedCommentAuthor.users_id, undefined)

        return res
                .status(201)
                .json({ success: true, message: `Successfully replied to comment "${comment.content}"`, reply: newReply })

    } else if (req.user && action === "to_reply" && req.body.content) {

        const reply = await Reply.fetchSingleReply(replyId);
        const repliedReplyAuthor = await User.fetchSingleUser(reply.user_id) //by reply id now
        const newReply = await Reply.createReply(req.body, commentId, req.user, undefined, repliedReplyAuthor.users_id)
        return res
                .status(201)
                .json({ success: true, message: `Successfully replied to reply "${reply.content}"`, reply: newReply })

    }

    else if (!req.body.content){
        return res
                .status(400)
                .json({success: false, message: "Content is Missing", reply: null})
    }

    else if (!allowedActions.includes(action)) {
        return res
                 .status(406)
                 .json({ success: false, message: "Request includes unacceptable status!", reply: null })
    }
    else {
        return res
                 .status(403)
                 .json({success: false, message: "Access denied, No previllage is granted for this action!", reply: null})
    }
}


module.exports = {
    postCreatePost,
    commentCreatePost,
    replyCreatePost
}