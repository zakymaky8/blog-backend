const { Router } = require("express");
const { postCreatePost, commentCreatePost, replyCreatePost } = require("../controllers/createController");
const { authenticateUser } = require("../auth/jwtauth");

const createRouter = Router();

// admin specific route
createRouter.post("/create_post",
                            authenticateUser,
                            postCreatePost) // change post status to query param

// common route
createRouter.post("/posts/:postId/comments/", authenticateUser, commentCreatePost)

createRouter.post("/posts/:postId/comments/:commentId/replies", authenticateUser, replyCreatePost)

createRouter.post("/posts/:postId/comments/:commentId/replies/:replyId", authenticateUser, replyCreatePost)


module.exports = {
    createRouter: createRouter
}