const { Router } = require("express");
const {
        singlePostGet,
        commentsFetchGet,
        allPublishedPostsGet,
        unpublishedPostsGet,
        getSingleUserActivities,
        allPostsForAdminGet,
        allUsersGet
    } = require("../controllers/readController");

const { authenticateUser } = require("../auth/jwtauth");
const { singleUserGet } = require("../controllers/readController");

const limitAccess = require("../middlewares/rateLimitter");
const readRoute = Router();



readRoute.get(
                "/posts",
                authenticateUser,
                limitAccess,
                allPublishedPostsGet
            )

readRoute.get(
                "/user/current",
                authenticateUser,
                (req, res) => res.status(200).json({success: true, message: "Successful!", user: req.user})
            )

readRoute.get(
                "/posts/:postId",
                authenticateUser,
                limitAccess,
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
            )

module.exports = { readRoute }


