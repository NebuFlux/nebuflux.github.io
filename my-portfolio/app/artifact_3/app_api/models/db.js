const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI;
const readLine = require('readline');

// Build connection string and set connection tiemout.
// timeout in milliseconds
const connect = async () => {
   await mongoose.connect(dbURI, {
    socketTimeoutMS: 1000,
    maxPoolSize: 2
   })
}

// Monitor connection
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to database`);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});


// Configure gracefulShutdown
const gracefulShutdown = (msg) => {
    mongoose.connection.close( () => {
        console.log(`Mongoose disconnected through ${msg}`);
    });
};

// Graceful shutdowns

// Shutdown invoked by nodemon signal
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

// app termination shutdown
process.on('SIGINT', () => {
    gracefulShutdown('app termination');
    process.exit(0);
});

// container termination shutdown
process.on('SIGTERM', () => {
    gracefulShutdown('app shutdown');
    process.exit(0);
});

// create first connection
connect();

// import Mongoose schema
require('./alert');
module.exports = mongoose;