const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CategoryOfferSchema = new mongoose.Schema({


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
        ref:'Category',
    }] 
    
          
    

},{ timestamps: true

})

module.exports = mongoose.model('CategoryOffer',CategoryOfferSchema)