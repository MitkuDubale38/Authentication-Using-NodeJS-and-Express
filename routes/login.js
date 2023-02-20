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

//login
router.post("/login", async(req, res, next) => {
    let { email, password } = req.body;

    let existingUser;
    let refreshToken;
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }

    if (!existingUser) {
        res.status(401).json({ success: false, data: { message: "Wrong credentials please try again" } });
    } else {
        return existingUser.comparePassword(password, function(error, isMatch) {
                if (isMatch && !error) {
                    let token;
                    try {
                        //Creating jwt token
                        token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
                            key, { expiresIn: jwtExpireTime }
                        );

                        // refresh token
                        refreshToken = jwt.sign(existingUser.toJSON(), JWT_REFRESH_SECRET_KEY, { expiresIn: jwtRefreshExpireTime })

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
                                acesstoken: token,
                                refreshToken: refreshToken,
                            },
                        });
                } else {
                    res.status(401).json({ success: false, data: { message: "Wrong credentials please try again" } });
                }

            },

        )
    }
});

module.exports = router;