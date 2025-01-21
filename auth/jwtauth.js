require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


const getUserToken = async (req, res) => {

    const  { username, password } = req.body;
    const user = await prisma.users.findFirst({where: {username: username}});

    const matches = user ?  await bcrypt.compare(password, user.password) : false;

    if (!user) {
        return res.sendStatus(401)
    } else if (user && !matches) {
        return res.sendStatus(403)
    } else {
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
        return res.json({token: token})
    }
}

const getAdminToken = async (req, res) => {
    const { username, password, admin_pwd } = req.body;

    const user = await prisma.users.findFirst({where: {username: username}})
    const matches = await bcrypt.compare(password, user.password);

    if (user && matches && user.Role === "ADMIN" && admin_pwd === process.env.ADMIN_PASSWORD ) {
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
        return res.json({token: token})
    }
    else if (!user || admin_pwd !== process.env.ADMIN_PASSWORD) {
        return res.sendStatus(401)
    } else if (user.Role !== "ADMIN") {
        return res.sendStatus(403)
    } else if (!matches) {
        return res.sendStatus(403)
    }
}

//  for protected routes

const authenticateUser = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader && bearerHeader.split(" ")[1];
    
    if (!bearerToken) {
        return res.sendStatus(401);
    }
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(403)
        }
        req.user = user;
        return next()
    })
}

const checkLoginStatus = (req, res) => {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader && bearerHeader.split(" ")[1];

    if (!bearerToken) {
        return res.sendStatus(401);
    }
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(403)
        }
        req.user = user;
        return res.json({user})
    })
}

module.exports = {
    authenticateUser,
    getUserToken,
    getAdminToken,
    checkLoginStatus
}
