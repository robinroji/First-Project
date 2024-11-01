const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

    houseName:{
        type:String,
        required:true,
    },
    pinCode:{
        type:Number,
        required:true
    },
    po:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true

    }

})






module.exports= mongoose.model('Address',addressSchema)