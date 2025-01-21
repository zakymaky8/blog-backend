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

    const post  =
            (req.user && req.user.Role === "ADMIN") ?
            await Post.fetchSinglePost(req.params.postId) :
            (req.user && req.user.Role === "USER") ?
            await Post.fetchSinglePubPost(req.params.postId) : false

    if (post) {
        const author = await User.fetchSingleUser(post.user_id);
        return res.json({data: [post, author, req.user]})

    } else {
        return res.status(404).json({error: "The post was whether not found or deleted or unpublished!"})
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

const singleUserGet = async (req, res) => {
    const { userId } = req.params;

    const user = (req.user && req.user.Role === "ADMIN") ?
     await User.fetchSingleUser(userId) : false

    if (user) {
        return res.json({user})
    }
    return res.status(404).json({error: "Account Terminated or Deleted!"})
}



const getSingleUserActivities = async (req, res) => {
    const { userId } = req.params;
    if (req.user && req.user.Role === "ADMIN") {
        const user = await User.fetchSingleUser(userId)
        const likedPosts = await User.getLikedPosts(userId)
        const paired = await User.getCommentsAndTheirPosts(userId)
        return res.json({user, likedPosts, paired})
    } else {
        return res.status(404).json({error: "access denied!"})
    }
}

module.exports = {
    allPublishedPostsGet,
    singlePostGet,
    commentsFetchGet,
    postsWithCommentsAndUsersGet,
    unpublishedPostsGet,
    singleUserGet,
    getSingleUserActivities
}