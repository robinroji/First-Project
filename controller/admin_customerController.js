const mongoose = require('mongoose');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');

//***  USERS LIST  ********/
const loadCustomer = async(req,res)=>{
    try {

        const userData = await User.find({is_admin:false}).sort({createdAt:-1})
        res.render('customers',{user:userData});
        console.log(userData);
        

    } catch (error) {
        console.log('the error is ',error.message);
        return res.render('pageerror')

 
        
        
    }
}

//****** BLOCK USER */
const customerBlock = async(req,res)=>{
     
   try {
    await User.findByIdAndUpdate({_id:req.params.id},{
        $set:{
            session:false,
            block:true
        }

    })
    res.redirect('/admin/customer')
    
   } catch (error) {
    console.log(error.message);
     
   }
}
///******** UNBLOCK USER  */
const customerUnBlock = async(req,res)=>{

    try {
    await User.findByIdAndUpdate(req.params.id,{
        $set:{
            block:false
        }
    });
    res.redirect('/admin/customer',)
    
    } catch (error) {
        console.log(error.message);
              
    }
    
}


module.exports ={
    loadCustomer,
    customerBlock,
    customerUnBlock,

}

