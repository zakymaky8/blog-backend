const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

const userField= {
    username: "username",
    password: "password"
}


passport.use( new LocalStrategy(userField, async function (username, password, done)  {
    const user = await prisma.users.findFirst({
        where: {
            username: username,
            password: password
        }
    })
    if (!user.username === username) {
        return done(null, false, { message: "Incorrect username or password" })
    } else {
        return done(null, user)
    }
}))


passport.serializeUser(function(user, ) {
    done(null, user.users_id)
})

passport.deserializeUser(function(id, done) {
    const user = prisma.users.findFirst({
        where: {
            users_id: user.users_id
        }
    })
    done(null, user)
})


module.exports = {
    passport: passport
}