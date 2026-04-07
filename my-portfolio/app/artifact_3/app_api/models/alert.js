const mongoose = require('mongoose');

// Define alert schema
const alertSchema = new mongoose.Schema({
    source: {type: String, required: true},
    source_port: {type: Number, required: true},
    destination: {type: String, required: true},
    destination_port: {type: Number, required: true},
    category: {type: String, required: true, index: true},
    reported: {type: Date, required: true},
});
const Alert = mongoose.model('alert', alertSchema);
module.exports = Alert;