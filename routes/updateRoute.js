const { Router } = require("express");
const {
       updatePost,
       updateComment,
       updateReply,
       updateUserPwdPut,
       updateSuggestionPut,
       updateSuggestionStatusPut,
       updatePostToSuggToPostPut
} = require("../controllers/updateController");

const { authenticateUser } = require("../auth/jwtauth");



const updateRoute = Router();


updateRoute.put("/posts/:postId", authenticateUser, updatePost)

updateRoute.put("/posts/:postId/comments/:commentId", authenticateUser ,updateComment)

updateRoute.put("/posts/:postId/comments/:commentId/replies/:replyId", authenticateUser, updateReply)

updateRoute.put("/user/change_password", authenticateUser, updateUserPwdPut)


updateRoute.put("/suggestions/status/:suggId", authenticateUser, updateSuggestionStatusPut)

updateRoute.put("/suggestions/post-to-sugg-to-post", authenticateUser, updatePostToSuggToPostPut)

updateRoute.put("/suggestions/:suggId", authenticateUser, updateSuggestionPut)

module.exports = {
    updateRoute
}