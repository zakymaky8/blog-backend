const { Router } = require("express");
const { postCreatePost, commentCreatePost, replyCreatePost } = require("../controllers/createController");
const { authenticateUser } = require("../auth/jwtauth");

const createRouter = Router();

// admin specific route
createRouter.post("/create_post/:postStatus",
                            authenticateUser,
                            postCreatePost) // change post status to query param

// common route
createRouter.post("/posts/:postId/comments/", authenticateUser, commentCreatePost)

createRouter.post("/posts/:postId/comments/:commentId/replies/:action", authenticateUser, replyCreatePost)

createRouter.post("/posts/:postId/comments/:commentId/replies/:replyId/:action", authenticateUser, replyCreatePost)

// const { PrismaClient } = require("@prisma/client")
// const prisma = new PrismaClient()
// const getReplies = async () => {
//     console.log(await prisma.users.findMany())
// }
// getReplies()

module.exports = {
    createRouter: createRouter
}