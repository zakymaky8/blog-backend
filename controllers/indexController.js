require("dotenv").config()

const User = require("../models/userModel")
const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    console.log(req.body);
    
    const users = await prisma.users.findMany();
    const exists = users.find(user => user.username === req.body.username);
    if (exists) {
        return res.sendStatus(404)
    }
    // create user
    else {
        await User.createUser(req.body)
        return res.sendStatus(200)
    }
}

const registerAdmin = async (req, res) => {
    console.log(req.body);
    const users = await prisma.users.findMany();
    const exists = users.find(user => user.username === req.body.username);
    if (exists) {
        return res.end("user exists and go back")
    }
    if (req.body.admin_pwd && req.body.admin_pwd === process.env.ADMIN_PASSWORD){
        await User.createAdmin(req.body);
        return res.json({user: req.body});
    } else {
        return res.sendStatus(403)
    }
}

async function getAllsuert(id) {
//     const user = await prisma.users.findFirst({where: {users_id: id}})
//     const comment = await prisma.comment.deleteMany({where: {user_id: id}})
//     const post = await prisma.post.deleteMany({where: {user_id: id}})
//     await prisma.users.delete({
//         where : {
//             users_id: id
//         }
//     })
    console.log(await prisma.users.findMany())
}

getAllsuert("b83925ac-b9c3-4c43-9538-a3a7e2f34be8")
module.exports = {
    registerUser,
    registerAdmin
}