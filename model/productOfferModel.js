const mongoose = require('mongoose')
const Schema = mongoose.Schema


const productOfferSchema = new mongoose.Schema({


        name:{
            type:String,
            required:true,
    
        },
        discountPercentage:{
            type:String,
            required:true,
            min:0,
            max:90
        },
        startDate:{
            type:String,
            required:true
        },
        expiryData:{
            type:String,
            required:true
        },
        description: {
            type: String
        },  
         status: {
            type: Boolean,
            default:true
        },
        usedBy:[{
            type:Schema.Types.ObjectId,
            ref:'Products',
        }] 
        
              
        

    },{ timestamps: true

        
     })


module.exports =  mongoose.model('ProductOffer',productOfferSchema)