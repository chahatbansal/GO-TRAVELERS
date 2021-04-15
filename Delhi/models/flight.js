const mongoose = require('mongoose')

const flightSchema = new mongoose.Schema({
    flightId:{
        type:String,
        required:true
    },
    source:{
        type:String,
        required:true,
    },
    departure_airport: {
        type:String,
        required:true,
    },
    arrival_airport: {
        type:String,
        required:true,
    },
    destination:{
        type:String,
        required:true,
    },
    arrival:{
        type:Date,
        required:true
    },
    departure:{
        type:Date,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    totalSeats:{
        type:Number,
        required:true
    },
    availableSeats: {
        type:Number,
        required:true
    },
    stops: {
        type:Number,
        required:true
    },

})

module.exports = mongoose.model('Flights',flightSchema);