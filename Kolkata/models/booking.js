const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var bookingSchema   = new Schema({
    person:[
        {
            name: {
                type:String,
                required: true
            },
            phoneNo:{
                type:Number,
                required:true,
            },
        }
    ],
    flight: {
        type: Schema.Types.ObjectId,
        ref:'Flights'
    },
    user:{
        type:Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Booking', bookingSchema);