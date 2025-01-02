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
const ReturnOrder= require('../model/returnOrderModel')
const PDFDocument = require('pdfkit');





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
        return res.redirect('/errorpage');        
        
    }
}
///************************PASSWORD HASHING///////////////////////////////////////////////////

const   securePassword = async(password)=>{

    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
    }
}


///************************/ LOAD REGISTER PAGE ////////////////////////////////////////////

const loadRegister = async(req,res)=>{
    let message=null

    try {
        res.render('registration',{message})
        
    } catch (error) {
        console.log('error in the rendering');
        console.log(error.message);    
        return res.redirect('/errorpage');  
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
        return res.redirect('/errorpage');
        
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
        return res.redirect('/errorpage');    }

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
        return res.redirect('/errorpage');
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
        return res.redirect('/errorpage');
    }
}



//***************** LOGIN ******************** */
const get_login = async(req,res)=>{
    try {
        
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');
        
        
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
        return res.redirect('/errorpage');    }

}


//***************** LOGOUT ********************/

const logout = async (req,res)=>{
    try {
        req.session.destroy()
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
        const product = await Product.find({product_category:'66c78d2879c7f4f9a7662631'})

        res.render('kids',{product})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}

//***GET MENS  PAGE */

const get_mens = async(req,res)=>{
    try {

        const product = await Product.find({product_category:'66fbfa8890265e7603416406'})
        console.log('mens is ',product)
        res.render('mens',{product})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}


//***GET WOMENS PAGE */

const get_womens = async(req,res)=>{
    try {
        const product = await Product.find({product_category:'66c78d3279c7f4f9a7662634'})

        res.render('womens',{product})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}



//**LANDING PAGE */

    const landingPage = async(req,res)=>{
        try {

            const product= await Product.find().limit(6)

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

const shop = async (req, res) => {
    try {
        const { q: searchQuery, category: categoryId, sort: sortOption, page } = req.query;

        let search = { isActive: true };
        let sortCriteria = {};

        // Category filtering
        if (categoryId) {
            search.product_category = categoryId;
        }

        // Search filtering
        if (searchQuery) {
            search.$or = [
                { product_name: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        // Sorting logic
        switch (sortOption) {
            case 'price_low_high':
                sortCriteria = { product_sale_price: 1 };
                break;
            case 'price_high_low':
                sortCriteria = { product_sale_price: -1 };
                break;
            case 'newest':
                sortCriteria = { createdAt: -1 };
                break;
            case 'name_az':
                sortCriteria = { product_name: 1 };
                break;
            case 'name_za':
                sortCriteria = { product_name: -1 };
                break;
            default:
                sortCriteria = { createdAt: -1 }; // Default sort by newest
        }

        // Pagination
        const currentPage = parseInt(page) || 1;
        const limit = 9;
        const skip = (currentPage - 1) * limit;

        // Fetch categories, total count, and products with combined filtering and sorting
        const [allCategories, totalProductCount, products] = await Promise.all([
            Category.find({ isListed: true }),
            Product.countDocuments(search),
            Product.find(search)
                .sort(sortCriteria)
                .limit(limit)
                .skip(skip)
                .populate('product_category')
        ]);

        res.render('shop', {
            product: products,
            category: allCategories,
            sortOption,
            searchQuery,
            currfilters: req.query,
            totalPages: Math.ceil(totalProductCount / limit),
            currentPage
        });
    } catch (error) {
        console.error('Shop page error:', error);
        res.redirect('/errorPage');
    }
};


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
        
        
        return  res.render('userProfile',{user,
            message: 'Details saved',
            alertType: 'success'}) 
        
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

        return  res.render('userProfile',{user,
            message: 'Contact Updated',
            alertType: 'success'}) 
        

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
            const passMatch =  await bcrypt.compare(currentPass,password)
            console.log('route is working till passMatch',passMatch);
            
           
            

            if(!passMatch){
                console.log('not current password ');
               return  res.render('userProfile',{user,
                    message: 'Current Password is not Matching',
                    alertType: 'error'}) 


            }


            if(req.body.newPassword.length<8){
                return  res.render('userProfile',{user,
                    message:'Passwords should be atleast 8 letters',
                    alertType:'error'

            })
        }

       

            if(req.body.newPassword!== req.body.confirmNewPassword){
                console.log(req.body.newPassword);
                console.log(req.body.confirmNewPassword);


                return  res.render('userProfile',{user,
              message:'Passwords are not matching',
              alertType:'error'
                  }
             
          )
      }
            
            
            else{
                

                
                const hashedPass = await bcrypt.hash(req.body.newPassword,10)

                const updatedPass = await User.findByIdAndUpdate(req.session.user_id,{

                    $set:{password:hashedPass}},
                    {new:true}
                )
            
                
            
             
            res.render('userProfile',{user,
                message: 'Password changed',
                alertType: 'success'}) 
                req.session.destroy()
                
            }
                

        }

      
    
    } catch (error) {
        console.log('direct entering into the catch ');
        
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}
//********** Checkout ******/
loadCheckout = async (req, res) => {

    const userId = req.session.user_id;
    const cart = await Cart.findOne({ user: userId }).populate({ path: 'items.product'})
    const validCart = await Cart.findOne({ user: userId }).populate('items')
    if(validCart.items.length<=0){
        console.log('no cart items found ')
        
        return res.redirect('/cart_page')
    }
    
    
    console.log('This is the loadCheckout');
    try {
        // Assuming req.session.userId contains the logged-in user's ObjectId
        
        if (!userId) {
            throw new Error('User not logged in');
        }

        console.log('User ID is', userId);
        
        // Fetch user details if needed (optional)
        // const user = await User.findById(userId);
        // console.log('User details:', user);
       
        const wallet = await Wallet.findOne({user:req.session.user_id})

        if(!wallet){

           const wallet = new Wallet({

                user: req.session.user_id,
                balance: 0

            })
            await wallet.save();

            
        // Fetch cart items for the logged-in user

        console.log('the total sales price is ',cart.totalSalesPrice)
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
       
        let  temp =0
        
        // Pass the cartIt object to the EJS view

        console.log('the finding balance is ',wallet)
     
        return  res.render('checkoutPage',{ cart,userAddress:userAddress.address,onlyItems,userCart,coupen,temp,wallet}, );

        }
        

        // Fetch cart items for the logged-in user

        console.log('the total sales price is ',cart.totalSalesPrice)
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
       
        let  temp =0
        
        // Pass the cartIt object to the EJS view

        console.log('the finding balance is ',wallet)
     
        res.render('checkoutPage',{ cart,userAddress:userAddress.address,onlyItems,userCart,coupen,temp,wallet}, );
      
    } catch (error) {
        console.log('Error:', error.message);
        return res.redirect('/errorpage');    }
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
        return res.redirect('/errorpage');
    }
}

//********************* */
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
        return res.redirect('/errorpage');
        
        
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
        return res.redirect('/errorpage');
        
        
    }
}

//************ payment ***********/


const payment = async(req,res)=>{
    try {

        console.log('new is ',req.params.id);
        
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');
        
    }
}
//********  Place Order   **************** */
const placeOrder = async (req, res) => {

    try {
        

        const {cartId,addressId,coupenOffer,totalSalesPrice}= req.body
        const theCart = await Cart.findById(cartId).populate('items')
            // console.log('bbbbb',selectedPaymentMethods)
        const paymentMethod = req.body.paymentMethod || 'COD'; 
    
        if (!addressId) {
            return res.status(400).send('Missing required fields');
        }
    
        const address = await Address.findById(addressId);
        // console.log('the address needed is ',address)
        const cart = await Cart.findById(cartId).populate({ path: 'items.product', populate: { path: 'product_category' } });

        console.log('the main carttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt is ', cart.totalSalesPrice)
    
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
        orderItems.forEach(async function(item){
            await Product.findOneAndUpdate({_id:item.product},
                {$inc:{product_quantity:-item.quantity}}
            )
        })
        
        const orderdata = await new Order({
            items: orderItems,
            user: cart.user?._id,
            totalItems: cart.items.length,
            subTotalAmount: cart.summary?.subtotal||0,
            couponDiscount: coupenOffer||0,
            offerDiscount:cart.summary?.offerDiscount||0,
            totalAmount: cart.totalSalesPrice,
            orderDate: Date.now(),
            orderStatus: 'confirmed',
            onlinePaymentId:null,
            paymentMethod:paymentMethod || 'COD',
            paymentStatus: ['RazorPay', 'wallet'].includes(paymentMethod) ? 'completed' : 'pending',
            shippingAddress:addressId,
            customOrderId:Math.floor(100000 + Math.random() * 900000),
              
        }).save();
        
         // Clear the user's cart
         await Cart.findOneAndUpdate(
            { user:req.session.user_id },
            { $set: { items: [], totalRegularPrice: 0, totalSalesPrice: 0 } },
            { new: true }
        );

       
        //   METHOD THAT WILL ADD THE SALES COUNT OF THE PRODUCT //

        // for (const item of cart.items) {
        //     await Product.findOneAndUpdate(
        //         { _id: item.product }, // Match the product by its ID
        //         { $inc: { sales_count: item.quantity } } // Increment the sales count by the quantity
        //     );
        // }
        
        




    res.render('orderPlaced')


    } catch (error) {

        console.log(error.message)
        res.redirect('/errorPage')
    }
 
   
}



//************  ORder Page *//////////////////
const loadOrders = async (req, res) => {
    console.log('welcome');
    const user = req.session.user_id;

    try {
        const orderId = req.query.item;
        console.log(orderId);

        if (orderId) {
            const item = await Order.findByIdAndDelete(orderId, { new: true });
            console.log(item);
        }

        // Pagination logic
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 5; // Default to 5 orders per page
        const skip = (page - 1) * limit;

        // Fetch paginated orders
        const orders = await Order.find({ user: user })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments({ user: user }); // Total number of orders for the user

        // Populate shipping address for orders (if needed)
        const orderAdderess = await Order.find({ user: user }).populate('shippingAddress');

        // Render the page with orders and pagination info
        res.render('orderPage', {
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            limit
        });
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');
    }
};


//*********  editOrderPage  ************ */

const OrderDetailPage = async(req,res)=>{
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId).populate('user')
        const orderAddress = await Order.findById(orderId).populate('shippingAddress')
        console.log(order)
        console.log("the ordder address is ",orderAddress)
        res.render('OrderDetailPage',{order,orderAddress})
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');
        
        
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
const deleteOrder = async (req, res) => {
    try {
        // Check if the order is COD
        const cod = await Order.findOne({ _id: req.params.id, paymentMethod: 'COD' });
        console.log('method', cod);
        console.log('the params is for',req.params.id)
        let orderId = await Order.findById(req.params.id).populate('items')
        console.log('searching for the id is ',orderId)

        // Cancel the order
        await Order.findByIdAndUpdate(req.params.id, { orderStatus: 'cancelled' }, { new: true });

        console.log('the product need is ',orderId.items[0].product)

        orderId.items.forEach(async function (item){
            await Product.findOneAndUpdate({_id:item.product},{$inc:{product_quantity:item.quantity}})
         })

        const addQuantity = await Product.findOne({_id:orderId.items[0].product})
        // console.log('the prooooooooooooooooooooooooodddddddddddddduuuuuuuuuuuuuuucccccccccccccctttttttttt is',addQuantity)
        const orderData = await Order.findOne({ _id: req.params.id });

        if(!cod){


// Handle wallet refund logic
const existingUser = await Wallet.findOne({ user: req.session.user_id });

if (existingUser) {
    console.log('existing wallet:', existingUser);

    // Update wallet balance
    existingUser.balance += orderData.totalAmount;

    // Push transaction details
    existingUser.transactions.push({
        orderId: req.params.id,
        amount: orderData.totalAmount,
        type: 'credit', // Refund is a credit transaction
        status: 'success',
        walletFrom:'Cancelled Product'

    });

    // Save the updated wallet
    await existingUser.save();
} else {
    // Create a new wallet with the transaction
    const walletData = new Wallet({
        user: req.session.user_id,
        balance: orderData.totalAmount,
        transactions: [
            {
                orderId: req.params.id,
                amount: orderData.totalAmount,
                type: 'credit', // Refund is a credit transaction
                status: 'success',
                walletFrom:'Cancelled Product'
            },
        ],
    });

    await walletData.save();
}
    return res.redirect('/orders')
        }

        

        return res.redirect('/orders');
    } catch (error) {
        console.error(error.message);
        // res.status(500).send('Internal Server Error');
        return res.redirect('/errorpage');
    }
};


//*************  Load wishlist  ************/
const loadWishList = async (req, res) => {
    try {
        const products = await WishList.find({ user: req.session.user_id }).populate('product');
        // console.log('the products is ',products)
       
        res.render('wishList', { product: products});
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage');
    }
};


//*********** Wishlist  ********************/


const wishlist = async(req,res)=>{
    console.log('the responce productId is',req.body.productId)

const existing = await WishList.findOne({product:req.body.productId})

    try {
        
    if(existing){
        const product = await WishList.find({ user: req.session.user_id }).populate('product');
        console.log('item alredy exist in the wishlist')
         const sendStatus = true
          return res.json({sendStatus})

        // return res.redirect('/wishList');
    
    }
        const list = new WishList({
            user:req.session.user_id,
            product:req.body.productId
        })
        await list.save()
        console.log('saved')
        res.json({success:true})
        
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
console.log('the amount is ',amount)
  try {
    const options = {
      amount: amount * 100, // Amount in paise (e.g., ₹500 -> 50000 paise)
      currency: currency || "INR",
      receipt: receipt || `receipt_${Math.random() * 1000}`,
      payment_capture: 1, // Auto-capture the payment
    };

    const order = await razorPay.orders.create(options);

    console.log('razorpay 1')

    if (!order){
        console.log('razorpay 2')
        return res.status(500).send("Some error occurred")
    } 
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    // res.status(500).send("Server Error");
    return res.redirect('/errorpage');
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
        console.log('failed razorpay payment')
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
            discountAmount = Math.round((coupon.discountPercentage / 100) * salesPrices)

            if(discountAmount>coupon.maxDiscountAmount){
                console.log('limit crossed ')

                discountAmount = coupon.maxDiscountAmount
                finalPrice = Math.round(cart.totalSalesPrice-discountAmount)
                console.log('am',discountAmount)
    
                cart.totalSalesPrice = finalPrice;
    
                coupon.usedBy=req.session.user_id
             await coupon.save()
            await cart.save();
            
            }else{

                finalPrice = Math.round(cart.totalSalesPrice-discountAmount)
                console.log('am',discountAmount)
    
                cart.totalSalesPrice = finalPrice;
    
                coupon.usedBy=req.session.user_id
             await coupon.save()
            await cart.save();
            }
           
        // console.log('check',coupon)
        // console.log(req.session.user_id)
            console.log('dddd',discountAmount)
            console.log('fff',finalPrice)
            res.status(200).json({ amount:discountAmount,finalPrice,couponCode});
            console.log('here is the response')
    } catch (error) {
        console.log(error.message)
        console.log('enterd in the catch')
        res.redirect('/errorPage')
        
        
    }
}

//************************* */
const returnAmount = async (req,res)=>{
    console.log('entering to return amount')
    const {couponCode} =req.body
    console.log('the coupencode is the :',couponCode)
    try {
       

        const existingCoupon = await Coupen.findOne({
            code: couponCode, // Check for the correct coupon code
            usedBy: { $in: [req.session.user_id] } // Check if the user's ID is in the usedBy array
        });
               
        if (existingCoupon) {
            console.log('yes existing ')
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

const wallet = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = 5; // Set the number of items per page
        const currentPage = parseInt(req.query.page) || 1; // Get current page from query parameters, default is 1

        // Fetch the wallet for the user
        const wallet = await Wallet.findOne({ user: req.session.user_id }).sort({ createdAt: -1 });

        if (!wallet) {
            // If wallet doesn't exist, create a new one
            const newWallet = new Wallet({
                user: req.session.user_id,
                balance: 0
            });
            await newWallet.save();
            // Fetch the newly created wallet
            const wallet = await Wallet.findOne({ user: req.session.user_id }).sort({ createdAt: -1 });
            let transactions=0
            return res.render('wallet', { wallet,transactions });
        }

        // Get the total number of transactions and calculate total pages
        const totalTransactions = wallet.transactions.length;
        const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

        // Sort the transactions in descending order (most recent first)
        const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginate the transactions
        const transactions = sortedTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        // Render the wallet page with paginated transactions
        res.render('wallet', {
            wallet,
            transactions,
            currentPage,
            totalPages,
            totalTransactions
        });
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage');
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
        console.log(error.message)
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


///**************************** */

const retrunOrder = async(req,res)=>{
    try {
        const orderId = await Order.findById(req.params.id)
        console.log('reason',req.body.returnReason)
       
        await Order.findByIdAndUpdate(req.params.id, { orderStatus: 'Return Initiated' }, { new: true });

        const returnOrder = new ReturnOrder({
            order:orderId._id,

            productRefundAmount:orderId.totalAmount,
            returnReason:req.body.returnReason
        })
        console.log('id is ',orderId)
         await returnOrder.save()


        res.json({success:true})

    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


const failedPayment = async(req,res)=>{
    try {
        console.log('kkll',req.params)
        const {paymentId, selectAddressId, orderId} = req.body
        console.log(req.body)

        const address = await Address.findById(selectAddressId)
        const cart = await Cart.findById(orderId)
    .populate({
        path: 'items.product', // Populate the product field in the items array
        select: 'product_name product_regular_price product_sale_price product_image product_brand product_description  product_category  ' // Fetch specific fields
    })
    .exec();

if (cart) {
    console.log(JSON.stringify(cart, null, 2)); // This will print the full cart details with populated products
} else {
    console.log('Cart not found');
}

    
    console.log(cart);
            console.log('the address is ',address)
        console.log('the cart is ',cart.product)

    
        const list = cart.items.map((item)=> ({
            product: item.product?._id,
            productName: item.product?.product_name,
            brandName: item.product?.product_brand,
            category: item.product.product_category,
            categoryName: item.product?.product_category?.name,
            quantity: item.quantity,
            itemOrderStatus: 'confirmed',
            price: item.product.product_sale_price,
            regularPrice: item.product.product_regular_price,            
            images: item.product?.product_image,
            itemOffer: item.itemOffer || null

        }));
        const paymentMethod = 'RazorPay'
        const failedOrder = await new Order({
            onlinePaymentId:paymentId,
            items:list,
            user:req.session.user_id,
            totalItems: cart.items.length,
            subTotalAmount: cart.summary?.subtotal||0,
            couponDiscount:' 0',
            offerDiscount:cart.summary?.offerDiscount||0,
            totalAmount: cart.totalSalesPrice,
            orderDate: Date.now(),
            orderStatus: 'pending',
            onlinePaymentId: payment || null,
            paymentMethod:paymentMethod,
            paymentStatus: ['RazorPay', 'wallet'].includes(paymentMethod) ? 'completed' : 'pending',
            shippingAddress:address

        }).save()

        console.log('new order is',failedOrder)

        return res.json({success:true})
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

///*******  retryPage  **** */

const retryPage = async(req,res)=>{
    const {paymentId} = req.query
    try {
        res.render('paymentRetryPage',{paymentId})
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}


///** retry_payment*  */
 
const retry_payment = async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error.message)
        res.redirect('errorPage')
        
    }
}

///** retryCheckout */

const retryCheckout = async(req,res)=>{
    try {
        const wallet = await Wallet.findOne({user:req.session.user_id}).populate('transactions')
        const {orderId} = req.body
        console.log(orderId)

        res.render('retryCheckout',{wallet})
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorpage');
        
    }
}


//****   checkOut2   ** */
const checkOut2 = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.user_id;

        if (!userId) {
            throw new Error('User not logged in');
        }
        const wallet = await Wallet.findOne({user:req.session.user_id})
        console.log('User ID:', userId);

        // Fetch the order details by ID and populate necessary fields
        const order = await Order.findById(orderId)
            .populate('items.product') // Populate product details
            .populate('items.category'); // Populate category details

        if (!order) {
            throw new Error(`Order not found for ID: ${orderId}`);
        }

        console.log('Order Details:', order);

        // Fetch user details, including addresses
        const userAddress = await User.findById(userId).populate('address');
        const addresses = userAddress?.address || [];

        // Initialize an empty cart as a fallback
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        console.log('the user cart is ',cart)
        if (!cart) {
            console.log('Cart not found for user. Initializing empty cart.');
        }

        const cartItems = cart?.items || [];
        let totalSalesPrice = 0;
        let totalRegularPrice = 0;

        // Calculate totals if cart items are present
        if (cartItems.length > 0) {
            totalSalesPrice = cartItems.reduce(
                (total, item) => total + (item.product.product_sale_price * item.quantity),
                0
            );
            totalRegularPrice = cartItems.reduce(
                (total, item) => total + (item.product.product_regular_price * item.quantity),
                0
            );
        }

        // Fetch coupons (if applicable)
        const coupen = await Coupen.find() || [];
        console.log('Coupons fetched:', coupen);

        // Placeholder for other data
        const temp = 0;

        console.log('the id is  ',cart._id)

        const oldOrderId = await Order.findByIdAndDelete(orderId)

        // Render the checkout page with all data
        res.render('checkoutPage', {
            cart: { items: cartItems, totalSalesPrice,totalRegularPrice,  },
            userAddress: addresses,
            order,
            totalSalesPrice,
            coupen,
            cart,
            wallet,
            temp,
            onlyItems: {totalSalesPrice} // Pass the cart items as onlyItems
        });
    } catch (error) {
        console.error('Error:', error.message);
        // res.status(500).send('An error occurred while loading the checkout page.');
        return res.redirect('/errorpage');
    }
};

//********  downloadInvoice   */

const downloadInvoice = async (req, res) => {
    try {
        console.log(req.params.id);

        // Fetch the order details from the database
        const order = await Order.findById(req.params.id)
            .populate('user') // Populate user details
            .populate('items.product') // Populate product details
            .populate('shippingAddress'); // Populate shipping address

        console.log(order);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Set headers for the PDF file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Invoice_${order._id}.pdf`
        );

        const doc = new PDFDocument({ margin: 30 });
        doc.pipe(res);

        // Header Section with Company Info
        doc.rect(30, 30, 540, 70).fill('#f5f5f5'); // Light background for the header
        doc.fillColor('#000').fontSize(20).text('ArmorEdge', 50, 50);
        doc.fontSize(10).text('Phone: 9285888432 | Email: armoredge@gmail.com', 50, 70);
        doc.fontSize(12).text(`Invoice: ${order._id}`, 400, 60, { align: 'right' });
        doc.fontSize(10).text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 400, 30, { align: 'right' });
        doc.moveDown(2);

        // Line separator
        doc.moveTo(30, 110).lineTo(570, 110).stroke();

        // Customer Details Section
        doc.fontSize(14).fillColor('#000').text('Customer Details:', 30, 120);
        doc.fontSize(12).text(`Name: ${order.user.firstname} ${order.user.lastname}`, 50, 140);
        doc.text(`Email: ${order.user.email}`, 50, 155);
        doc.text(
            `Shipping Address: ${order.shippingAddress.location}, ${order.shippingAddress.po}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}`,
            50,
            170
        );
        doc.text(`Payment Method: ${order.paymentMethod}`, 50, 185);
        doc.moveDown(2);

        // Line separator
        doc.moveTo(30, 200).lineTo(570, 200).stroke();

        // Items Section
        doc.fontSize(14).text('Items:', 30, 220);
        doc.moveDown(0.5);

        // Table Header
        const tableTop = 240;
        const itemColumnWidths = [30, 250, 80, 80, 80];
        const headers = ['S.No', 'Product Name', 'Quantity', 'Unit Price', 'Total'];
        headers.forEach((header, index) => {
            doc.fontSize(12)
                .text(header, 30 + itemColumnWidths.slice(0, index).reduce((a, b) => a + b, 0), tableTop, {
                    width: itemColumnWidths[index],
                    align: 'center',
                });
        });

        // Line separator for table header
        doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();

        // Table Rows
        let rowTop = tableTop + 20;
        order.items.forEach((item, index) => {
            const total = (item.quantity * item.price).toFixed(2);
            const columns = [
                `${index + 1}`,
                `${item.productName}`,
                `${item.quantity}`,
                `${item.price.toFixed(2)}`,
                `${total}`,
            ];
            columns.forEach((text, i) => {
                doc.fontSize(10)
                    .text(text, 30 + itemColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), rowTop, {
                        width: itemColumnWidths[i],
                        align: 'center',
                    });
            });
            rowTop += 20;
        });

        // Order Totals Section
        doc.moveDown(1);
        doc.moveTo(30, rowTop + 10).lineTo(570, rowTop + 10).stroke();

        
        // Delivery Charges and Coupon Discount
        const deliveryCharges = 'Free' ;  
        const couponDiscount = order.couponDiscount || 0; 

        doc.fontSize(12).text(`Delivery Charges: ${deliveryCharges}`, 400, rowTop + 20, { align: 'right' });

        // Display coupon discount if applied
        if (couponDiscount > 0) {
            doc.fontSize(12).text(`Coupon Discount: -${couponDiscount.toFixed(2)}`, 400, rowTop + 40, { align: 'right' });
        }

        // Final Total Amount
        const totalAfterDiscount = (order.totalAmount - couponDiscount).toFixed(2);
        doc.fontSize(14).text(`Total: ${totalAfterDiscount}`, 400, rowTop + 70, {
            align: 'right',
            bold: true,
        });

        // Footer Section
        doc.moveDown(4);
        doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });
        doc.text('If you have any questions, contact us at armoredge@gmail.com', { align: 'center' });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage');
    }
};


///****** walletPay */

const walletPay = async(req,res)=>{
    try {
        const {totalAmount} = req.body
        console.log('totalAmount is ',totalAmount)

        const userWallet = await Wallet.findOne({user:req.session.user_id}).populate('user')
        console.log('ddds',userWallet)

        const wallet = await Wallet.findOneAndUpdate({user:req.session.user_id},{balance:userWallet.balance-totalAmount},{new:true})
        console.log('wallet amount is ',wallet)

        userWallet.transactions.push({
            amount:totalAmount,
            status:'success',
            type:'debit',
            walletFrom:'Wallet Pay'

        })

        await userWallet.save()

        res.status(200).json({success:true})
        
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
    add_toCart,
    retrunOrder,
    failedPayment,
    retryPage,
    retry_payment,
    retryCheckout,
    checkOut2,
    downloadInvoice,
    walletPay
    

}