const { Router } = require("express");
const { singlePostGet, commentsFetchGet, allPublishedPostsGet, unpublishedPostsGet, getSingleUserActivities, allPostsForAdminGet } = require("../controllers/readController");
const { authenticateUser } = require("../auth/jwtauth");
const { singleUserGet } = require("../controllers/readController")
const readRoute = Router();

readRoute.get("/posts", authenticateUser, allPublishedPostsGet)

readRoute.get("/current_user", authenticateUser, (req, res) => {
    res.json({user: req.user})
})

readRoute.get("/posts/:postId", authenticateUser, singlePostGet)

readRoute.get("/posts/:postId/comments", authenticateUser, commentsFetchGet)

readRoute.get("/manage_posts",authenticateUser, allPostsForAdminGet)

readRoute.get("/manage_posts/drafts",authenticateUser, unpublishedPostsGet)

readRoute.get("/user/:userId", authenticateUser, singleUserGet);

readRoute.get("/user/:userId/activities", authenticateUser, getSingleUserActivities)

module.exports = { readRoute }


