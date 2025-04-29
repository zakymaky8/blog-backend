require("dotenv").config()

const User = require("../models/userModel")
const Suggestion = require("../models/suggestModel");

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


const currentUserGet = async (req, res) => {
    return res.status(200).json({success: true, message: "Successfull", user: await prisma.users.findFirst({ where: { users_id: req.user.users_id } })})
}


const updateProfileInfo = async (req, res) => {
    const { firstname, lastname, username  } = req.body;

    const entries = [firstname, lastname, username];
    if (entries.includes(undefined)) {
        return res
                .status(400)
                .json({ success: false, message: "Empty field detected!" })
    }
    if (req.user.users_id !== req.params.userId) {
        return res
                .status(403)
                .json({ success: false, message: "Action is not granted!" })
    }
    const success = await User.updateUserProfInfo(req.body, req.user);
    if (success) {
        return res
                .status(200)
                .json({ success: true, message: "Information Successfully Updated!" })
    }
    return res.status(500).json({ success: false, message: "Server Error Occured!" })
}



const fetchActionFeedInfo = async (req, res) => {
    const likedPosts = await  User.getLikedPosts(req.user.users_id);
    const comment_post = await User.getCommentsAndTheirPosts(req.user.users_id);
    const suggestions = await Suggestion.getSuggestionsByUser(req.user.users_id)
    return res.status(200).json({ success: true, message: "Successful", data: {
        likedPosts,
        commentsWithPosts: comment_post,
        suggestions
    } });

}

const toggleWarnUserPut = async (req, res) => {
    
    if (req.user && req.user.Role === "ADMIN") {
        await User.warnUserAccount(req.params.userId);
        return res
                .status(200)
                .json({ success: true, message: "User warned successfully!" })
    }

    if (req.user.Role !== "ADMIN") {
        return res
                .status(403)
                .json({ success: false, message: "Action is not allowed!" })
    }
}

module.exports = {
    registerUser,
    registerAdmin,
    currentUserGet,
    updateProfileInfo,
    fetchActionFeedInfo,
    toggleWarnUserPut
}