const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens
const {body} = require('express-validator');

// import controllers to route
const alertsController = require("../controllers/alerts");
const authController = require("../controllers/authentication");

// create validation rules
const validateParam = (param) => body(param).notEmpty().isString().trim()

// define routes for user authentication and logout with validation
router.route("/register")
        .post(
            validateParam("username"), 
            validateParam("password"),
            authController.register);
router.route("/login")
        .post(
            validateParam("username"), 
            validateParam("password"),
            authController.login);
router.route("/logout").post(authController.logout);

// define route for our alerts endpoint
router
    .route("/alerts")
    .get(authenticateJWT, alertsController.alertsList) // GET Method routes alertList
    .post(authenticatePi, alertsController.alertsAddAlerts); // POST Method Adds a Alert

// Get method for Heartbeat
router.route("/heartbeat")
    .get(authenticatePi, alertsController.heartBeat)

// GET Method routes AlertsFindById: @param - code
router
    .route('/alerts/:alertId')
    .get(alertsController.alertsFindByID)
    .delete(authenticateJWT, alertsController.alertsDeleteAlert); // Delete alert


// route index
module.exports = router;


// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
    // console.log('In Middleware');

    const token = req.cookies.token;

    if(!token) {
        return res.sendStatus(401);
    }

    // console.log(process.env.JWT_SECRET);
    // console.log(jwt.decode(token));

   jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.status(401).json('Token Validation Error!');
        }
        req.auth = verified; // Set the auth parameter to the decoded object
        next();
    });
   
}

// Method to authenticate our JWT
function authenticatePi(req, res, next) {
    // console.log('In Middleware');

    const authHeader = req.headers['authorization'];
    // console.log('Auth Header: ' + authHeader);

    if (authHeader == null) {
        return res.status(401).json({message: 'auth Header Required but NOT PRESENT!'});
    }

    let headers = authHeader.split(' ');
    if(headers.length < 1) {
        return res.status(400).json({message: 'Not enough tokens in Auth Header: ' + headers.length});
    }

    const secret = authHeader.split(' ')[1];
    // console.log('secret: ' + secret);

    if(secret == null) {
        console.log('Null Bearer Secret');
        return res.status(401).json({message: 'Null Bearer Secret'});
    }

    // console.log(process.env.API_KEY);
    // console.log(secret.decode(token));

    const verified = process.env.API_KEY == secret;
    if(!verified){
        return res.status(401).json({message: 'Wrong Bearer Secret'});
    }
    next(); // We need to continue or this will hang forever.
}