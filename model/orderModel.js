const mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const orderItemsModel = new Schema({
    product:{
        type:ObjectId,
        ref:'Product',
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    brandName:{
        type:String,
        required:true
    },
    category:{
        type:ObjectId,
        ref:'Category',
        required:true
    },
    categoryName:{
        type:String,
        required:false
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    price:{
        type:Number,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true,
    },
    images:{
        type:Array,
        required:true
    },
    itemOrderStatus:{
        type:String,
        required:true,
        enum:['pending','confirmed','shipped','delivered','cancelled','Return Initiated','Return Approved','Return Rejected'],
        default:'pending'
    },
    deliveredDate:{
        type:Date
    },
    itemOffer:{
        name:{type:String},
        discountPercentage:{type:Number},
        startDate:{type:Date},
        expiryDate:{type:Date},
        offerAmount:{type:Number},
        offerType:{
          type:String,
          enum:['product','category']
        }
      },
    itemCouponPropotion:{
        type:Number,
        default:0
    }
},{timestamps:true})

const orderModel = Schema({
    onlinePaymentId:{
        type:String
    },
    items:[orderItemsModel],
    user:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    totalItems:{
        type:Number,
        required:true,
        default:1
    },
    subTotalAmount:{
        type:Number,
        required:true,
        default:0
    },
    deliveryCharges:{
        type:Number,
        required:false,
        default:0
    },
    couponDiscount:{
        type:Number,
        required:false,
        default:0
    },
    offerDiscount:{
        type:Number,
        required:false,
        default:0
    },
    totalAmount:{
        type:Number,
        required:true,
        default:0
    },
    orderDate:{
        type:Date,
        required:false,
        default:Date.now()
    },
    orderStatus:{
        type:String,
        required:false,
        enum:['pending','confirmed','shipped','delivered','cancelled','returned'],
        default:'pending'
    },
    paymentMethod:{
        type:String,
        required:true,
        enum:['COD','RazorPay','wallet'],
        default:'COD'
    },
    paymentStatus:{
        type:String,
        required:false,
        default:'pending',
        enum: ['pending', 'completed', 'failed', 'refunded']
    },
    shippingAddress: {
        type: ObjectId,
        ref: 'Address',
        required: true,
      },
    customOrderId:{
        type:Number,
        required:false,
    }
    },
    { timestamps: true } // This should be placed as an option within the schema definition
  );

module.exports = mongoose.model('orders',orderModel)