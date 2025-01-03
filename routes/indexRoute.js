require("dotenv").config()

const { Router } = require("express")
const { registerUser, registerAdmin, allUsersGet } = require("../controllers/indexController")
const { getUserToken, getAdminToken, checkLoginStatus, authenticateUser } = require("../auth/jwtauth");


const indexRouter = Router()

//  user routes
indexRouter.post("/register", registerUser)

indexRouter.post("/login", getUserToken);

//  admin routes

indexRouter.post("/admin-register", registerAdmin)

indexRouter.post("/admin-login", getAdminToken)


indexRouter.get("/auth", checkLoginStatus )

indexRouter.get("/users", authenticateUser, allUsersGet )


module.exports = indexRouter
