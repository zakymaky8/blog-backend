require("dotenv").config()

const User = require("../models/userModel")
const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const exists = await prisma.users.findFirst({ where: { username: req.body.username } });
    if (exists) {
        return res
                .status(409)
                .json({ success: false, message: "username already exists", user: null})
    }
    else {
        const user = await User.createUser(req.body)
        return res
                .status(201)
                .json({message: "User registered successfully!", success: true, user: {...user, password: null}})
    }
}


const registerAdmin = async (req, res) => {
    const exists = await prisma.users.findFirst({ where: { username: req.body.username } });
    if (exists) {
        return res
                .status(409)
                .json({error: "This admin is already registered!"});
    }
    if (req.body.admin_pwd && (req.body.admin_pwd === process.env.ADMIN_PASSWORD)) {
        const admin = await User.createAdmin(req.body);
        return res
                .status(201)
                .json({ success: true, message: "Admin registration successful!", user: { ...admin, password: null}});
    }
    if (req.body.admin_pwd !== process.env.ADMIN_PASSWORD) {
        return res
                .status(403)
                .json({ success: false, message: "Admin password wasn't provided!" })
    }
}


const allUsersGet = async (req, res) => {
    if (req.user && req.user.Role === "ADMIN") {
        const users = await User.fetchAllUsers();
        return res
                .status(200)
                .json({success: true, message: "Successful!", data: { users }})
    } if ( req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Action Denied!", data: { users: null } })
    }
     else {
        return res
                 .status(401)
                 .json({ success: false, message: "Please login!", data: { users: null }})
     }
}


module.exports = {
    registerUser,
    registerAdmin,
    allUsersGet,
}