const Cart = require('../model/cartModel');
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Coupen = require('../model/coupenModel')


// const calculateCartTotals = (cart) => {
   
   
//     // cart.discount = cart.totalRegularPrice - cart.totalSalePrice;
//     // cart.totalItems = cart.items.length;
// };


//****  Cart Pag*** */

const cart_Page = async(req,res)=>{
    console.log('cart page enetered');
    

    try {
        

        const cart = await Cart.findOne({user:req.session.user_id}).populate('items.product')
        console.log('cart is ',cart)

        if(cart&&cart.items.length>0){
            cart.totalSalesPrice = cart.items.reduce((total, item) => total +  item.totalPrice * item.quantity, 0);
         cart.totalRegularPrice = cart.items.reduce((total, item) => total + item.product.product_regular_price * item.quantity, 0);

        }else{
            cart.totalSalesPrice=0;
            cart.totalRegularPrice=0
        }

        // console.log('the cart is ',cart.items[0].totalPrice) 
    
        
        
        res.render('cartPage',{userCart:cart});
        
    } catch (error) {
        console.log(error.message);

     return res.redirect('/errorPage')
        
    }

}


//********* Move to cart *****/

const move_to_cart = async(req,res)=>{
    console.log('loging into the cart page');
    
    

 
    try { 
        const user = await User.findOne({_id:req.session.user_id}) 

        console.log('the id from params is',req.params.id)
        // console.log('the user 1',user)
         
         

            const product = await Product.findById(req.params.id)
            console.log('the product is : ',product);

            const stock =  product.product_quantity<=0;

            if(stock){
                console.log('out of stock');
                return res.render('productPage',{product,msg:'Out of stock'})
                
            }
            

            let cart = await Cart.findOne({user:req.session.user_id})
            // console.log('the user 2',cart);
            

            if(!cart){
                cart = new Cart({
                    user:user._id,
                    items:[],
                    totalRegularPrice :product.product_sale_price*product.product_quantity,
                    totalSalesPrice :0,
                    discount : 0,
                    totalItems : 0,

                })
            }
            const existing = await Cart.findOne({ 'items.product': product });

            if (existing) {
                console.log('Product exists in the cart');
                req.flash('success_msg','Product Alredy exist in the Cart!')
                res.redirect('/cart_page')
                    

            }else{



                
            cart.items.push({

                product:product._id,
                quantity:1,
                totalPrice:product.product_sale_price

            })
           

            // cart.totalRegularPrice = cart.items.reduce((total, item) => total + item.product.product_regular_price * item.quantity, 0);
            // cart.totalSalesPrice = cart.items.reduce((total, item) => total +  item.product.product_sale_price * item.quantity, 0);
            
            await cart.save();
            console.log('the sale price of the product is ',cart);
            
            res.redirect('/cart_page')


            }
            



        
    } catch (error) {

        console.log(error.message);
        return res.redirect('/errorPage')
        
    }
}
//******  Remov product from Cart  *****////


const   delete_product = async(req,res)=>{

    const productId = req.params.id;
    const userId = req.session.user_id
    console.log('prouductId is' ,productId);
    console.log('userId is',userId);
    
    

    try {

        await Cart.findOneAndUpdate(
            { user: userId },                    
            {$pull: { items: { product: productId } },$set:{totalSalesPrice:0}},  
           
            { new: true }                          
        );
        
       
        
        
       
        res.redirect('/cart_page')
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}

//****  increase quantity */

const qt_increase = async (req,res)=>{
    console.log('enterd into the quantity');
    
    const { itemId, change } = req.body;
    console.log('ddd',change);

    try {
        const cart = await Cart.findOne({user:req.session.user_id}).populate('items.product')

        if(!cart){
            return res.json({
                success: false,
                msg : 'Cart not Found'
            })
        }

        const item = cart.items.find((item)=>{  
            return item._id.toString() === itemId
        })

        const newQuantity = item.quantity + change;


        if (newQuantity < 1) {
            item.quantity = 1; 

        } else if (newQuantity > item.product.product_quantity) {

            item.quantity = item.product.product_quantity; // Cap quantity at available stock
            return res.json({
                success: false,
                totalAmount :  cart.totalSalesPrice,
                totalRegulaarAmount :  cart.totalRegularPrice,
                quantityUpdate: item.quantity,
                msg: `Only ${item.product.product_quantity} units available`
            });
        } else if (newQuantity > 5) {
            item.quantity = 5; 

            return res.json({
                success: false,
                totalAmount :  cart.totalSalesPrice,
                totalRegulaarAmount :  cart.totalRegularPrice,
                quantityUpdate: item.quantity,
                msg: `You can only buy a maximum of 5 units of this product`
            });
        } else {
            item.quantity = newQuantity; 
        }

        cart.totalRegularPrice = cart.items.reduce((total, item) => total + item.product.product_regular_price * item.quantity, 0);
        cart.totalSalesPrice = cart.items.reduce((total, item) => total +  item.product.product_sale_price * item.quantity, 0);

        await cart.save()
        

        res.json({
            success: true,
            quantityUpdate: item.quantity,
            totalAmount :  cart.totalSalesPrice,
            totalRegulaarAmount :  cart.totalRegularPrice,
        })

    } catch (error) {
        console.log(error.message);
        
    }
}


module.exports={

    cart_Page,
    move_to_cart,
    delete_product,
    qt_increase

}