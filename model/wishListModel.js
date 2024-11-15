const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    }
});

module.exports = mongoose.model('WishList', wishListSchema);
