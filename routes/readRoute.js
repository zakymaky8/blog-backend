const { Router } = require("express");
const {
        singlePostGet,
        commentsFetchGet,
        allPublishedPostsGet,
        unpublishedPostsGet,
        getSingleUserActivities,
        allPostsForAdminGet,
        allUsersGet,
        highPriorityPostsGet,
        onesSuggestionsGet,
        othersSuggestionsGet,
        allSuggestionsGet,
        singleSuggestionGet,
        postLikesGet,
        postDislikesGet,
        postViewsGet,
        commentLikesGet,
        commentDislikesGet,
        commentRepliesGet,
        getOpenRoles,
        getSingleOpenRole,
        getAllRoleRequests,
        getSingleRoleRequest,
        getOnesRoleRequests,
        getRoles,
        getSingleRole
    } = require("../controllers/readController");

const { authenticateUser } = require("../auth/jwtauth");
const { singleUserGet } = require("../controllers/readController");

const limitAccess = require("../middlewares/rateLimitter");
const readRoute = Router();



readRoute.get(
    "/posts",
    // authenticateUser,
    // limitAccess,
    allPublishedPostsGet
);

readRoute.get(
    "/posts/featured",
    // authenticateUser,
    // limitAccess,
    highPriorityPostsGet
);

readRoute.get(
    "/user/current",
    authenticateUser,
    (req, res) => res.status(200).json({success: true, message: "Successful!", user: req.user})
)

readRoute.get(
    "/posts/:slugId",
    // authenticateUser,
    // limitAccess,
    singlePostGet
)

readRoute.get(
    "/manage-posts/:slugId",
    authenticateUser,
    // limitAccess,
    singlePostGet
)

readRoute.get(
    "/posts/:postId/comments/",
    authenticateUser,
    commentsFetchGet
)

readRoute.get(
    "/manage_posts",
    authenticateUser,
    allPostsForAdminGet
)

//admin only
readRoute.get(
    "/manage_posts/drafts",
    authenticateUser,
    unpublishedPostsGet
)

readRoute.get(
    "/user/:userId",
    authenticateUser,
    singleUserGet
);

readRoute.get(
    "/users",
    authenticateUser,
    allUsersGet
)

readRoute.get(
    "/user/:userId/activities",
    authenticateUser,
    getSingleUserActivities
);

readRoute.get(
    "/suggestions/user-suggestions",
    authenticateUser,
    onesSuggestionsGet
);

readRoute.get(
    "/suggestions/others-suggestions",
    authenticateUser,
    othersSuggestionsGet
);

readRoute.get(
    "/suggestions/all-suggestions",
    authenticateUser,
    allSuggestionsGet
);

readRoute.get(
    "/suggestions/:suggId",
    authenticateUser,
    singleSuggestionGet
);

readRoute.get(
    "/posts/likes/:postId",
    authenticateUser,
    postLikesGet
);

readRoute.get(
    "/posts/dislikes/:postId",
    authenticateUser,
    postDislikesGet
);

readRoute.get(
    "/posts/views/:postId",
    authenticateUser,
    postViewsGet
);



readRoute.get(
    "/posts/:postId/comments/:commentId/likes",
    authenticateUser,
    commentLikesGet
);

readRoute.get(
    "/posts/:postId/comments/:commentId/dislikes",
    authenticateUser,
    commentDislikesGet
);

readRoute.get(
    "/posts/:postId/comments/:commentId/replies",
    authenticateUser,
    commentRepliesGet
);


// admin CRUD open role
// admin CRUD role requests
// Admin acts on role requests,
// Announce botton on updates


// MEC makes role request
// MEC sees open roles
// Receives update on role changes

//TODO: we need user activities model as well

/* api endpoints for roles activities
    => GET api/roles/open-roles for admin and MEC ==> DONE FOR ALL
    => POST api/roles/open-roles for admin ==> ==> done for admin
    => PUT api/roles/open-roles for admin ==> done for admin
    => DELETE api/roles/open-roles for admin ==> done for admin


    => GET api/roles/role-requests for admin
    => GET api/roles/role-requests/:request_id for admin
    => POST api/roles/role-requests for MEC only
    => PUT api/roles/role-requests/:request_id for MEC
    => DELETE api/roles/role-requests/:request_id for MEC



    
*/


// Member Creator and Editor
readRoute.get("/roles/open")

readRoute.get("/manage/roles/open/")

readRoute.get("/manage/roles/requests")

readRoute.get("/roles/availble-roles")

// all authenticated roles apply
readRoute.get("/roles/open-roles",
    authenticateUser,
    getOpenRoles
) 
// all authenticated role apply
readRoute.get( "/roles/open-roles/:open_id", authenticateUser, getSingleOpenRole )

// For MEC
readRoute.get("/roles/role-requests/mine", authenticateUser, getOnesRoleRequests)

// Admin only endpoint
readRoute.get("/roles/role-requests", authenticateUser, getAllRoleRequests)
readRoute.get("/roles/role-requests/:request_id", authenticateUser, getSingleRoleRequest)


readRoute.get("/roles", authenticateUser, getRoles)

readRoute.get("/roles/:role_id", authenticateUser, getSingleRole)



/* 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19pZCI6ImVhZmYyYTkwLWI0NDUtNDM2OC1iMzVkLTlhMjIwNjk5ODc5OCIsImZpcnN0bmFtZSI6IlphY2giLCJsYXN0bmFtZSI6Ik1la3UiLCJlbWFpbCI6Inpha3lkZXY4QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYWRtaW4temFjaCIsInBhc3N3b3JkIjoiJDJiJDEwJE1VNmw4c1pwLlVibTR0MUVRdVBSci51aUpIempuYTJJcVV2dVpRb0p5L29CdHMwVGs1Q0RXIiwiUm9sZSI6IkFETUlOIiwicm9sZV9zdGF0dXMiOiJBQ1RJVkUiLCJjcmVhdGVkQXQiOiIyMDI2LTA4LTA0VDEzOjQxOjU1Ljc4NloiLCJ1cGRhdGVkQXQiOiIyMDI2LTA4LTA0VDEzOjQxOjU1Ljc4NloiLCJpc1dhcm5lZCI6ZmFsc2UsImlzT3duZXIiOnRydWUsInByb2ZpbGVQaWMiOm51bGwsImlhdCI6MTc4NjQ1MTMyNSwiZXhwIjoxNzg2NDU4NTI1fQ.Jl2CmXY-uG_8GHUU2C0apRkfQ4M0YIUWmBEdvdsUO1o
*/


module.exports = { readRoute }