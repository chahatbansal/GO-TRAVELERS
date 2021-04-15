const mongoose = require('mongoose');
const passport = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    booking:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    },
    resetToken: String,
    expireToken: Date,
    role: {
        type:String,
        required:true,
    }
});
userSchema.plugin(passport);
module.exports = mongoose.model('User',userSchema);