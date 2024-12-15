const mongoose = require('mongoose')

const CoupenSchema = new mongoose.Schema({
    code: {
		type: String,
		required: true,
		unique: true,
	},
	discountPercentage: {
		type: Number,
		required: true,
	},
	expiryDate: {
		type: Date,
		required: true,
	},
	minimumPurchaseAmount: {
		type: Number,
		required: true,
	},
	maxDiscountAmount: {
		type: Number,
		default:200
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	usedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
});





module.exports = mongoose.model('Coupen',CoupenSchema)