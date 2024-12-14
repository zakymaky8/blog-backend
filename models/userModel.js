require("dotenv").config()

const {PrismaClient}  = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    createUser: async (entries) => {
        await prisma.users.create({
            data:  {
                firstname: entries.firstname,
                lastname: entries.lastname,
                password: entries.password,
                username: entries.username,
                Role: "USER"
            }
        })
    },
    createAdmin: async (entries) => {
        await prisma.users.create({
            data:  {
                firstname: entries.firstname,
                lastname: entries.lastname,
                password: entries.password,
                username: entries.username,
                Role: "ADMIN"
            }
        })
    },
    fetchAllUsers: async () => {
        const users = await prisma.users.findMany();
        return users;
    },

    fetchSingleUser: async (userId) => {
        const user = await prisma.users.findFirst({
            where: {
                users_id: userId
            }
        })

        return user;
    }
}

// async function doSth() {
//     const users = await prisma.users.findMany();
//     console.log(users)
// }
// doSth()