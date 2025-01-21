require("dotenv").config()

const User = require("../models/userModel")
const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const users = await prisma.users.findMany();
    const exists = users.find(user => user.username === req.body.username);
    if (exists) {
        return res.sendStatus(404)
    }
    else {
        await User.createUser(req.body)
        return res.sendStatus(200)
    }
}


const registerAdmin = async (req, res) => {
    const users = await prisma.users.findMany();
    const exists = users.find(user => user.username === req.body.username);
    if (exists) {
        return res.status(404).json({error: "user exists and go back"});
    }
    if (req.body.admin_pwd && req.body.admin_pwd === process.env.ADMIN_PASSWORD){
        await User.createAdmin(req.body);
        return res.json({user: req.body});
    } else {
        return res.sendStatus(403)
    }
}


const allUsersGet = async (req, res) => {
    if (req.user.Role === "ADMIN") {
        const users = await User.fetchAllUsers();
        return res.json({users})
    } else {
        res.sendStatus(401)
    }
}




module.exports = {
    registerUser,
    registerAdmin,
    allUsersGet,
}