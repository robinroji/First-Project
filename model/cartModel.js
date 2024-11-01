const mongoose = require('mongoose');

// Define the schema for individual items in the cart
const newitems = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,  // Corrected the type definition
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min:1
    },
    totalPrice:{
        type:Number,
        required:false
    }
    
});

// Define the main cart schema
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,  // Corrected the type definition
        ref: 'User',
        required: true
    },
    items: [newitems],  // Cart items array
    totalRegularPrice: {  // Follow camelCase naming convention
        type: Number,
        required: true,
        default: 0
    },
    totalSalesPrice: {  // Follow camelCase naming convention
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    totalItems: {  // Follow camelCase naming convention
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true  // This option adds `createdAt` and `updatedAt` automatically
});

module.exports = mongoose.model('Cart', cartSchema);
