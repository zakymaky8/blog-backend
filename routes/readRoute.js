const { Router } = require("express");
const { singlePostGet, commentsFetchGet, allPublishedPostsGet, postsWithCommentsAndUsersGet, unpublishedPostsGet } = require("../controllers/readController");
const { authenticateUser } = require("../auth/jwtauth");

const readRoute = Router();

readRoute.get("/posts", authenticateUser, allPublishedPostsGet)

readRoute.get("/posts/:postId", authenticateUser, singlePostGet)

readRoute.get("/posts/:postId/comments", authenticateUser, commentsFetchGet)

readRoute.get("/manage_posts",authenticateUser, postsWithCommentsAndUsersGet)

readRoute.get("/manage_posts/drafts",authenticateUser, unpublishedPostsGet)

module.exports = { readRoute }

