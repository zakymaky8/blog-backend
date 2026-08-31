const { Router } = require("express");
const {
        deleteSinglePost,
        commentDeletePost,
        deleteReply,
        deleteOneUser,
        removeSuggestion,
        deleteOpenRole,
        deleteRoleRequest
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

deleteRouter
    .delete(
        "/suggestions/:suggId",
        authenticateUser,
        removeSuggestion
    )

deleteRouter.delete("/roles/open-roles/:open_id", authenticateUser, deleteOpenRole)

deleteRouter.delete("/roles/role-requests/:request_id", authenticateUser, deleteRoleRequest)


module.exports = {
    deleteRouter
}