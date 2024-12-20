const User = require('../model/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Order = require('../model/orderModel')
const Coupen = require('../model/coupenModel')

//************** ADMIN  GET LOGIN  *************/

const loadLogin = (req,res)=>{

try {

    if(req.session.admin){
        return res.redirect ('/admin/dashboard');
    }
    return res.render('login',{message:null});


    
} catch (error) {
    console.log(error.message);
    
    
}


}

//******* ADMIN POST LOGIN ************** */

const login = async (req,res)=>{

    console.log(' admin post login route working ');
    

    try {
             const {email,password}= req.body;
             
             
             const admin = await User.findOne({email:email,is_admin:1});  
             

             if (admin )
                
                {
                    console.log(password,' === ',admin.password);
                    
                const passwordMatch =await bcrypt.compare(password,admin.password)                
                if(passwordMatch)

                    {

                    req.session.admin = admin._id;
                    return res.render('admin_Dashboard')
                }else{
                    console.log('admin password is not matching ');
                    return res.render('login',{message:'password is incorrect'})
                }
             }else{
                console.log('admin is not verified ');
                return res.render ('login',{message:'email and password are incorrect '})
             }
    } catch (error) {
        console.log( error.message);
        return res.redirect ('/errorpage')
        
        
    }
}



//*********************DASHBOARD ****************************** */

const loadDashbord= async(req,res)=>{
   try {
    res.render('admin_Dashboard')
    
   } catch (error) {
    console.log(error.messge);
    
    return res.redirect('/errorpage')
    
   }
}

const logout = async(req,res)=>{
    try {
        
        req.session.destroy(error=>{
            if(error){

                console.log(error.message);
                return  res.render('/admin/login');
            }
           res.redirect('/admin/login')
            
        })
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}

const loadOrderList = async (req,res)=>{
    try {
        const orders = await Order.find().populate('user');
        console.log('Orders with populated user: ', orders);
        
        
        res.render('orderPage',{orders})
    } catch (error) {
        console.log(error.message);            
    }
}

//*******  ****************** */

const editOrder = async(req,res)=>{
    try {
        console.log('edit o');
        const order = await Order.findById(req.params.id).populate('user');
        console.log('the orders is ',order)

        res.render('orderDetailPage',{order});
       
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}

//******** deleteOrder from the order detail  */

const deleteOrder = async (req,res)=>{
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        console.log('reached the order cancel');
        
        return res.redirect('/admin/orderList')
        
    } catch (error) {
        console.log(error.message); 
    }
}

//*********  updateStatus   */

const updateStatus = async(req,res)=>{
    console.log('entering');
    
    try {
        console.log(req.params.id);
        const id = req.params.id

        const statusUpdate = await Order.findByIdAndUpdate(id,{$set:{status:req.body.status}},{new:true})
        res.redirect(`/admin/edit_order/${id}`)
        
        
    } catch (error) {
        console.log(error.message,"uuupdate");
        
        
    }
}

//*********   Create Coupen  *****/

const getCoupen = async(req,res)=>{
    try {

        console.log('create coupen page entered')
        const coupens = await Coupen.find({isActive:true})
        console.log('coupens are',coupens)
        res.render('coupen',{coupens})
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}

//************  add_Coupen  *************** */

const add_Coupen = async(req,res)=>{
    try {
        const admin = await User.findById(req.session.admin)

        const coupen = new Coupen({

            code:req.body.couponCode,
            discountPercentage:req.body.discount,
            expiryDate:req.body.expiryDate,
            minimumPurchaseAmount:req.body.minOrderValue,
            usedBy:admin


        })

        coupen.save()
        return res.redirect('/admin/coupen')
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
        
    }
}

//****   Load Add coupen  ******/

const load_add_Coupen = async(req,res)=>{
    try {
        res.render('addCoupen')
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}

//*********  load_edit_Coupen ******** */

const load_edit_Coupen = async(req,res)=>{
    try {
        const coupens = await Coupen.findById(req.params.id)

        console.log('load edit ******************************************9999')
        
        res.render('edit_Coupen',{coupens})
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


//****************    edit_Coupen    *********************/

const edit_Coupen = async(req,res)=>{

    try {
        console.log('edit page entered ')
        const update = await Coupen.findByIdAndUpdate(req.params.id,{
            code:req.body.code,
            discountPercentage:req.body.discountPercentage,
            expiryDate:req.body.expiryDate,
            minimumPurchaseAmount:req.body.minimumPurchaseAmount,
        },
             {new:true}
    )
        return res.redirect('/admin/coupen')
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


//******** delete_Coupen */

const delete_Coupen = async(req,res)=>{
    try {
        console.log('the id is ',req.params.id)
        const coupenId= await Coupen.findByIdAndDelete(req.params.id)
        return res.redirect('/admin/coupen')
        
    } catch (error) {
        console.log('error found heere in the delete coupen')
        console.log(error.messsage)
        return res.redirect('/errorPage')
        
    }
}


















module.exports ={
    loadLogin,
    login,
    loadDashbord,
    logout,
    loadOrderList,
    editOrder,
    deleteOrder,
    updateStatus,
    getCoupen,
    add_Coupen,
    load_add_Coupen,
    load_edit_Coupen,
    edit_Coupen,
    delete_Coupen

}