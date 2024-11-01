const User = require('../model/userModel')
const bcrypt= require('bcrypt');
const Address = require('../model/addressModel');
const addressModel = require('../model/addressModel');



//**********   GET ADDRESS PAGE ****************************

const  get_adress = async (req,res)=>{

    try {
        const user = await User.findById(req.session.user_id).populate('address')
        
        console.log('adress is ',user)
        console.log('ENTERED INTO THE MANAGE ADDRESS PAGE ');
        
        res.render('addressPage',{user})
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')

        
        
    }
}

//**  Get add address */

const get_add_address = async (req,res)=>{
    res.render('addAddress')
}

//***   Post add address */

const post_add_address = async (req,res)=>{

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

    return res.redirect('/addressPage')

    


    
} catch (error) {
    console.log(error.message);
    res.redirect('/errorPage')
    
    
}
  

}

//**  Edit address */

const edit_address = async(req,res)=>{
    console.log('hey welcom;e')

    try {
        
        const user = await User.findById(req.session.user_id)
        if(!user){
            console.log('user not found')
            res.redirect('/errorPage')
        }
    const address = await Address.findByIdAndUpdate(req.params.id,{


            houseName:req.body.houseName,
            pinCode:req.body.pinCode,
            po:req.body.po,
            location:req.body.location,
            address:req.body.address,
            state:req.body.state
    },

        {new:true}
)

return res.redirect('/addressPage')


    } catch (error) {
        console.log(error.message);
        console.log('error found in the edit address route')
            
    }

    

}



const delete_address = async(req,res)=>{
    try {
        console.log('delete entered');
        
        const trial  = await addressModel.findOneAndDelete(req.params.id)
        console.log('the trial is ',trial);
        return res.redirect('/addressPage')
     
    } catch (error) {
        console.log(error.message);
        
        
    }
}


module.exports ={
    get_adress,
    get_add_address,
    post_add_address,
    edit_address,
    delete_address
    
}