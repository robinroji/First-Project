const mongoose = require('mongoose');
const Schema = mongoose.Schema()

const productSchema = new mongoose.Schema({

    product_name:{
        type:String,
        required:true
    },
    product_regular_price:{
           type:String,
           required:true

    },
    product_category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Category',
    },
    product_description:{
        type:String,
        required:true
    },
    product_quantity:{
        type:Number,
        required:true
    },
    product_image:{
        type:[String],
        required:true,
        default:[],
    },
    product_sale_price:{
        type:Number,
        required:true,
    },
    product_brand:{
        type:String,
        required:true,

    },  
    isActive:{
        type:Boolean,
        default:true,
        required:true,
    },

    sl_number:{
        type:Number,
        default:0,
        required:true
    },
    offerValue:{
        type:Number,
        required:false
    }
    
    

},{timestamps:true})


module.exports = mongoose.model('Product',productSchema)