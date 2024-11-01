const express = require('express')
const user_route = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { profile } = require('console');

//** REQUIRE PATHS  */
const passport = require('../config/passport')
const config = require('../config/config')
const auth= require('../middleware/auth');
const userController = require('../controller/userController')
const addressController = require('../controller/addressController')
const cartController = require('../controller/cartController')
const productController = require('../controller/productController')

//** MIDDLEWARE **/
user_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}))
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}));
user_route.use(express.static('./public'))

const pasport = require('passport')
user_route.use(pasport.initialize())
user_route.use(pasport.session())

//**view engine**/
user_route.set('view engine','ejs');
user_route.set('views','./views/users');


//**user register**/
user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.userRegister)


//**user login**/
user_route.get('/',auth.isLogout,userController.landingPage)
user_route.get('/login',auth.isLogout,userController.get_login)
user_route.post('/login',userController.user_login)


//**verify mail**/
user_route.get('/verify',userController.verifMail)


//**otp verification**/
user_route.get('/verify-otp',userController.otp_verify)
user_route.post('/verify-otp',userController.post_otp)


//**resend otp verification **/
user_route.get('/resend-otp',userController.get_resend_otp)
user_route.post('/resend-otp',userController.resend_otp)


//**logout**/
user_route.get('/logout',userController.logout)


//**errorPage handling**/
user_route.get('/errorPage',userController.errorpage)


//** inside the page**/
user_route.get('/dash',userController.landingPage)
user_route.get('/shop',userController.shop)
user_route.get('/kids',userController.get_kids)
user_route.get('/mens',userController.get_mens)
user_route.get('/womens',userController.get_womens)

//**product page**/
user_route.get('/productPage/:id',userController.get_productPage)

//** GOOGLE AUTHENTICATION **/
user_route.get('/auth/google',passport.authenticate("google",{scope:
    ['profile','email']
}))
user_route.get('/auth/google/callback',
    passport.authenticate("google",{
        failureRedirect : '/login'
    }),
    (req,res)=>{
        req.session.user_id = req.user._id;
        res.redirect('/dash')
    }
)


//****  Adress Management  */
user_route.get('/addressPage',auth.isLogin,addressController.get_adress)
user_route.get('/get_add_address',auth.isLogin,addressController.get_add_address)
user_route.post('/post_add_address',auth.isLogin,addressController.post_add_address)
user_route.post('/edit_address/:id',auth.isLogin,addressController.edit_address)
user_route.post('/delete_address/:id',auth.isLogin,addressController.delete_address) 
 
//*** Profile Management  */
user_route.get('/user_profile',auth.isLogin,userController.get_profile)
user_route.post('/personal_edit',auth.isLogin,userController.personalEdit)
user_route.post('/contact_edit',auth.isLogin,userController.contactEdit)
user_route.post('/pass_edit',auth.isLogin,userController.passEdit)

//** Cart Management  */
user_route.get('/cart_page',auth.isLogin,cartController.cart_Page)
user_route.get('/move_to_cart/:id',auth.isLogin,cartController.move_to_cart)
user_route.get('/delete_product/:id',auth.isLogin,cartController.delete_product)
user_route.post('/update-quantity',auth.isLogin,cartController.qt_increase)

//** Check Out */
user_route.get('/checkOut',userController.loadCheckout)
user_route.post('/orderAddress',userController.orderAddress)
user_route.get('/edit_editAddress/:id',userController.load_Editaddress)
user_route.post('/edit_address',userController.edit_Editaddress)
user_route.post('/select_address/:id',userController.select_address)
user_route.post('/payment/:id',userController.payment)

//***** Order ****/
user_route.post('/placeOrder',userController.placeOrder)
user_route.get('/orders',auth.isLogin,userController.loadOrders)
user_route.get("/Order_DetailPage/:id",userController.OrderDetailPage)
user_route.post('/updateOrder/:id',userController.updateOrder)
user_route.post('/deleteOrder/:id',userController.deleteOrder)




module.exports = user_route;

