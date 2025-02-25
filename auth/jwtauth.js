require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


const getUserToken = async (req, res) => {

    const  { username, password } = req.body;


    if ( !username || !password ) {
        return res
                .status(400)
                .json({ success: false, message: "Missing credential(s)!", token: null })
    }

    const user = await prisma.users.findFirst({where: {username: username}});
    const matches = user ?  await bcrypt.compare(password, user.password) : false;

    if (!user) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid Credential!", token: null })
    } else if (user && !matches) {
        return res
                .status(401)
                .json({ success: false, message: "Password Incorrect!", token: null })
    } else if (user && matches) {
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        return res
                .status(200)
                .json({success: true, message: "Successfully Logged In!", token: token})
    }
}

const getAdminToken = async (req, res) => {

    const { username, password, admin_pwd } = req.body;

    if ( !username || !password || !admin_pwd) {
        return res
                .status(400)
                .json({ success: false, message: "Missing credential(s)!", token: null })
    }

    const user = await prisma.users.findFirst({where: {username: username}})
    const matches = user ? await bcrypt.compare(password, user.password) : false;

    if (user && matches && user.Role === "ADMIN" && admin_pwd === process.env.ADMIN_PASSWORD ) {

        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
        return res
                 .json({success: true, token: token, message: "Successfully Logged In!"})
    }
    else if (!user) {
        return res
                 .status(404)
                 .json({success: false, message: "User is not found", token: null})

    } else if (user && user.Role !== "ADMIN" || admin_pwd !== process.env.ADMIN_PASSWORD) {
        return res
                 .status(403)
                 .json({success: false, message: "Access Denied!", token: null})
    } else if (!matches) {
        return res
                 .status(401)
                 .json({success: false, message: "Invalid Credential", token: null})
    }
}

//  for protected routes

const authenticateUser = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader ? bearerHeader.split(" ")[1] : null;

    if (!bearerToken) {
        return res
                 .status(401)
                 .json({success: false, message: "Token is Missing!"});
    }
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res
                     .status(400)
                     .json({success: false, message: "Invalid token, please login again!"})
        }
        req.user = user;
        return next()
    })
}

const checkLoginStatus = (req, res) => {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader ? bearerHeader.split(" ")[1] : null;

    if (!bearerToken) {
        return res
                 .status(401)
                 .json({success: false, message: "Please Log In!", user: null});
    }
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res
                     .status(403)
                     .json({success: false, message: "Access Denied!", user: null})
        }
        req.user = user;
        const User = {...user};
        delete User.password
        return res
                 .status(200)
                 .json({ success: true, message: "Logged in!", user: {...User}})
    })
}

module.exports = {
    authenticateUser,
    getUserToken,
    getAdminToken,
    checkLoginStatus
}
