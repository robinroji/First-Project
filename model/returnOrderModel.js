const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId


const returnOrderSchema = new Schema({

    order:{
        type:ObjectId,
        required:true,
        ref:"Orders"
    },
    returnProductStatus: {
        type: String,
        enum: ["returnInitiated","returnApproved","returnRejected"],
        default:"returnInitiated",
        required:true
      },
    productRefundAmount:{
        type:Number,
        min: 0,
        default:0,
        required:true
    },
    returnReason:{
        type:String,
        required:true
    }
    
}, { timestamps: true });

module.exports = mongoose.model('ReturnOrder',returnOrderSchema)