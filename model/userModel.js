const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({


   firstname:{
         type:String,
         required:true,
   },

   lastname:{
        type:String,
        required:false,
   },

   email:{
        type:String,
        required:true,
        unique:true
   },

    password:{
        type:String,
        required:false,
    },
    otp:{
     type:String,
     required:false,
    },

    otpExpires:{
     type:Date,
     required:false
    },
    is_admin:{
     type:Number,
     required:true,
 },
 is_verified:{
     type:Number,
     default:0,
 },
    block:{
        type:Boolean,
        default:false,
        required:true,
    },
    phone:{
      type:String,
      required:false,
    },

    alt_phone:{
      type:String,
      required:false
    },

  googleId:{
    type:String,
    sparse : true ,
    default : null

  },
  serial_number:{
    type:Number,
    required:false,
    default:0,
  },
  
  DOB:{
    type:String,
    required:false,

  },

  address:[{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Address'
  }],

  cart:[{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Cart'
  }],
 
session:{
    type:String,
    default:false,
    required:true
},
wishList:[{
  type:mongoose.Schema.Types.ObjectId,
  required:true,
  ref:'WishList'
}]
  

},{timestamps:true})

module.exports = mongoose.model('User',userSchema)
