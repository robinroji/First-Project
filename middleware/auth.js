const User = require('../model/userModel')
const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user_id){

            const user =await User.findById(req.session.user_id)
            if(user.block){
                console.log('auth islogin working and user is',user);
                req.session.user_id=null
                res.redirect('/login'); 
            
            }else{
                next()
            }
           
            
        }else{
            res.redirect('/login');  
        }
       
        

    } catch (error) {
        console.log('not working');
        
        console.log(error.message);
        
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/dash');  
        }else{
            next()
        }
       
    } catch (error) {
        console.log(error.message);
        
    }
}

 



module.exports ={

    isLogin,
    isLogout,

}