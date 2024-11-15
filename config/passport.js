const User = require("../model/userModel")
const passport = require('passport');

const GoogleStrategy = require("passport-google-oauth20").Strategy

require('dotenv').config()  //do we need this ????????? i have alredy return this  in server js

passport.use(new GoogleStrategy({
        clientID      : process.env.GOOGLE_CLIENT_ID,
        clientSecret  : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL   : 'http://localhost:3000/auth/google/callback' ,
    },

    async(accessToken,refreshhToken,profile,done)=>{

        try {

            let user = await User.findOne({googleId:profile.id})  //profile_id  is google id
            let existUser = await User.findOne({email:profile.emails[0].value})
            console.log("profile => \n",profile);
            console.log("Userdata of user who alredy signedup from google => \n",user);
            if(existUser){
                return done(null,existUser)
            }
            if(!user){
                const user = new  User({
                    firstname: profile.name.givenName,
                    lastame: profile.name.familyName,
                    email : profile.emails[0].value,
                    googleId : profile.id,
                    is_verified : true,
                    is_admin : false
                });
                const userData = await user.save();
                console.log('new userData who jst now signed- in from google  => \n',userData);
                

                return done (null,user)

            }else{

                return done(null,user)

            }
        } catch (error) {
            return done(error,null)
            
        }
    }
))


passport.serializeUser((user,done)=>{ 
    done(null,user._id)  //assigne user details  value to session

})

passport.deserializeUser((id,done)=>{
    User.findById(id)// to fetching user details from session 
    .then(user=>{
        done(null,user)
    })
    .catch((err)=>{
        done(err,null)
    })
}) 

module.exports = passport;