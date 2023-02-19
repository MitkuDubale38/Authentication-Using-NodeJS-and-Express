const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

//jwt secret congig
const key = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;

dotenv.config({ path: '.env' });


//test resource
router.get('/res', (req, res) => {

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

module.exports = router;