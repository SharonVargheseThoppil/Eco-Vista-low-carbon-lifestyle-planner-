const mongoose = require('mongoose');

const CarbonFootprintSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    transport: {
        type: String,
        required: true
    },
    miles: {
        type: Number,
        required: true
    },
    electricity: {
        type: Number,
        required: true
    },
    waste: {
        type: Number,
        required: true
    },
    carbonFootprint: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const CarbonFootprint = mongoose.model('CarbonFootprint', CarbonFootprintSchema);

module.exports = CarbonFootprint;
