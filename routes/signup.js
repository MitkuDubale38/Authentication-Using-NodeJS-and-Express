const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require('dotenv');

//jwt secret config
const key = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_TOKEN_EXPIRE_TIME;
const jwtRefreshExpireTime = process.env.REFRESH_TOKEN_EXPIRE_TIME;
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

dotenv.config({ path: '.env' });
//signup
router.post("/signup", async(req, res, next) => {
    const { username, email, password } = req.body;
    const newUser = User({
        username,
        email,
        password,
    });
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    if (existingUser) {
        res.status(200).json({ success: true, data: { message: "Error user with that email address already exists" }, successfullySignedUp: false });
    } else {
        try {
            await newUser.save((err, user) => {
                if (err) throw err;
                res.json(user);
            });
        } catch {
            const error = new Error("Error! Something went wrong.");
            return next(error);
        }
        let token;
        let refreshToken;
        try {
            token = jwt.sign({ userId: newUser.id, email: newUser.email },
                key, { expiresIn: jwtExpireTime }
            );
            // refresh token
            refreshToken = jwt.sign(newUser.toJSON(), JWT_REFRESH_SECRET_KEY, { expiresIn: jwtRefreshExpireTime });
        } catch (err) {
            const error = new Error("Error! Something went wrong.");
            return next(error);
        }
        res
            .status(201)
            .json({
                success: true,
                data: {
                    userId: newUser.id,
                    email: newUser.email,
                    acesstoken: token,
                    refreshToken: refreshToken,
                },
                successfullySignedUp: true
            });
    }
});

module.exports = router;