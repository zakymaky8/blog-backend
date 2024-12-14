const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Reply = require("../models/replyModel");

const allPublishedPostsGet = async (req, res) => {
    const posts  = await Post.fetchPublishedPosts();
    return res.json({posts: posts})
}

const postsWithCommentsAndUsersGet = async (req, res) => {
    if ( req.user && req.user.Role === "ADMIN") {
        const posts = await Post.fetchPosts();
        const comments = await Comment.fetchAllComments()
        return res.json({posts: posts, comments: comments})
    } else {
        return res.sendStatus(403)
    }
}

const unpublishedPostsGet = async (req, res) => {
    if (req.user && req.user.Role === "ADMIN") {
        const posts = await Post.fetchUnpublishedPost();
        return res.json({posts: posts})
    } else {
        return res.sendStatus(401)
    }
}


const singlePostGet = async (req, res) => {

    const post  = await Post.fetchSinglePost(req.params.postId);
    const author = await User.fetchSingleUser(post.user_id);
    if ( req.user && req.user.Role !== "ADMIN" && post.status === "DRAFT") {
        return res.sendStatus(401)
    } else {
        return res.json({data: [post, author, req.user]})
    }
}


const commentsFetchGet = async (req, res) => {
    const { postId } = req.params;

    const comments = await Comment.fetchComments(postId);
    const authors =  await Promise.all(comments.map(async comment => await User.fetchSingleUser(comment.user_id)));
    const repliesArray = await Promise.all(comments.map(async comment => await Reply.getRepliesPerComment(comment.comments_id)))
    const replies = repliesArray.flat();
    const replyActorPairs = await Promise.all(replies.map(async reply =>{
        return {
            replier: await User.fetchSingleUser(reply.user_id),
            replied_to: await User.fetchSingleUser(reply.replied_id)
        }
    } ))
    return res.json({data: [comments, authors, req.user, replies, replyActorPairs]})
}

module.exports = {
    allPublishedPostsGet,
    singlePostGet,
    commentsFetchGet,
    postsWithCommentsAndUsersGet,
    unpublishedPostsGet
}