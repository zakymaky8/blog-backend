const {rateLimit} = require("express-rate-limit")


const limitAccess = rateLimit({
    keyGenerator: (req, res) => req.user.id || req.ip,
    max: 10,
    windowMs: 10 * 60 * 1000,
    handler: (req, res) => res.status(429).json({ success: false, message: "Too many requests!" }),
    skip: (req, res) => req.user.Role === "ADMIN"
})


module.exports = limitAccess