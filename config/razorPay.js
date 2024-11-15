const RazorPay = require('razorpay')

const razorpayInstance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  module.exports = razorpayInstance;