const { Router } = require("express");
const {
       updatePost,
       updateComment,
       updateReply,
       updateUserPwdPut,
       updateSuggestionPut,
       updateSuggestionStatusPut,
       updatePostToSuggToPostPut,
       updateOpenRoleForAdmin,
       updateRoleRequest,
       changeRoleStatus,
       rejectReqStatus
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

updateRoute.put("/roles/open-roles/:open_id", authenticateUser, updateOpenRoleForAdmin)

updateRoute.put("/roles/role-request/:request_id", authenticateUser, updateRoleRequest)

updateRoute.put("/roles/status-change/", authenticateUser, changeRoleStatus)

updateRoute.put("/roles/status-change/reject/:requestId", authenticateUser, rejectReqStatus)




module.exports = {
    updateRoute
}