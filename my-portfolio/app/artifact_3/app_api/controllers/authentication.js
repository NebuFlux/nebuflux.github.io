const passport = require('passport');
const User = require('../models/user');
const {validationResult} = require('express-validator');

const register = async(req, res) => {

    // Check validationResults
    const result = validationResult(req);
    if (!result.isEmpty()){
        return res.status(401).json({"message": result.message, "type": result.type});
    }

    try{
        const user = await User.register(new User({username: req.body.username}), req.body.password);
        token = user.generateJWT();
        const expire = Math.floor(Date.now() / 1000) + 60 * 60;
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60*60*1000
        });
        return res.status(200).json({ username: user.username, expire: expire });
        
    } catch (err){
        return res.status(409).json({"message": err.message});
    }
};

const login = async (req, res) => {

    // Check validationResults
    const result = validationResult(req);
    if (!result.isEmpty()){
        return res.status(401).json({"message": result.message, "type": result.type});
    }

    // Delegate authentication to passport module
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            // Error in Authentication Process
            return res
                .status(404)
                .json(err);
        }

        if (user) { // Auth succeeded - generate JWT and return to caller
            const expire = Math.floor(Date.now() / 1000) + 60 * 60;
            const token = user.generateJWT();
            res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60*60*1000
            });
            
            return res
                .status(200)
                .json({ username: user.username, expire: expire});
        } else { // Auth failed return error
            res
            .status(401)
            .json(info);
        }
    }) (req, res);
};

const logout = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({message: "Logged out"});
}

module.exports = {
    register, 
    logout,
    login
};