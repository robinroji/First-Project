const mongoose = require('mongoose')


const orderdItemSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    category : {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    regularPrice: {
        type: Number,
        required: true ,
    },
    images:{
        type:[String],
        required:true
    },
    salePrice: {
        type: Number,
        required: true
    },

    
    
    
    

},{
    timestamps: true
})
    

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',  
        required: true
    },

    items:[orderdItemSchema],

    address:{
            houseName:{
                type:String,
                required:true
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
            },

    },
    payment:{
        type:String,
        required:true
    },
    totalRegularPrice: {  
        type: Number,
        required: true,
        default: 0
    },
    totalSalesPrice: { 
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'Shipped',
            'Delivered', 
            'Canceled'
        ],
        required: true,
        default: 'Pending'
    },
   
    

},{
    timestamps: true
},



)

module.exports = mongoose.model('Order', orderSchema);


