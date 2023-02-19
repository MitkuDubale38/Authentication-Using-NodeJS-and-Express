const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require('dotenv');
//jwt secret congig
const key = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;

dotenv.config({ path: '.env' });

//login
router.post("/login", async(req, res, next) => {
    let { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    if (!existingUser || existingUser.password != password) {
        res.status(401).json({ success: false, data: { message: "Wrong credentials please try again" } });
    } else {
        let token;
        try {
            //Creating jwt token
            token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
                key, { expiresIn: jwtExpireTime }
            );
        } catch (err) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return next(error);
        }

        res
            .status(200)
            .json({
                success: true,
                data: {
                    userId: existingUser.id,
                    email: existingUser.email,
                    token: token,
                },
            });
    }
});

module.exports = router;