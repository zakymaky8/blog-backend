const { Router } = require("express");
const {
    postCreatePost,
    commentCreatePost,
    replyCreatePost,
    createSuggessionPost,
    initiateFirstAdminOnce,
    initiateRoleAllocation,
    createOpenRole,
    createRoleRequest
} = require("../controllers/createController");

const { authenticateUser } = require("../auth/jwtauth");

const createRouter = Router();

// admin specific route
createRouter.post(
    "/posts",
    authenticateUser,
    postCreatePost
)

// common route
createRouter.post(
    "/posts/:postId/comments/",
    authenticateUser,
    commentCreatePost
)

createRouter.post(
    "/posts/:postId/comments/:commentId/replies",
    authenticateUser,
    replyCreatePost
)

createRouter.post(
    "/posts/:postId/comments/:commentId/replies/:replyId",
    authenticateUser,
    replyCreatePost
)

createRouter.post(
    "/suggestions",
    authenticateUser,
    createSuggessionPost
)


createRouter.post(
    "/user/initiate-first-admin-once",
    initiateFirstAdminOnce
)

createRouter.post(
    "/roles/initiate-role-allocation",
    initiateRoleAllocation
)

// Admin Only endpoint
createRouter.post(
    "/roles/open-roles",
    authenticateUser,
    createOpenRole
)


// for MEC
createRouter.post(
    "/roles/role-requests",
    authenticateUser,
    createRoleRequest
)



module.exports = {
    createRouter
}