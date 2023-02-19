const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require('dotenv');

//jwt secret congig
const key = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;

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
            await newUser.save();
        } catch {
            const error = new Error("Error! Something went wrong.");
            return next(error);
        }
        let token;
        try {
            token = jwt.sign({ userId: newUser.id, email: newUser.email },
                key, { expiresIn: jwtExpireTime }
            );
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
                    token: token
                },
                successfullySignedUp: true
            });
    }
});

module.exports = router;