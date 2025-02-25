require("dotenv").config()

const { Router } = require("express")
const { registerUser, registerAdmin } = require("../controllers/indexController")
const { getUserToken, getAdminToken, checkLoginStatus } = require("../auth/jwtauth");
const { OnlyPOSTReq } = require("../middlewares/methodValidator");


const indexRouter = Router()

//  user routes
indexRouter.post(
                    "/user/auth/register",
                    registerUser
                )

indexRouter.post(
                    "/user/auth/login",
                    getUserToken
                );

//  admin routes

indexRouter.post(
                "/admin/auth/register",
                OnlyPOSTReq,
                registerAdmin
                )

indexRouter.post(
                "/admin/auth/login",
                OnlyPOSTReq,
                getAdminToken
                )


indexRouter.get(
                "/auth",
                checkLoginStatus
            )

module.exports = indexRouter
