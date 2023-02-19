const express = require("express");
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const cookieparser = require('cookie-parser');

//setting up middlewares
app.use(express.json());
app.use(cookieparser());


const port = process.env.port || 3000
dotenv.config({ path: '.env' });

//jwt secret congig
const key = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;


//mongo db connection
const url = process.env.MONGO_URL;
mongoose.set("strictQuery", false);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected")).catch((err) => console.log(err));


//login
app.post("/login", async(req, res, next) => {
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


//signup
app.post("/signup", async(req, res, next) => {
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


//test resource
app.get('/res', (req, res) => {

    try {
        var token = req.headers.authorization;
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        } else {
            token = req.headers.authorization.split(' ')[1]; // spliting and removing the quotes around the token

            //Decoding the token
            jwt.verify(token, key, function(err, decoded) {
                if (err) {
                    err = {
                        name: err.name,
                        message: err.message,
                        expiredAt: err.expiredAt
                    }
                    res.status(401).json({ success: false, err });
                } else {
                    res.status(200).json({ success: true, data: { userId: decoded.userId, email: decoded.email } });
                }

            });

        }
    } catch (err) {
        res.status(500).json(err);
    }

});

//starting the server on port 3000
app.listen(port, () => {
    console.log("Server is listening on port 3000");
});