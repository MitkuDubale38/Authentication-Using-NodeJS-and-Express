const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;


const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true


    },
    password: {
        type: String,
        required: true
    }
});


UserSchema.pre("save", function(next) {
    // store reference
    const user = this;
    if (user.password === undefined) {
        return next();
    } else {
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) console.log(err);
            else {
                // hash the password using our new salt
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) console.log(err);
                    user.password = hash;
                    next();
                });
            }

        });
    }
});

UserSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err, false);
        } else { return cb(null, isMatch); }
    });
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;