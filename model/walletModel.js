const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

// const walletTransactions = new Schema({
//     orderId: {
//         type: ObjectId,
//         ref: 'Order',
//         required: false
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     status: {  
//         type: String,
//         enum: [ 'pending', 'success', 'failed'],
//         default: 'pending'
//     },
//     type:{
//         type:String,
//         enum: ['debit', 'credit'],
//     },
//     razorpaymentId:{
//         type:String,
//     },
// }, { timestamps: true });

const walletSchema = new mongoose.Schema({

    user:{
        type:ObjectId,
        ref: 'User',
        required: true
    },
    balance:{
        type:Number,
        required:true,
        default:0
    },
    // transactions:[walletTransactions]
},{timestamps:true


})


module.exports = mongoose.model('Wallet',walletSchema)