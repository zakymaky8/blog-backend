const { body } = require("express-validator");
const pool = require("../config/pool");

const validateRegistration = [

    body("firstname")
        .customSanitizer( value => value[0].toUpperCase() + value.slice(1, ).toLowerCase())
        .escape(),

    body("lastname")
        .customSanitizer( value => value[0].toUpperCase() + value.slice(1, ).toLowerCase())
        .escape(),

    body("username")
        .trim()
        .isLength({min: 3, max: 10}).withMessage("Username should be between 3 and 10 characters inclusively!")
        .escape(),
    body("username")
        .custom(async value => {
            const { rows } = await pool.query(`SELECT * FROM users WHERE username = $1`, [value]);
            const user = rows[0];
            if (user) {
                throw new Error("Username has already been taken before!")
            } else {
                return true;
            }
        }),
    body("password")
        .isLength({min: 6}).withMessage("Password should be minimum of 6 characters!")
        .matches(/[a-z]/).withMessage("password should contain atleast one lowercase character!")
        .matches(/[A-Z]/).withMessage("password should contain atleast one uppercase character!")
        .matches(/[0-9]/).withMessage("password should contain atleast one number!")
        .matches(/[^0-9a-zA-Z]/).withMessage("password should contain atleast one special character!"),

    body("confirm_password")
        .custom(async (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password didn't match!")
            }
            else {
                return true;
            }
        })
]


module.exports = { validateRegistration }