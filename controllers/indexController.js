require("dotenv").config()

const User = require("../models/userModel")
const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
                .status(400)
                .json({ success: false, message: "Missing credential(s)!", token: null })
    }

    const exists =  await prisma.users.findFirst({ where: { username: username } });
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
    
    const { username, password, admin_pwd } = req.body;

    if ( !username || !password || !admin_pwd) {
        return res
                .status(400)
                .json({ success: false, message: "Missing credential(s)!", token: null })
    }

    const exists = await prisma.users.findFirst({ where: { username: req.body?.username } });
    if (exists) {
        return res
                .status(409)
                .json({success: false, message: "Admin already registered!", user: null});
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
                .json({ success: false, message: "Admin password wasn't provided!", user: null })
    }
}



module.exports = {
    registerUser,
    registerAdmin,
}