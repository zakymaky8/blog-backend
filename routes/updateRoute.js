const { Router } = require("express");
const { updatePost, updateComment, updateReply, updateUserPwdPut } = require("../controllers/updateController");
const { authenticateUser } = require("../auth/jwtauth");



const updateRoute = Router();


updateRoute.put("/posts/:postId/:action", authenticateUser, updatePost)

updateRoute.put("/posts/:postId/comments/:commentId/:action", authenticateUser ,updateComment) // handler to update content, like and reply

updateRoute.put("/posts/:postId/comments/:commentId/replies/:replyId/:action", authenticateUser, updateReply) // handler to update content, like and reply
// updateRoute.post("/post/:postId")

updateRoute.put("/user/change_password", authenticateUser, updateUserPwdPut)


module.exports = {
    updateRoute
}