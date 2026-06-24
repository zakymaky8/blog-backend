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
        commentRepliesGet
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


module.exports = { readRoute }


