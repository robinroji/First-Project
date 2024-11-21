const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    }
    ,

    image:{
        type:String,
        required:false
    },
    isListed:{
        type:Boolean,
        default:true,
        required:true,
    },
    description:{
        type:String,
        required:true,
    }
    

},{timestamps:true})


module.exports = mongoose.model("Category",categorySchema)
