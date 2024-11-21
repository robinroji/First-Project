const User = require('../model/userModel')
const bcrypt= require('bcrypt');
const { text } = require('body-parser');
const nodemailer = require('nodemailer')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Order = require('../model/orderModel')
const WishList= require('../model/wishListModel')
const razorPay = require("../config/razorPay");
const crypto = require("crypto");
const Coupen = require('../model/coupenModel')
const mongoose =require('mongoose')
const Wallet = require('../model/walletModel')




////******************************OTP GENEARTING FUNCTION *******************

function genrateOtp(){
    return Math.floor(100000+Math.random()*900000).toString();
}


///******************************SEND VERIFY MAIL**************/////////////////////

const sendVerifyMail =async(name,email,user_id,otp)=>{
    try {
// console.log('im herer');

        const transporter = nodemailer.createTransport({

            host:'smtp.gmail.com',
            port:587 ,       
            secure:false ,    
            requireTLS:true,
            auth:{
                user:'robinrojimathew14@gmail.com',
                pass:'smrb iqje mylc qosz'

            }
        })

        const mailOptions = {
            from:'robinrojimathew14@gmail.com',
            to:email,
            subject:'For verification',
            text:  `HI,PLEASE VERIFY YOUR OTP ${otp} `,
            html: `YOUR OTP IS ${otp}`
        }
 transporter.sendMail(mailOptions,(error,info)=>{

    if(error){
        console.log('error, email is not going ');
        
        console.log(error.message);
        
    }else{
        console.log('email succesfully send',info);
        
    }
})
    }catch(err){
        console.log('error in the send virify mail ',err.message);
        
    }

}

///********/\/\*************************VERIFY MAIL ////////////////////***********************/

const verifMail = async(req,res)=>{
    try {

        const updatedinfo = await User.updateOne({_id:req.query.id},{$set:{is_veified:1}});
        res.render('verifyied');
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}
///************************PASSWORD HASHING///////////////////////////////////////////////////

const   securePassword = async(password)=>{

    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
        
    } catch (error) {
        console.log(error.message);
    }
}


///************************/ LOAD REGISTER PAGE ////////////////////////////////////////////

const loadRegister = async(req,res)=>{

    try {
        res.render('registration')
        
    } catch (error) {
        console.log('error in the rendering');
        console.log(error.message);      
    }
}

///***************       POST REGISTERING THE USER     //////////////////////////////////////////

const userRegister = async(req,res)=>{
    try {
        
        const otp = genrateOtp()
        const existingmail = await User.findOne({email:req.body.email})
    
        if(existingmail){
           res.render('registration',{message:'email alredy exist'})

        }else{

        const last_user = await User.findOne().sort({serial_number:-1})
        const spassword = await securePassword(req.body.password)
        const user = new User({
             firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:spassword,
            otp:otp,
            otpExpires:new Date(Date.now()+10*60*1000),
            is_admin:0,
            is_verified:1,
            
        })
       
        console.log('the user data is ',user);
        

        const userData = await user.save();
        if(userData){

            sendVerifyMail(req.body.firstname,req.body.email,userData._id,otp)

          return  res.redirect(`/verify-otp?id=${userData.id}`)
         }
         return   res.render('registration',{message:'enter valid details'})
        }  
          
    } catch (error) {
        console.log('error found while user registering');

        console.log(error.message);
        
    }
}

//*** */

    




///********************************OTP VERIFYING PAGE ///////////////////////////////////////////////////////////

const 
otp_verify = async(req,res)=>{

    try {
           const userId = req.query.id;
           console.log('the user id in otp verificatiin is ',userId);
           
           res.render('otp',{message:'otp send',userId})
        
    } catch (error) {
        console.log('error occured while passing otp',error.message);
        res.render('errorpage')
    }

}

////*********************************USER  POST LOGIN ////////////////////////////////////////////////////// 
const user_login = async (req,res)=>{
    console.log('user route working');
    

        console.log('login try is working ');
        
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email,block:false,is_verified:true});
            
        // console.log('the user is ',userData);
        try {  
        if (userData) {
            
            const passwordMatch = await bcrypt.compare(password,userData.password);
 
             if(passwordMatch){
                console.log('password is matching');
                
                 req.session.user_id=userData._id;
                 console.log('session is ',req.session.user_id);
                 
                 
                 res.redirect("/dash");

 
             }  else{
                console.log('missing in password match');
                
                 
                res.render('login',{message:'Email and password are incorrect'})            

            }

        } else {
            res.render('login',{message:'user is blocked'})  
            console.log('user is blocked');
                      
        }
    


    } catch (error) {
        console.log(error.message);
    }
}

///************************************* GENERATE OTP ******** /////////////////////////*/

 


// const otp = genrateOtp()

//  try {
//     const emailSent = await sendVerifyMail(email,otp)
//  if(!emailSent){
//     return res.json("email-error")
//  }
//         req.session.userOtp = otp;
//         req.session.userData= {email,password}

//  } catch (error) {
//     console.error('error',error);
    
    
 
//***************OTP POSTING ******** */////////////////////////////

const post_otp = async (req, res) => {
    try {
        const userId = req.body.id;
        const inputOTP = req.body.otp;
        

        

        const user = await User.findById(userId);

        if (!user) {
            console.log('not user is working ');
            
            return res.render('otp', { message: 'Invalid user ID. Please register again.' });
        }

        if (user.otp === inputOTP && new Date() < user.otpExpires) {
            
            
            
            user.is_verified = 1;
            user.otp = undefined;
            user.otpExpires = undefined;

            await user.save();

            res.render('login', { message: 'Email verified successfully!' });
        } else {
            console.log(user.otp);
            console.log(inputOTP);
            
            res.render('otp', { message: 'Invalid or expired OTP. Please try again.', userId: userId });
        }
    } catch (error) {
        console.log('its an error');
        
        console.log(error);
        res.render('otp', { message: 'An error occurred. Please try again.', userId: req.body.id });
    }
}



//***************** LOGIN ******************** */
const get_login = async(req,res)=>{
    try {
        
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}
///**********RESEND OTP *********** */

const resend_otp = async (req, res) => {
    try {
      const userId = req.body.id;
      console.log('this is the user id in resesnd otp ',userId);

      const user = await User.findById(userId);
      console.log('this is the user in resend otp ');
      
      
  
      if (!user) {
        return res.render('otp', { message: 'User not found. Please register again.', userId });
      }
  
      
      const newOtp = genrateOtp(6);
      user.otp = newOtp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
  
      await user.save();
  
     console.log('maile sending');
      
     sendVerifyMail(user.firstname,user.email,user._id,newOtp)
      console.log('maile sendded');
      res.render('otp', { message: 'A new OTP has been sent to your email.', userId });
    } catch (error) {
        console.log('catch is getting the error');
        
      res.render('otp', { message: 'An error occurred. Please try again.', userId: req.body.id });
    }
  };


//********* */

const get_resend_otp = async(req,res)=>{

    try {
           const userId = req.query.id;
           console.log('this is the id in resend otp  ',userId);
           
           res.render('otp',{message:'otp send',userId})
        
    } catch (error) {
        console.log('error occured while passing otp',error.message);
        res.render('errorpage')
    }

}


//***************** LOGOUT ********************/

const logout = async (req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
        
    }
}
//*********ERROR PAGE  *********/
const errorpage = async (req,res)=>{
    console.log('entering into the errorpage');
    
    try {
        res.render('errorpage')
    } catch (error) {
        console.log('error while loading errorpage',error.message);
        
        
    }
}

//*********** GET HOMEPAGE *****/


const  get_homePage  = async (req,res)=>{
    try {
        res.render('productHomepage')

    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');

        
        
    }
}

//***GET KIDS PAGE */

const get_kids = async(req,res)=>{
    try {
        res.render('kids')
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}

//***GET MENS  PAGE */

const get_mens = async(req,res)=>{
    try {
        res.render('mens')
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}


//***GET WOMENS PAGE */

const get_womens = async(req,res)=>{
    try {
        res.render('womens')
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}



//**LANDING PAGE */

    const landingPage = async(req,res)=>{
        try {

            const product= await Product.find()

            // console.log('the images are',product);

            if(!product){
                console.log('there is an error landing page');
                return res.redirect('/errorpage')
            }else{
                res.render('landingPage',{product});
            }
            
        } catch (error) {
            console.log(error.message);
            return res.redirect('/errorpage')
            
            
        }
    }
///*********GET PRODUCT PAGE ****/


const get_productPage = async (req,res)=>{
    console.log('loging into product get');
    let check
    try {
        const product = await Product.findById(req.params.id)
        // console.log('get product page is',product);
        // const cart = await Cart.findOne({ user: req.session.user_id }).populate('items.product');
    
         check = product.product_quantity<=0;
         console.log('the check is ',check)

        

        res.render('productPage',{product,check})

    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorpage')
    }
}


//***HOME PAGE *////

const shop = async(req,res)=>{
    try {

console.log('entered shopage');

        const searchQuery = req.query.q || ''
        const categoryId = req.query.category||null
        const sortOption = req.query.sort        

        console.log('the category is ',categoryId);

        let search = {isActive:true}

                
            if(categoryId){
                    search.product_category = categoryId;

            }


           if(searchQuery){
            search.product_name = {$regex: searchQuery,$options:'i'}
           }

            
            
        let sortCrieteria = {};
        switch(sortOption){
            case 'price_low_high':
                sortCrieteria={product_sale_price:1};
                break;
            case 'price_high_low':
                sortCrieteria= {product_sale_price:-1}    ;
                break;
            case 'newest':
                sortCrieteria ={createdAt:-1}    
                break
            case 'name_az':
                sortCrieteria = {product_name:1}    
                break;
            case 'name_za':
                sortCrieteria = {product_name:-1}  
                break;  
            }

        console.log('sort is ',sortCrieteria);
        



            const category = await Category.findById(categoryId)
            console.log('the catt is ',category)

        const activeProduct = await Product.find(search).sort(sortCrieteria).populate()
        console.log('activeProduct is ',activeProduct)
        
        const allCategories = await Category.find({isListed:true});



        let product = await Product.find({product_name:searchQuery})
        console.log('search route working',product);


            const page = parseInt (req.query.page)
            const limit = 4
            const skip =(page-1)*limit

            const totalProduct = await Product.countDocuments()
            product = await Product.find({product_name:searchQuery}).limit(limit).skip(skip)



        if(!activeProduct|| !allCategories){
            // console.log('there is an error landing page');
            return res.redirect('/errorpage')
        }else{
            res.render('shop',{
                product:activeProduct ,
                category:allCategories,
                sortOption,
                searchQuery,
                totalPages:Math.ceil(totalProduct/limit)

            });
        }
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
        
    }
}

//******* USER Get PROFILE ****/
const get_profile = async (req, res) => {
    try {
        console.log('Entering into the user profile route');
        // Check if session ID exists before querying the database
        if (!req.session.user_id) {
            console.log('User ID is not set in session');
            res.redirect('/login'); // Redirect to login if no session ID
           return
        } 

        const user = await User.findById(req.session.user_id);

        if (!user) {
            console.log('User not found');
            return res.redirect('/login'); // Redirect if no user is found
        }

        // If user is found, render the profile page
        res.render('userProfile', { user });
        console.log('The user is ', user);

    } catch (error) {
        console.log('Error is',error.message); // Log the complete error
       return res.redirect('/errorPage')
    }
};


//*** Profile Personal Edit */
const personalEdit = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.session.user_id,{

             $set: { firstname: req.body.firstName,
                    lastname: req.body.lastName,
                    DOB:req.body.dob
              } }, 
            { new: true } 
        );

        console.log('personal is', user);
        
        
        res.render('userProfile', { user });
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage');
    }
}

//***  Profile Contact Edit */

const contactEdit = async(req,res)=>{
    try {
        const user = await User.findByIdAndUpdate(req.session.user_id,{
            $set:{ phone:req.body.mobile,
                 alt_phone:req.body.alternateMobile
            }},

        {new:true},
        )
        console.log('this is the profiel user',user)

            res.render('userProfile',{user})
        

    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}

//*** Profile Password edit */

const passEdit = async(req,res)=>{
    console.log('entering into the passedit');
    
    try {
        const user = await User.findById(req.session.user_id)
        
        if(user){
            const password = user.password
            console.log('passs is',password);

            const currentPass = req.body.oldPassword
            const passMatch = await bcrypt.compare(currentPass,password)
            console.log('route is working till passMatch',passMatch);
            
            if(passMatch){
                console.log('loged intothe passmatch ');
                

                const hashedPass = await bcrypt.hash(req.body.newPassword,10)

                const updatedPass = await User.findByIdAndUpdate(req.session.user_id,{

                    $set:{password:hashedPass}},
                    {new:true}
                )
            
                
            }else{
                console.log('the passmatch is not going');
                
            }
             
            res.render('userProfile',{user}) 
        }

      
    
    } catch (error) {
        console.log('direct entering into the catch ');
        
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}
//********** Checkout ******/
loadCheckout = async (req, res) => {
    console.log('This is the loadCheckout');
    try {
        // Assuming req.session.userId contains the logged-in user's ObjectId
        const userId = req.session.user_id;
        
        if (!userId) {
            throw new Error('User not logged in');
        }

        console.log('User ID is', userId);
        
        // Fetch user details if needed (optional)
        // const user = await User.findById(userId);
        // console.log('User details:', user);
       

        // Fetch cart items for the logged-in user
        const cart = await Cart.findOne({ user: userId }).populate({ path: 'items.product'})
        const userCart = await Cart.findById(userId)
        

        const onlyItems = await Cart.findOne({user:userId})
        // console.log('onlyitems is ',onlyItems);
        
        const userAddress = await User.findById(userId).populate('address');
        // console.log('the address find is ',userAddress);
        
        if(cart&&cart.items.length>0){
            cart.totalSalesPrice = cart.items.reduce((total, item) => total +  item.totalPrice * item.quantity, 0);
         cart.totalRegularPrice = cart.items.reduce((total, item) => total + item.product.product_regular_price * item.quantity, 0);
            
        }else{
            cart.totalSalesPrice=0;
            cart.totalRegularPrice=0
        }

        if (!cart) {
            throw new Error('Cart not found for this user');
        }

        // console.log('Cart items issss:', cart);

        
        const coupen = await Coupen.find()
        // console.log('the coupens is ',coupen)
       
        
        // Pass the cartIt object to the EJS view
        res.render('checkoutPage',{ cart,userAddress:userAddress.address,onlyItems,userCart,coupen} );
        
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).send('An error occurred while loading the checkout page.');
    }
};


//**************  orderAddress  **************************/

const orderAddress = async (req,res)=>{
    try {
        console.log('entered in the order try');
        

        const userAddress = req.body.addressId


        const address = await Address.findById(userAddress)

        console.log('the address is ',address);

        const neworder  = new Order ({

            user:req.session.user_id,
            address:address

        })


        const order = await neworder.save()
        return res.redirect('/checkOut')
       
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}

//******* load_Editaddress   *************** */

const load_Editaddress = async(req,res)=>{
    console.log('entered into editaddress');
    
    try {
        const addressId = req.params.id;
        const address = await Address.findById(addressId)
        
        console.log('the adress is ',address);
        
        res.render('edit_editAddress',{address})
        
    } catch (error) {
        console.log(error.message);      
    }
}

const edit_Editaddress = async (req,res)=>{
    console.log('entered into the edit edit address');
    
    try {
        const{addressId,houseName,pinCode,po,location,state,} = req.body
        console.log(req.body);
        

        const changedAddress = await Address.findByIdAndUpdate(addressId,{
           houseName,pinCode,po,location,state,

        }, { new: true }
    

    )

   return  res.redirect('/checkOut')

        
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}

const select_address = async(req,res)=>{

    
    try {
        const address =  await Address.findById(req.params.id);
        console.log(address);
        

        const newaddress = new Order({
            user:req.session.user_id,
            address:address,


        })

        const orderAdderess =  await newaddress.save()
        return res.redirect('/checkOut')


    } catch (error) {
        console.log(error.message);
        
        
    }
}

//************ payment ***********/


const payment = async(req,res)=>{
    try {

        console.log('new is ',req.params.id);
        
        
    } catch (error) {
        console.log(error.message);
        
    }
}
//********  Place Order   **************** */
const placeOrder = async (req, res) => {

    try {
        

        const {cartId,addressId}= req.body

        const paymentMethod = req.body.paymentMethod || 'COD'; 
    
        if (!addressId) {
            return res.status(400).send('Missing required fields');
        }
    
        const address = await Address.findById(addressId);
        // console.log('the address needed is ',address)
        const cart = await Cart.findById(cartId).populate({
            path: 'items.product',
            populate: { path: 'product_category' }
        });
    
        if (!address || !cart) {
            return res.status(404).send('Cart or address not found');
        }
    
        // console.log('Item product:', cart.items);


        const orderItems = cart.items.map(item => ({
            product: item.product?._id,
            productName: item.product?.product_name,
            brandName: item.product?.product_brand,
            category: item.product?.product_category?._id,
            categoryName: item.product?.product_category?.name,
            quantity: item.quantity,
            itemOrderStatus: 'confirmed',
            price: item.product.product_sale_price,
            regularPrice: item.product.product_regular_price,            
            images: item.product?.product_image,
            itemOffer: item.itemOffer || null

        }));
    
        
        const orderdata = await new Order({
            items: orderItems,
            user: cart.user?._id,
            totalItems: cart.items.length,
            subTotalAmount: cart.summary?.subtotal||0,
            couponDiscount: cart.summary?.couponDiscount||0,
            offerDiscount:cart.summary?.offerDiscount||0,
            totalAmount: cart.totalSalesPrice,
            orderDate: Date.now(),
            orderStatus: 'confirmed',
            onlinePaymentId: payment || null,
            paymentMethod:paymentMethod || 'COD',
            paymentStatus: ['Razorpay', 'wallet'].includes(paymentMethod) ? 'completed' : 'pending',
            shippingAddress:addressId
              
        }).save();
        
         // Clear the user's cart
         await Cart.findOneAndUpdate(
            { user:req.session.user_id },
            { $set: { items: [], totalRegularPrice: 0, totalSalesPrice: 0 } },
            { new: true }
        );
    
    res.render('orderPlaced')


    } catch (error) {

        console.log(error.message)
        res.redirect('/errorPage')
    }
 
   
}



//************  ORder Page *//////////////////

const loadOrders = async (req,res)=>{
    console.log('welcome');
    const user = req.session.user_id

    
    
    try {

        const orderId = req.query.item;
       console.log(orderId)

       const item = await Order.findByIdAndDelete(orderId,{ new: true })
       console.log(item);
       
       const orders = await Order.find({user:user}).sort({createdAt:-1})
       const orderAdderess= await Order.find({user:user}).populate('shippingAddress')
    //    console.log('the new item is ',orders)

        res.render('orderPage',{orders})
    } catch (error) {
        console.log(error.message);
        
        
    }
}

//*********  editOrderPage  ************ */

const OrderDetailPage = async(req,res)=>{
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId).populate('user')
        const orderAddress = await Order.findById(orderId).populate('shippingAddress')
        console.log(order)
        res.render('OrderDetailPage',{order,orderAddress})
    } catch (error) {
        console.log(error.message);
        
        
    }
}

//*********  updateOrder  */

const updateOrder = async(req,res)=>{
    try {

        const id = req.params.id
        const statusUpdate = await Order.findByIdAndUpdate(id,{$set:{status:req.body.status}},{new:true})

        res.redirect(`/Order_DetailPage/${id}`)
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
    
    }
}

///************************  delete */

const deleteOrder = async (req,res)=>{
    try {
        const orderData = await Order.findOne({_id:req.params.id})
        console.log('the orderdata is ',orderData)
        console.log('reached the order cancel',req.params.id);

        const existingUser = await Wallet.findOne({user:orderData.user})
        if(existingUser){
            console.log('existing',existingUser);
            existingUser.balance+=orderData.totalAmount
            existingUser.save()
            const order = await Order.findByIdAndDelete(req.params.id)
            res.redirect('/orders')
        }else{

            
        const walletData = await new Wallet({
            user:req.session.user_id,
            balance:orderData.totalAmount


        })

        walletData.save()
        
        const order = await Order.findByIdAndDelete(req.params.id)

       
        return res.redirect('/orders')

        }


        
    } catch (error) {
        console.log(error.message); 
    }
}

//*************  Load wishlist  ************/
const loadWishList = async (req, res) => {
    try {
        const products = await WishList.find({ user: req.session.user_id }).populate('product');
        console.log('ll',products._id)
       
        res.render('wishList', { product: products});
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage');
    }
};


//*********** Wishlist  ********************/


const wishlist = async(req,res)=>{
    try {
        const list = new WishList({
            user:req.session.user_id,
            product:req.params.id
        })
const existing = await WishList.findOne({product:req.params.id})
    
if(existing){
console.log('item alredy exist in the wishlist')
return res.redirect('/shop');

}
        await list.save()
        console.log('saved')
        res.redirect('/wishList')
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

//*******  Delete the product from the wishlist */

const remove_product = async(req,res)=>{
    console.log('entered');
    
    try {
        const product = req.params.id
        console.log('gg',product.product_name)
        console.log(product)
        const delete_product = await WishList.findByIdAndDelete(product)
        return res.redirect('/wishList');
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


//**********  Razorpay******************** */


// Create Order
const razorPayment = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in paise (e.g., ₹500 -> 50000 paise)
      currency: currency || "INR",
      receipt: receipt || `receipt_${Math.random() * 1000}`,
      payment_capture: 1, // Auto-capture the payment
    };

    const order = await razorPay.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};



//***********             **************************  */




const verify_razorPay = async (req, res) => {
  
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
  
    if (generatedSignature === razorpay_signature) {
 
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  };

//******************   Order placed page *************/
const orderPlaced = async(req,res)=>{
    try {
        res.render('orderPlaced')
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}

//******************  selectCoupen   */

const selectCoupen = async(req,res)=>{
    try {
        const {coupenId,cartId}=req.body

        
        // console.log('entered and the coupen id is',req.body)
        const coupen = await Coupen.findOne({_id:coupenId});
        // console.log(coupen)
        const cart = await Cart.findOne({user:req.session.user_id});
        console.log('sales price',cart.totalRegularPrice);
        
        const coupenamount = cart.totalRegularPrice*(coupen.discountPercentage/100);

    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}

//************ applyCoupen ********** */

const applyCoupen = async(req,res)=>{
    console.log('entered in the applyCoupen')
    try {
        const {couponCode} = req.body
        console.log('bgt',couponCode)

        const cart = await Cart.findOne({user:req.session.user_id})
        // console.log(cart)

        const coupon = await Coupen.findOne({ code: couponCode });
        console.log(coupon)

        const existingCoupon = await Coupen.findOne({
            code: couponCode, // Check for the correct coupon code
            usedBy: { $in: [req.session.user_id] } // Check if the user's ID is in the usedBy array
        });
                console.log('existing',existingCoupon)

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }
        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }
        if(existingCoupon){
            return res.status(400).json({message:'Coupen alredy claimed by the user'})
        }
        

           
            const salesPrices = cart.totalSalesPrice;       
            // console.log(salesPrices)

            if (salesPrices < coupon.minimumPurchaseAmount) {
                return res.status(400).json({ message: `Minimum purchase of ${coupon.minimumPurchaseAmount} required to use this coupon` });
            }

            let discountAmount = 0
            let finalPrice
            discountAmount = (coupon.discountPercentage / 100) * salesPrices
            finalPrice = cart.totalSalesPrice-discountAmount
            console.log('am',discountAmount)

            cart.totalSalesPrice = finalPrice;

            coupon.usedBy=req.session.user_id
         await coupon.save()
        await cart.save();
        // console.log('check',coupon)
        // console.log(req.session.user_id)

            res.json({ amount:discountAmount,finalPrice});
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
        
    }
}


const returnAmount = async (req,res)=>{
    const {couponCode} =req.body
    try {
       

        const existingCoupon = await Coupen.findOne({
            code: couponCode, // Check for the correct coupon code
            usedBy: { $in: [req.session.user_id] } // Check if the user's ID is in the usedBy array
        });
               
        if (existingCoupon) {
            await Coupen.updateOne(
                { code: couponCode },
                { $pull: { usedBy: req.session.user_id } }
            );
            
        }
        
       
        console.log('returnAmount route is getting ')
        const {price} = req.body
        console.log(price)
        const cart = await Cart.findOne({user:req.session.user_id})
        console.log(cart)
        cart.totalSalesPrice+=price
        await cart.save()
        console.log(cart.totalSalesPrice)
        res.json({returnAmount:cart.totalSalesPrice})
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')

        
        
    }
}

//*******  wallet   *********/

const wallet = async(req,res)=>{
    try {
        const walletAmount = await Wallet.findOne({user:req.session.user_id})
        res.render('wallet',{walletAmount:walletAmount.balance})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
      
    }
}

//***** load_checkout_addAddress */
const load_checkout_addAddress = async(req,res)=>{
    try {
        res.render('checkoutAddaddress')
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

//**** checkout_addAddress  */
const checkout_addAddress = async(req,res)=>{
    try {
        
const existingUser = await User.findById(req.session.user_id)

const address = new Address({
    houseName:req.body.houseName,
    
    pinCode:req.body.pinCode,
    po:req.body.po,
    location:req.body.location,
    state:req.body.state,
    address:req.body.address,
})
const newAddress = await address.save()
existingUser.address.push(newAddress._id)
await existingUser.save()


console.log('address is ',newAddress);

return res.redirect('/checkOut')

    } catch (error) {
        consol.log(error.message)
            res.redirect('/errorPage')
        
        
    
}
}

//********   load_forgotPassword  */

const load_forgotPassword = async(req,res)=>{
    try {
        console.log('entered into the forgot password route');
        return res.render('forgotPassword',{msg:''})
        
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}


//*******  verify_mail  */
const verify_mail = async(req,res)=>{
    try {
        console.log('enterd in the verify mail');
        const {email}=req.body

        const user = await User.findOne({email:email})

        if(!user){
          return res.render('forgotPassword',{msg:'user not found'})
        }

    const otp = genrateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();
    console.log('the new otp is ',user.otp)

    sendVerifyMail(user.firstname,user.email,user._id,user.otp)

    res.render('resetPasswordOtp',{message:'',user})
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')

        
    }
}

//******** otp_forgotPassword */

const otp_forgotPassword = async(req,res)=>{
    try {

        const {otp,userId} =req.body;
        const user = await User.findById(userId);

        console.log('the inputotp iss',userId)
        console.log('the userid is ',user)

        if(otp===user.otp){
            console.log('its matching');
            req.session.user_id=user
            res.redirect('/')

            
        }else{
            return res.render('resetPasswordOtp',{message:'user not found',user})
        }

        
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
    }
}

const add_toCart = async(req,res)=>{
    try {
        console.log('hhh',req.params.id)
        const product = await Product.findOne({_id:req.params.id})
        const wish = await WishList.findOne({_id:req.params.id})
        console.log(product.product_name)
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}























module.exports={
    loadRegister,
    userRegister,
    otp_verify,
    user_login,
    verifMail,
    post_otp,
    get_login,
    resend_otp ,
    get_resend_otp,
    logout,
    errorpage,
    get_homePage,
    get_kids,
    get_mens,
    get_womens,
    landingPage,
    get_productPage,
    shop,
    get_profile,
    personalEdit,
    contactEdit,
    passEdit,
    loadCheckout,
    orderAddress,
    load_Editaddress,
    edit_Editaddress,
    select_address,
    payment,
    placeOrder,
    loadOrders,
    OrderDetailPage,
    updateOrder,
    deleteOrder,
    loadWishList,
    wishlist,
    remove_product,
    razorPayment,
    verify_razorPay,
    orderPlaced,
    selectCoupen,
    applyCoupen,
    returnAmount,
    wallet,
    load_checkout_addAddress,
    checkout_addAddress,
    load_forgotPassword,
    verify_mail,
    otp_forgotPassword,
    add_toCart
    

}