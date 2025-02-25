const { Router } = require("express");
const {
        deleteSinglePost,
        commentDeletePost,
        deleteReply,
        deleteOneUser
    } = require("../controllers/deleteController");

const { authenticateUser } = require("../auth/jwtauth");

const deleteRouter = Router();

deleteRouter
    .delete(
        "/posts/:postId",
        authenticateUser,
        deleteSinglePost
    )

deleteRouter
    .delete(
        "/posts/:postId/comments/:commentId",
        authenticateUser,
        commentDeletePost
    )

deleteRouter
    .delete(
        "/posts/:postId/comments/:commentId/replies/:replyId",
        authenticateUser,
        deleteReply
    )


deleteRouter
    .delete(
        "/user/:userId",
        authenticateUser,
        deleteOneUser
    )

module.exports = {
    deleteRouter
}