const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');

const userSchema = new mongoose.Schema({});

userSchema.plugin(passportLocalMongoose);


// Method to generate JWT
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        {   // Payload for JWT
            _id: this._id,
            username: this.username,
        },
        process.env.JWT_SECRET, // Secret key for signing the JWT
        { expiresIn: '1h' }); // Token expiration time 1 hour
};

const User = mongoose.model('users', userSchema);

module.exports = User;